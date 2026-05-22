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

type ChatState = 'contact-capture' | 'chatting'

export function ChatInterface({ thread: initialThread, serviceContext, onClose, onThreadCreated }: ChatInterfaceProps) {
  const { user, loading: authLoading } = useAuth()
  const [chatState, setChatState] = useState<ChatState>(initialThread ? 'chatting' : 'contact-capture')
  const [thread, setThread] = useState<MessageThread | null>(initialThread || null)
  const [messages, setMessages] = useState<Message[]>(initialThread?.messages || [])
  const [error, setError] = useState<string | null>(null)
  const [showSavePrompt, setShowSavePrompt] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // If user is signed in, fetch their existing thread
  useEffect(() => {
    if (!user || initialThread) return

    const fetchMyThread = async () => {
      try {
        const token = await user.getIdToken()
        const res = await fetch('/api/auth/my-thread', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) return
        const json = await res.json()
        if (json.data) {
          setThread(json.data)
          setMessages(json.data.messages ?? [])
          setChatState('chatting')
        }
      } catch {
        // No thread yet — stay on contact form
      }
    }

    fetchMyThread()
  }, [user, initialThread])

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
        setThread(newThread)
        setMessages([firstMessage])
        onThreadCreated?.(newThread)
        setChatState('chatting')

        // Show save prompt only if not already signed in
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

  // Show nothing while checking auth state to avoid flash
  if (authLoading) {
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
          <div className="w-8 h-8 rounded-full bg-salon-gold flex items-center justify-center text-sm font-bold">
            S
          </div>
          <div>
            <p className="font-semibold text-sm">Salon Team</p>
            <p className="text-xs text-white/70">Usually replies within an hour</p>
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
      {chatState === 'contact-capture' ? (
        <ContactCaptureForm
          serviceContext={serviceContext}
          onSubmit={handleContactSubmit}
          error={error}
        />
      ) : (
        <>
          {/* Messages */}
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

          {/* Save conversation prompt */}
          {showSavePrompt && thread && (
            <SaveConversationPrompt
              threadId={thread.id}
              onSaved={() => setShowSavePrompt(false)}
              onDismiss={() => setShowSavePrompt(false)}
            />
          )}

          {/* Error banner */}
          {error && (
            <div className="px-4 py-2 bg-red-50 text-red-600 text-xs text-center">
              {error}
            </div>
          )}

          {/* Composer */}
          <MessageComposer onSend={handleSend} />
        </>
      )}
    </div>
  )
}
