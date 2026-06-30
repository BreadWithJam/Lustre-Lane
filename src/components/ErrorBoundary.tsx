'use client'

import React, { Component, type ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
  /** Custom fallback UI. Receives the error and a reset function. */
  fallback?: (error: Error, reset: () => void) => ReactNode
  /** Called when an error is caught — useful for logging */
  onError?: (error: Error, info: React.ErrorInfo) => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

/**
 * React error boundary that catches rendering errors and shows a fallback UI.
 * Requirements: All requirements benefit from proper error recovery
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary] Caught error:', error, info)
    console.error('[ErrorBoundary] Component stack:', info.componentStack)
    this.props.onError?.(error, info)
  }

  reset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.reset)
      }
      return <DefaultErrorFallback error={this.state.error} reset={this.reset} />
    }
    return this.props.children
  }
}

// ---------------------------------------------------------------------------
// Default fallback UI
// ---------------------------------------------------------------------------

function DefaultErrorFallback({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className="flex flex-col items-center justify-center min-h-[200px] p-8 text-center"
    >
      <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
        <svg
          className="w-6 h-6 text-red-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
          />
        </svg>
      </div>
      <h2 className="text-lg font-semibold text-salon-brown mb-2">Something went wrong</h2>
      <p className="text-sm text-salon-warm-gray mb-6 max-w-sm">
        {error.message || 'An unexpected error occurred. Please try again.'}
      </p>
      {error.stack && (
        <pre className="text-left text-xs text-red-400 bg-red-50 rounded p-3 max-w-lg overflow-auto mb-4 max-h-40">
          {error.stack}
        </pre>
      )}
      <button
        onClick={reset}
        className="px-4 py-2 bg-salon-brown text-white rounded-lg text-sm font-medium hover:bg-salon-brown/90 transition-colors focus:outline-none focus:ring-2 focus:ring-salon-brown/50"
      >
        Try again
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Inline error display for non-critical sections
// ---------------------------------------------------------------------------

interface InlineErrorProps {
  message: string
  onRetry?: () => void
  className?: string
}

export function InlineError({ message, onRetry, className = '' }: InlineErrorProps) {
  return (
    <div
      role="alert"
      className={`flex items-start gap-3 p-4 rounded-lg bg-red-50 border border-red-200 ${className}`}
    >
      <svg
        className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-red-700">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-2 text-xs font-medium text-red-600 underline hover:text-red-800 focus:outline-none focus:ring-1 focus:ring-red-500 rounded"
          >
            Try again
          </button>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Loading / skeleton placeholder
// ---------------------------------------------------------------------------

export function LoadingSpinner({ label = 'Loading…' }: { label?: string }) {
  return (
    <div role="status" aria-label={label} className="flex items-center justify-center p-8">
      <svg
        className="w-8 h-8 animate-spin text-salon-brown"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v8H4z"
        />
      </svg>
      <span className="sr-only">{label}</span>
    </div>
  )
}
