'use client'

import { useState } from 'react'

interface ContactCaptureFormProps {
  serviceContext?: string
  onSubmit: (data: { name: string; email: string; phone?: string; firstMessage: string }) => Promise<void>
  error?: string | null
}

export function ContactCaptureForm({ serviceContext, onSubmit, error }: ContactCaptureFormProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [firstMessage, setFirstMessage] = useState(
    serviceContext ? `Hi! I'm interested in ${serviceContext}.` : ''
  )
  const [submitting, setSubmitting] = useState(false)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!name.trim()) errs.name = 'Name is required'
    if (!email.trim()) errs.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Enter a valid email'
    if (!firstMessage.trim()) errs.firstMessage = 'Please enter a message'
    return errs
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setValidationErrors(errs)
      return
    }
    setValidationErrors({})
    setSubmitting(true)
    try {
      await onSubmit({ name: name.trim(), email: email.trim(), phone: phone.trim() || undefined, firstMessage: firstMessage.trim() })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-4 py-6 space-y-4" noValidate>
      <div className="text-center mb-2">
        <h3 className="text-lg font-semibold text-salon-brown">Start a Conversation</h3>
        <p className="text-sm text-salon-warm-gray">We&apos;ll get back to you as soon as possible.</p>
      </div>

      {/* Name */}
      <div>
        <label htmlFor="chat-name" className="block text-sm font-medium text-salon-brown mb-1">
          Your Name <span aria-hidden="true">*</span>
        </label>
        <input
          id="chat-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
          className="w-full rounded-lg border border-salon-cream bg-salon-cream/50 px-3 py-2 text-sm text-salon-brown placeholder-salon-warm-gray focus:outline-none focus:ring-2 focus:ring-salon-brown/30"
          placeholder="Jane Smith"
          aria-required="true"
          aria-describedby={validationErrors.name ? 'chat-name-error' : undefined}
        />
        {validationErrors.name && (
          <p id="chat-name-error" className="text-xs text-red-500 mt-1">{validationErrors.name}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <label htmlFor="chat-email" className="block text-sm font-medium text-salon-brown mb-1">
          Email <span aria-hidden="true">*</span>
        </label>
        <input
          id="chat-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          className="w-full rounded-lg border border-salon-cream bg-salon-cream/50 px-3 py-2 text-sm text-salon-brown placeholder-salon-warm-gray focus:outline-none focus:ring-2 focus:ring-salon-brown/30"
          placeholder="jane@example.com"
          aria-required="true"
          aria-describedby={validationErrors.email ? 'chat-email-error' : undefined}
        />
        {validationErrors.email && (
          <p id="chat-email-error" className="text-xs text-red-500 mt-1">{validationErrors.email}</p>
        )}
      </div>

      {/* Phone (optional) */}
      <div>
        <label htmlFor="chat-phone" className="block text-sm font-medium text-salon-brown mb-1">
          Phone <span className="text-salon-warm-gray font-normal">(optional)</span>
        </label>
        <input
          id="chat-phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          autoComplete="tel"
          className="w-full rounded-lg border border-salon-cream bg-salon-cream/50 px-3 py-2 text-sm text-salon-brown placeholder-salon-warm-gray focus:outline-none focus:ring-2 focus:ring-salon-brown/30"
          placeholder="+1 (555) 000-0000"
        />
      </div>

      {/* First message */}
      <div>
        <label htmlFor="chat-message" className="block text-sm font-medium text-salon-brown mb-1">
          Message <span aria-hidden="true">*</span>
        </label>
        <textarea
          id="chat-message"
          value={firstMessage}
          onChange={(e) => setFirstMessage(e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-salon-cream bg-salon-cream/50 px-3 py-2 text-sm text-salon-brown placeholder-salon-warm-gray focus:outline-none focus:ring-2 focus:ring-salon-brown/30 resize-none"
          placeholder="How can we help you today?"
          aria-required="true"
          aria-describedby={validationErrors.firstMessage ? 'chat-message-error' : undefined}
        />
        {validationErrors.firstMessage && (
          <p id="chat-message-error" className="text-xs text-red-500 mt-1">{validationErrors.firstMessage}</p>
        )}
      </div>

      {/* Server error */}
      {error && (
        <p className="text-xs text-red-500 text-center">{error}</p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-salon-brown text-white py-2.5 rounded-lg font-semibold hover:bg-salon-brown/90 transition-colors disabled:opacity-50"
      >
        {submitting ? 'Starting conversation…' : 'Start Conversation'}
      </button>
    </form>
  )
}
