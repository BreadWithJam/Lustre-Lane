'use client'

import { useState, useRef, useId } from 'react'
import { useRouter } from 'next/navigation'
import { useUIStore } from '@/stores/ui-store'
import { cn } from '@/utils'

interface SearchBarProps {
  className?: string
  placeholder?: string
  /** If provided, search is scoped to this section; otherwise navigates to the relevant page */
  scope?: 'services' | 'gallery' | 'global'
}

export function SearchBar({ className, placeholder = 'Search services or styles…', scope = 'global' }: SearchBarProps) {
  const router = useRouter()
  const { searchQuery, setSearchQuery } = useUIStore()
  // Initialize from store once; don't re-sync to avoid overwriting active typing
  const [localQuery, setLocalQuery] = useState(searchQuery)
  const inputRef = useRef<HTMLInputElement>(null)
  const inputId = useId()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = localQuery.trim()
    setSearchQuery(trimmed)

    if (scope === 'global' && trimmed) {
      // Navigate to services page with search query as default destination
      router.push(`/services?q=${encodeURIComponent(trimmed)}`)
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value
    setLocalQuery(value)
    // For scoped search, update store immediately for live filtering
    if (scope !== 'global') {
      setSearchQuery(value)
    }
  }

  function handleClear() {
    setLocalQuery('')
    setSearchQuery('')
    inputRef.current?.focus()
  }

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className={cn('relative flex items-center', className)}
    >
      <label htmlFor={inputId} className="sr-only">
        Search
      </label>
      <span className="absolute left-3 text-salon-warm-gray pointer-events-none" aria-hidden="true">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
          <path
            fillRule="evenodd"
            d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z"
            clipRule="evenodd"
          />
        </svg>
      </span>
      <input
        ref={inputRef}
        id={inputId}
        type="search"
        value={localQuery}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-border bg-white text-sm text-foreground placeholder:text-salon-warm-gray focus:outline-none focus:ring-2 focus:ring-salon-brown/30 focus:border-salon-brown transition-colors"
        aria-label={placeholder}
      />
      {localQuery && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 text-salon-warm-gray hover:text-salon-brown transition-colors"
          aria-label="Clear search"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
          </svg>
        </button>
      )}
    </form>
  )
}
