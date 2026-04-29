'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/lib/firebase'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const credential = await signInWithEmailAndPassword(auth, email, password)
      const token = await credential.user.getIdTokenResult()

      // Verify admin claim
      if (!token.claims.admin && token.claims.role !== 'admin') {
        await auth.signOut()
        setError('Access denied. Admin privileges required.')
        setLoading(false)
        return
      }

      router.push('/admin')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Login failed'
      // Sanitize Firebase error messages
      if (msg.includes('wrong-password') || msg.includes('user-not-found') || msg.includes('invalid-credential')) {
        setError('Invalid email or password.')
      } else {
        setError('Login failed. Please try again.')
      }
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-salon-cream px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif font-bold text-salon-brown">Admin Panel</h1>
          <p className="text-salon-warm-gray mt-2">Sign in to manage your salon</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-salon-brown mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-salon-brown"
              placeholder="admin@salon.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-salon-brown mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-salon-brown"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p role="alert" className="text-red-600 text-sm bg-red-50 px-4 py-2 rounded-lg">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-salon-brown text-white py-2.5 rounded-lg font-semibold hover:bg-salon-brown/90 transition-colors disabled:opacity-60"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
