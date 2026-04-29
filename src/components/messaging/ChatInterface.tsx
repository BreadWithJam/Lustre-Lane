'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { MessageBubble } from './MessageBubble'
import { MessageComposer } from './MessageComposer'
import { ContactCaptureForm } from './ContactCaptureForm'
import type { Message, MessageThread } from '@/types'

interface ChatInterfaceProps {
  /** Pre-existing thread to open. If omitted, a new thread will be created on first send. */
  thread?: MessageThread | null
  /** Pre-fill the service name in the contact form */
  serviceContext?: string
  onClose?: () => void
  /** Called when a new thread is created so the parent can persist it */
  onThreadCreated?: (thread: MessageThread) => void
}

type ChatState = 'contact-capture' | 'chatting'

export function ChatInterface({ thread: initialThread, serviceContext, onClose, onThreadCreated }: ChatInterfaceProps) {
  const [chatState, setChatState] = useState<ChatState>(initialThread ? 'chatting' : 'contact-capture')
  const [thread, setThread] = useState<MessageThread | null>(initialThread || null)
  const [messages, setMessages] = useState<Message[]>(initialThread?.messages || [])
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const unsubscribeRef = useRef<Unsubscribe | null>(null)

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Subscribe to real-time message updates once we have a thread
  useEffect(() => {
    if (!thread) return

    // Clean up any previous subscription before starting a new one
    unsubscribeRef.current?.()
    unsubscribeRef.current = null

    const threadId = thread.id
    const messagesRef = collection(db, 'message_threads', threadId, 'messages')
    const q = query(messagesRef, orderBy('created_at', 'asc'))

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const updated: Message[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data()
          return {
            id: docSnap.id,
            threadId,
            senderType: data.sender_type,
            senderName: data.sender_name ?? undefined,
            content: data.content,
            attachments: data.attachments?.map((att: {
              id: string
              file_name: string
              file_url: string
              file_type: string
              file_size: number
            }) => ({
              id: att.id,
              fileName: att.file_name,
              fileUrl: att.file_url,
              fileType: att.file_type,
              fileSize: att.file_size,
            })),
            readAt: data.read_at ? new Date(data.read_at.seconds * 1000) : undefined,
            createdAt: data.created_at ? new Date(data.created_at.seconds * 1000) : new Date(),
          }
        })
        setMessages(updated)
      },
      (err) => {
        console.error('Realtime subscription error:', err)
        setError('Lost connection. Messages may be delayed.')
      }
    )

    unsubscribeRef.current = unsubscribe

    return () => {
      unsubscribe()
      unsubscribeRef.current = null
    }
  }, [thread?.id])

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
        setThread(newThread)
        onThreadCreated?.(newThread)
        setChatState('chatting')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong')
      }
    },
    [onThreadCreated]
  )

  const handleSend = useCallback(
    async (content: string, attachments: { id: string; fileName: string; fileUrl: string; fileType: string; fileSize: number; file: File }[]) => {
      if (!thread) return
      setError(null)

      try {
        // For now we send text content; file upload to storage would be wired here
        const res = await fetch(`/api/messages/${thread.id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: content || (attachments.length > 0 ? `[${attachments.length} attachment(s)]` : ''),
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

        if (!res.ok) throw new Error('Failed to send message')
        // Real-time listener will update messages automatically
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to send message')
      }
    },
    [thread]
  )

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
