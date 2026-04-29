import { describe, it, expect } from 'vitest'
import { formatCurrency, formatDuration, isValidEmail, isValidPhone } from './index'

describe('Utility Functions', () => {
  describe('formatCurrency', () => {
    it('should format currency correctly', () => {
      expect(formatCurrency(50)).toBe('$50.00')
      expect(formatCurrency(125.5)).toBe('$125.50')
      expect(formatCurrency(0)).toBe('$0.00')
    })
  })

  describe('formatDuration', () => {
    it('should format minutes correctly', () => {
      expect(formatDuration(30)).toBe('30 min')
      expect(formatDuration(45)).toBe('45 min')
    })

    it('should format hours correctly', () => {
      expect(formatDuration(60)).toBe('1h')
      expect(formatDuration(120)).toBe('2h')
    })

    it('should format hours and minutes correctly', () => {
      expect(formatDuration(90)).toBe('1h 30m')
      expect(formatDuration(135)).toBe('2h 15m')
    })
  })

  describe('isValidEmail', () => {
    it('should validate correct email addresses', () => {
      expect(isValidEmail('test@example.com')).toBe(true)
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true)
    })

    it('should reject invalid email addresses', () => {
      expect(isValidEmail('invalid-email')).toBe(false)
      expect(isValidEmail('test@')).toBe(false)
      expect(isValidEmail('@domain.com')).toBe(false)
    })
  })

  describe('isValidPhone', () => {
    it('should validate correct phone numbers', () => {
      expect(isValidPhone('(555) 123-4567')).toBe(true)
      expect(isValidPhone('555-123-4567')).toBe(true)
      expect(isValidPhone('5551234567')).toBe(true)
    })

    it('should reject invalid phone numbers', () => {
      expect(isValidPhone('123')).toBe(false)
      expect(isValidPhone('invalid-phone')).toBe(false)
    })
  })
})