'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthChange, type User } from '@/lib/client-auth'

interface AuthContextValue {
  user: User | null
  loading: boolean
}

const AuthContext = createContext<AuthContextValue>({ user: null, loading: true })

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Timeout fallback — if Firebase Auth doesn't respond in 3s, treat as signed out
    const timeout = setTimeout(() => setLoading(false), 3000)

    const unsub = onAuthChange((u) => {
      clearTimeout(timeout)
      setUser(u)
      setLoading(false)
    })

    return () => {
      clearTimeout(timeout)
      unsub()
    }
  }, [])

  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
