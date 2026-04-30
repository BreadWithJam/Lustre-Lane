/**
 * Centralized validation and input sanitization utilities.
 * Requirements: All requirements benefit from proper error handling
 */

// ---------------------------------------------------------------------------
// Sanitization
// ---------------------------------------------------------------------------

/**
 * Strip HTML tags and trim whitespace to prevent XSS in stored content.
 */
export function sanitizeText(input: string): string {
  return input
    .replace(/<[^>]*>/g, '') // strip HTML tags
    .replace(/&[a-z]+;/gi, (entity) => {
      const map: Record<string, string> = {
        '&amp;': '&',
        '&lt;': '<',
        '&gt;': '>',
        '&quot;': '"',
        '&#39;': "'",
      }
      return map[entity] ?? entity
    })
    .trim()
}

/**
 * Sanitize a string intended for use in a URL path segment.
 * Removes characters that could cause path traversal or injection.
 */
export function sanitizeId(input: string): string {
  return input.replace(/[^a-zA-Z0-9_-]/g, '')
}

// ---------------------------------------------------------------------------
// Field validators — return an error string or null
// ---------------------------------------------------------------------------

export function validateRequired(value: string, fieldName: string): string | null {
  if (!value || !value.trim()) return `${fieldName} is required`
  return null
}

export function validateEmail(email: string): string | null {
  if (!email || !email.trim()) return 'Email is required'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return 'Enter a valid email address'
  if (email.length > 254) return 'Email address is too long'
  return null
}

export function validatePhone(phone: string): string | null {
  if (!phone || !phone.trim()) return null // phone is optional in most forms
  const cleaned = phone.replace(/\s/g, '')
  if (!/^\+?1?[-.\s]?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/.test(cleaned)) {
    return 'Enter a valid US phone number'
  }
  return null
}

export function validateMinLength(value: string, min: number, fieldName: string): string | null {
  if (value.trim().length < min) return `${fieldName} must be at least ${min} characters`
  return null
}

export function validateMaxLength(value: string, max: number, fieldName: string): string | null {
  if (value.trim().length > max) return `${fieldName} must be ${max} characters or fewer`
  return null
}

export function validatePositiveNumber(value: number, fieldName: string): string | null {
  if (typeof value !== 'number' || isNaN(value) || value <= 0) {
    return `${fieldName} must be a positive number`
  }
  return null
}

export function validateNonNegativeNumber(value: number, fieldName: string): string | null {
  if (typeof value !== 'number' || isNaN(value) || value < 0) {
    return `${fieldName} must be zero or greater`
  }
  return null
}

export function validateUrl(url: string, fieldName = 'URL'): string | null {
  if (!url || !url.trim()) return `${fieldName} is required`
  try {
    new URL(url)
    return null
  } catch {
    return `${fieldName} must be a valid URL`
  }
}

// ---------------------------------------------------------------------------
// Composite form validators
// ---------------------------------------------------------------------------

export interface ValidationResult {
  valid: boolean
  errors: Record<string, string>
}

export interface ContactFormData {
  name: string
  email: string
  phone?: string
  message: string
}

export function validateContactForm(data: ContactFormData): ValidationResult {
  const errors: Record<string, string> = {}

  const nameErr = validateRequired(data.name, 'Name') ?? validateMaxLength(data.name, 100, 'Name')
  if (nameErr) errors.name = nameErr

  const emailErr = validateEmail(data.email)
  if (emailErr) errors.email = emailErr

  if (data.phone) {
    const phoneErr = validatePhone(data.phone)
    if (phoneErr) errors.phone = phoneErr
  }

  const msgErr =
    validateRequired(data.message, 'Message') ??
    validateMinLength(data.message, 2, 'Message') ??
    validateMaxLength(data.message, 2000, 'Message')
  if (msgErr) errors.message = msgErr

  return { valid: Object.keys(errors).length === 0, errors }
}

export interface ServiceFormData {
  name: string
  category: string
  price: number
  duration: number
  description?: string
  stylistName?: string
}

export function validateServiceForm(data: ServiceFormData): ValidationResult {
  const errors: Record<string, string> = {}

  const nameErr =
    validateRequired(data.name, 'Service name') ?? validateMaxLength(data.name, 255, 'Service name')
  if (nameErr) errors.name = nameErr

  const validCategories = ['cuts', 'color', 'treatments', 'packages']
  if (!data.category || !validCategories.includes(data.category)) {
    errors.category = 'Category must be one of: Cuts, Color, Treatments, Packages'
  }

  const priceErr = validateNonNegativeNumber(data.price, 'Price')
  if (priceErr) errors.price = priceErr

  const durationErr = validatePositiveNumber(data.duration, 'Duration')
  if (durationErr) errors.duration = durationErr

  if (data.description) {
    const descErr = validateMaxLength(data.description, 1000, 'Description')
    if (descErr) errors.description = descErr
  }

  return { valid: Object.keys(errors).length === 0, errors }
}

export interface MessageFormData {
  content: string
  attachments?: unknown[]
}

export function validateMessageForm(data: MessageFormData): ValidationResult {
  const errors: Record<string, string> = {}

  const hasAttachments = Array.isArray(data.attachments) && data.attachments.length > 0
  if (!hasAttachments) {
    const contentErr =
      validateRequired(data.content, 'Message') ??
      validateMaxLength(data.content, 5000, 'Message')
    if (contentErr) errors.content = contentErr
  }

  return { valid: Object.keys(errors).length === 0, errors }
}
