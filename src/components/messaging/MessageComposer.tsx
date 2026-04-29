'use client'

import { useState, useRef } from 'react'
import { AttachmentPreview } from './MessageBubble'

const PRESET_PROMPTS = [
  { label: 'Consultation', text: "Hi! I'd like to schedule a consultation." },
  { label: 'Booking', text: "I'd like to book an appointment." },
  { label: 'Follow-up', text: "I'm following up on my recent visit." },
]

interface PendingAttachment {
  id: string
  fileName: string
  fileUrl: string
  fileType: string
  fileSize: number
  file: File
}

interface MessageComposerProps {
  onSend: (content: string, attachments: PendingAttachment[]) => Promise<void>
  disabled?: boolean
  placeholder?: string
}

export function MessageComposer({ onSend, disabled = false, placeholder = 'Type a message…' }: MessageComposerProps) {
  const [text, setText] = useState('')
  const [attachments, setAttachments] = useState<PendingAttachment[]>([])
  const [sending, setSending] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handlePreset = (promptText: string) => {
    setText(promptText)
    textareaRef.current?.focus()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const newAttachments: PendingAttachment[] = files.map((file) => ({
      id: `${Date.now()}-${file.name}`,
      fileName: file.name,
      fileUrl: URL.createObjectURL(file),
      fileType: file.type,
      fileSize: file.size,
      file,
    }))
    setAttachments((prev) => [...prev, ...newAttachments])
    // Reset input so same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const removeAttachment = (id: string) => {
    setAttachments((prev) => {
      const att = prev.find((a) => a.id === id)
      if (att) URL.revokeObjectURL(att.fileUrl)
      return prev.filter((a) => a.id !== id)
    })
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    const trimmed = text.trim()
    if (!trimmed && attachments.length === 0) return
    if (sending || disabled) return

    setSending(true)
    try {
      await onSend(trimmed, attachments)
      setText('')
      setAttachments([])
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const canSend = (text.trim().length > 0 || attachments.length > 0) && !sending && !disabled

  return (
    <form onSubmit={handleSubmit} className="border-t border-salon-cream bg-white p-3 space-y-2">
      {/* Preset prompts */}
      <div className="flex gap-2 flex-wrap">
        {PRESET_PROMPTS.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => handlePreset(p.text)}
            disabled={disabled}
            className="text-xs px-3 py-1 rounded-full border border-salon-brown text-salon-brown hover:bg-salon-brown hover:text-white transition-colors disabled:opacity-50"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Attachment previews */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 px-1">
          {attachments.map((att) => (
            <AttachmentPreview
              key={att.id}
              attachment={att}
              onRemove={() => removeAttachment(att.id)}
            />
          ))}
        </div>
      )}

      {/* Input row */}
      <div className="flex items-end gap-2">
        {/* File upload */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className="p-2 text-salon-warm-gray hover:text-salon-brown transition-colors disabled:opacity-50 flex-shrink-0"
          aria-label="Attach file"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.pdf,.doc,.docx"
          onChange={handleFileChange}
          className="hidden"
          aria-label="File upload"
        />

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className="flex-1 resize-none rounded-xl border border-salon-cream bg-salon-cream/50 px-4 py-2.5 text-sm text-salon-brown placeholder-salon-warm-gray focus:outline-none focus:ring-2 focus:ring-salon-brown/30 disabled:opacity-50 max-h-32 overflow-y-auto"
          style={{ minHeight: '40px' }}
          aria-label="Message input"
        />

        {/* Send button */}
        <button
          type="submit"
          disabled={!canSend}
          className="p-2.5 rounded-xl bg-salon-brown text-white hover:bg-salon-brown/90 transition-colors disabled:opacity-40 flex-shrink-0"
          aria-label="Send message"
        >
          {sending ? (
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          )}
        </button>
      </div>
    </form>
  )
}
