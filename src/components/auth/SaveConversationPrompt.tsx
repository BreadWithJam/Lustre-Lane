'use client'

import { useState } from 'react'
import { signInWithGoogle } from '@/lib/client-auth'

interface SaveConversationPromptProps {
  threadId: string
  onSaved: () => void
  onDismiss: () => void
}

export function SaveConversationPrompt({ threadId, onSaved, onDismiss }: SaveConversationPromptProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSignIn = async () => {
    setLoading(true)
    setError(null)
    try {
      const user = await signInWithGoogle()
      const token = await user.getIdToken()

      const res = await fetch('/api/auth/link-thread', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ threadId }),
      })

      if (!res.ok) throw new Error('Failed to link conversation')
      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setLoading(false)
    }
  }

  return (
    <div className="mx-4 mb-3 p-3 rounded-xl bg-salon-cream border border-salon-brown/20 flex items-center gap-3">
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-salon-brown">Save your conversation</p>
        <p className="text-xs text-salon-warm-gray">Sign in to access your chat history anytime.</p>
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>
      <div className="flex gap-2 flex-shrink-0">
        <button
          onClick={onDismiss}
          className="text-xs text-salon-warm-gray hover:text-salon-brown transition-colors"
        >
          Skip
        </button>
        <button
          onClick={handleSignIn}
          disabled={loading}
          className="text-xs bg-salon-brown text-white px-3 py-1.5 rounded-lg hover:bg-salon-brown/90 transition-colors disabled:opacity-50 flex items-center gap-1.5"
        >
          {loading ? (
            <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          ) : (
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
          )}
          Sign in with Google
        </button>
      </div>
    </div>
  )
}
