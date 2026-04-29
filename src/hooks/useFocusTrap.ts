'use client'

import { useEffect, useRef } from 'react'

const FOCUSABLE_SELECTORS = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')

/**
 * Traps keyboard focus within the given container element while active.
 * Returns a ref to attach to the container.
 * Requirement 6.1, 6.5 — keyboard navigation and focus management.
 */
export function useFocusTrap(active: boolean) {
  const containerRef = useRef<HTMLElement | null>(null)
  // Remember the element that was focused before the trap activated
  const previousFocusRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!active) return

    // Save the currently focused element so we can restore it on close
    previousFocusRef.current = document.activeElement as HTMLElement

    const container = containerRef.current
    if (!container) return

    // Move focus into the container on the first focusable element
    const focusable = Array.from(
      container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS)
    )
    focusable[0]?.focus()

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Tab') return

      const focusableNow = Array.from(
        container!.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS)
      )
      if (focusableNow.length === 0) return

      const first = focusableNow[0]
      const last = focusableNow[focusableNow.length - 1]

      if (e.shiftKey) {
        // Shift+Tab: wrap from first to last
        if (document.activeElement === first) {
          e.preventDefault()
          last.focus()
        }
      } else {
        // Tab: wrap from last to first
        if (document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      // Restore focus to the element that was active before the trap
      previousFocusRef.current?.focus()
    }
  }, [active])

  return containerRef
}
