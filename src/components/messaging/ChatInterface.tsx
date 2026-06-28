'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { SaveConversationPrompt } from '@/components/auth/SaveConversationPrompt'
import { MessageBubble } from './MessageBubble'
import { MessageComposer } from './MessageComposer'
import { ContactCaptureForm } from './ContactCaptureForm'
import type { Message, MessageThread } from '@/types'

interface ChatInterfaceProps {
  thread?: MessageThread | null
  serviceContext?: string
  onClose?: () => void
  onThreadCreated?: (thread: MessageThread) => void
}

type ChatState = 'loading' | 'contact-capture' | 'thread-list' | 'chatting'

function formatRelativeTime(date: Date): string {
  if (!date || isNaN(date.getTime())) return ''
  const diff = Date.now() - date.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return date.toLocaleDateString()
}

export function ChatInterface({ thread: initialThread, serviceContext, onClose, onThreadCreated }: ChatInterfaceProps) {
  const { user, loading: authLoading } = useAuth()
  const [chatState, setChatState] = useState<ChatState>(initialThread ? 'chatting' : 'loading')
  const [thread, setThread] = useState<MessageThread | null>(initialThread || null)
  const [threads, setThreads] = useState<MessageThread[]>([])
  const [messages, setMessages] = useState<Message[]>(initialThread?.messages || [])
  const [error, setError] = useState<string | null>(null)
  const [showSavePrompt, setShowSavePrompt] = useState(false)
  const [fetchedThreads, setFetchedThreads] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const parseThreadDates = useCallback((t: MessageThread): MessageThread => {
    const safeDate = (v: unknown): Date => {
      const d = new Date(v as string)
      return isNaN(d.getTime()) ? new Date() : d
    }
    return {
      ...t,
      lastMessageAt: safeDate(t.lastMessageAt),
      createdAt: safeDate(t.createdAt),
      messages: t.messages?.map((m) => ({
        ...m,
        createdAt: safeDate(m.createdAt),
        readAt: m.readAt ? safeDate(m.readAt) : undefined,
      })),
    }
  }, [])

  // Restore thread on mount — runs once auth state is resolved
  useEffect(() => {
    if (initialThread || fetchedThreads || authLoading) return
    setFetchedThreads(true)

    const storedId = localStorage.getItem('chat_thread_id')

    const restoreFromStorage = async () => {
      if (!storedId) return false
      const r = await fetch(`/api/messages/${storedId}`)
      if (!r.ok) return false
      const json = await r.json()
      if (!json?.data) return false
      const t: MessageThread = json.data
      const parsed = parseThreadDates(t)
      setThread(parsed)
      setMessages(parsed.messages ?? [])
      setChatState('chatting')
      // Prompt sign-in since this is a guest restoring from localStorage
      setShowSavePrompt(true)
      return true
    }

    const fetchLinkedThreads = async () => {
      if (!user) return false
      const token = await user.getIdToken(true)

      // Do NOT auto-link the localStorage thread here — that could assign
      // another user's thread to this account. Linking only happens when the
      // user explicitly saves via SaveConversationPrompt.

      const res = await fetch('/api/auth/my-thread', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) return false
      const json = await res.json()
      const data: MessageThread[] = (json.data ?? []).map(parseThreadDates)

      if (data.length === 1) {
        setThread(data[0])
        setMessages(data[0].messages ?? [])
        localStorage.setItem('chat_thread_id', data[0].id)
        setChatState('chatting')
        return true
      } else if (data.length > 1) {
        setThreads(data)
        setChatState('thread-list')
        return true
      }
      return false
    }

    const run = async () => {
      try {
        let found = false
        if (user) {
          found = await fetchLinkedThreads()
          if (!found) {
            // Signed-in user with no linked threads — don't load a stale
            // localStorage thread that may belong to a different account
            localStorage.removeItem('chat_thread_id')
            setChatState('contact-capture')
          }
        } else {
          found = await restoreFromStorage()
          if (!found) setChatState('contact-capture')
        }
      } catch {
        setChatState('contact-capture')
      }
    }

    run()
    // authLoading resolving is the trigger — re-run only when it flips to false
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, parseThreadDates])

  const openThread = useCallback((t: MessageThread) => {
    const parsed = parseThreadDates(t)
    setThread(parsed)
    setMessages(parsed.messages ?? [])
    localStorage.setItem('chat_thread_id', parsed.id)
    setChatState('chatting')
  }, [parseThreadDates])

  const handleContactSubmit = useCallback(
    async (contactData: { name: string; email: string; phone?: string; firstMessage: string }) => {
      setError(null)
      try {
        const res = await fetch('/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clientEmail: contactData.email,
            clientName: contactData.name,
            clientPhone: contactData.phone,
            content: contactData.firstMessage,
            senderType: 'client',
            senderName: contactData.name,
          }),
        })

        if (!res.ok) throw new Error('Failed to start conversation')

        const json = await res.json()
        const newThread: MessageThread = json.data.thread
        const firstMessage: Message = {
          ...json.data.message,
          createdAt: new Date(json.data.message.createdAt ?? Date.now()),
        }

        // Persist threadId locally so tab switches don't lose context
        localStorage.setItem('chat_thread_id', newThread.id)

        // If already signed in, link the thread to the user immediately
        if (user) {
          const token = await user.getIdToken()
          await fetch('/api/auth/link-thread', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ threadId: newThread.id }),
          })
        }

        setThread(parseThreadDates(newThread))
        setMessages([firstMessage])
        onThreadCreated?.(newThread)
        setChatState('chatting')

        if (!user) setShowSavePrompt(true)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong')
      }
    },
    [onThreadCreated, user]
  )

  const handleSend = useCallback(
    async (content: string, attachments: { id: string; fileName: string; fileUrl: string; fileType: string; fileSize: number; file: File }[]) => {
      if (!thread) return
      setError(null)

      const sentContent = content || (attachments.length > 0 ? `[${attachments.length} attachment(s)]` : '')

      const optimistic: Message = {
        id: `optimistic-${Date.now()}`,
        threadId: thread.id,
        senderType: 'client',
        content: sentContent,
        createdAt: new Date(),
      }
      setMessages((prev) => [...prev, optimistic])

      try {
        const res = await fetch(`/api/messages/${thread.id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: sentContent,
            senderType: 'client',
            attachments: attachments.map((a) => ({
              id: a.id,
              file_name: a.fileName,
              file_url: a.fileUrl,
              file_type: a.fileType,
              file_size: a.fileSize,
            })),
          }),
        })

        if (!res.ok) {
          setMessages((prev) => prev.filter((m) => m.id !== optimistic.id))
          throw new Error('Failed to send message')
        }

        const json = await res.json()
        const saved: Message = json.data
        setMessages((prev) =>
          prev.map((m) => (m.id === optimistic.id ? { ...saved, createdAt: new Date(saved.createdAt) } : m))
        )
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to send message')
      }
    },
    [thread]
  )

  if (authLoading || chatState === 'loading') {
    return (
      <div className="flex flex-col h-full bg-white items-center justify-center">
        <div className="w-6 h-6 border-2 border-salon-brown border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Chat with salon"
      className="flex flex-col h-full bg-white"
      data-testid="chat-interface"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-salon-cream bg-salon-brown text-white">
        <div className="flex items-center gap-3">
          {chatState === 'chatting' && threads.length > 0 && (
            <button
              onClick={() => setChatState('thread-list')}
              className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
              aria-label="Back to conversations"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          <div className="w-8 h-8 rounded-full bg-salon-gold flex items-center justify-center text-sm font-bold">
            S
          </div>
          <div>
            <p className="font-semibold text-sm">
              {chatState === 'thread-list' ? 'Your Conversations' : 'Salon Team'}
            </p>
            {chatState !== 'thread-list' && (
              <p className="text-xs text-white/70">Usually replies within an hour</p>
            )}
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
            aria-label="Close chat"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Body */}
      {chatState === 'contact-capture' && (
        <ContactCaptureForm
          serviceContext={serviceContext}
          onSubmit={handleContactSubmit}
          error={error}
        />
      )}

      {chatState === 'thread-list' && (
        <div className="flex-1 overflow-y-auto">
          <ul aria-label="Past conversations">
            {threads.map((t) => {
              const lastMsg = t.messages?.[t.messages.length - 1]
              return (
                <li key={t.id}>
                  <button
                    onClick={() => openThread(t)}
                    className="w-full text-left px-4 py-4 border-b border-salon-cream hover:bg-salon-cream/40 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-sm font-semibold text-salon-brown truncate">
                        {t.clientName ?? t.clientEmail}
                      </span>
                      <span className="text-xs text-salon-warm-gray shrink-0">
                        {formatRelativeTime(new Date(t.lastMessageAt))}
                      </span>
                    </div>
                    {lastMsg && (
                      <p className="text-xs text-salon-warm-gray truncate">{lastMsg.content}</p>
                    )}
                  </button>
                </li>
              )
            })}
          </ul>
          <div className="p-4">
            <button
              onClick={() => setChatState('contact-capture')}
              className="w-full rounded-full border border-salon-brown px-4 py-2 text-sm font-semibold text-salon-brown hover:bg-salon-brown hover:text-white transition-colors"
            >
              + New Conversation
            </button>
          </div>
        </div>
      )}

      {chatState === 'chatting' && (
        <>
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1" aria-live="polite" aria-label="Messages">
            {messages.length === 0 && (
              <p className="text-center text-salon-warm-gray text-sm py-8">
                No messages yet. Say hello!
              </p>
            )}
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            <div ref={messagesEndRef} />
          </div>

          {showSavePrompt && thread && (
            <SaveConversationPrompt
              threadId={thread.id}
              onSaved={() => setShowSavePrompt(false)}
              onDismiss={() => setShowSavePrompt(false)}
            />
          )}

          {error && (
            <div className="px-4 py-2 bg-red-50 text-red-600 text-xs text-center">
              {error}
            </div>
          )}

          <MessageComposer onSend={handleSend} />
        </>
      )}
    </div>
  )
}