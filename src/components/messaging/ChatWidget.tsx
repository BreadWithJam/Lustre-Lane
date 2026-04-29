'use client'

import { useState } from 'react'
import { ChatInterface } from './ChatInterface'
import type { MessageThread } from '@/types'

interface ChatWidgetProps {
  serviceContext?: string
  initialThread?: MessageThread | null
}

export function ChatWidget({ serviceContext, initialThread }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false)
  // Persist the active thread so closing/reopening the widget doesn't lose conversation state
  const [activeThread, setActiveThread] = useState<MessageThread | null>(initialThread || null)

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-salon-brown text-white shadow-lg hover:bg-salon-brown/90 transition-colors flex items-center justify-center"
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
        aria-expanded={isOpen}
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}
      </button>

      {/* Chat panel — kept mounted once opened so the Firestore subscription persists */}
      <div
        className={`fixed bottom-24 right-6 z-50 w-[360px] h-[520px] rounded-2xl shadow-2xl overflow-hidden border border-salon-cream transition-all duration-200 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden={!isOpen}
      >
        <ChatInterface
          thread={activeThread}
          serviceContext={serviceContext}
          onClose={() => setIsOpen(false)}
          onThreadCreated={setActiveThread}
        />
      </div>
    </>
  )
}
