'use client'

import Image from 'next/image'
import type { Message } from '@/types'

interface MessageBubbleProps {
  message: Message
}

function formatTime(date: Date | string): string {
  const d = date instanceof Date ? date : new Date(date)
  if (!d || isNaN(d.getTime())) return ''
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(d)
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isClient = message.senderType === 'client'

  return (
    <div
      className={`flex ${isClient ? 'justify-end' : 'justify-start'} mb-3`}
      data-testid="message-bubble"
      data-sender={message.senderType}
    >
      <div className={`max-w-[75%] ${isClient ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        {/* Sender name (admin only) */}
        {!isClient && message.senderName && (
          <span className="text-xs text-salon-warm-gray px-1">{message.senderName}</span>
        )}

        {/* Bubble */}
        <div
          className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
            isClient
              ? 'bg-salon-brown text-white rounded-br-sm'
              : 'bg-salon-cream text-salon-brown rounded-bl-sm'
          }`}
        >
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        </div>

        {/* Attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-1">
            {message.attachments.map((att) => (
              <AttachmentPreview key={att.id} attachment={att} compact />
            ))}
          </div>
        )}

        {/* Timestamp + read status */}
        <div className={`flex items-center gap-1 px-1 ${isClient ? 'flex-row-reverse' : 'flex-row'}`}>
          <span className="text-xs text-salon-warm-gray">{formatTime(message.createdAt)}</span>
          {isClient && message.readAt && (
            <svg className="w-3.5 h-3.5 text-salon-gold" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
            </svg>
          )}
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// AttachmentPreview – also exported for standalone use
// ---------------------------------------------------------------------------

interface AttachmentPreviewProps {
  attachment: {
    id: string
    fileName: string
    fileUrl: string
    fileType: string
    fileSize: number
  }
  compact?: boolean
  onRemove?: () => void
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function AttachmentPreview({ attachment, compact = false, onRemove }: AttachmentPreviewProps) {
  const isImage = attachment.fileType.startsWith('image/')

  if (isImage) {
    return (
      <div className={`relative rounded-lg overflow-hidden ${compact ? 'w-20 h-20' : 'w-40 h-40'}`}>
        <Image
          src={attachment.fileUrl}
          alt={attachment.fileName}
          fill
          className="object-cover"
        />
        {onRemove && (
          <button
            onClick={onRemove}
            className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-black/80"
            aria-label={`Remove ${attachment.fileName}`}
          >
            ×
          </button>
        )}
      </div>
    )
  }

  return (
    <div
      className={`flex items-center gap-2 bg-salon-cream rounded-lg px-3 py-2 ${compact ? 'text-xs' : 'text-sm'}`}
    >
      <svg className="w-4 h-4 text-salon-brown flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
      </svg>
      <div className="min-w-0">
        <p className="truncate text-salon-brown font-medium">{attachment.fileName}</p>
        {!compact && <p className="text-salon-warm-gray">{formatFileSize(attachment.fileSize)}</p>}
      </div>
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-1 text-salon-warm-gray hover:text-red-500 flex-shrink-0"
          aria-label={`Remove ${attachment.fileName}`}
        >
          ×
        </button>
      )}
    </div>
  )
}
