'use client'

import { useState, useEffect, useCallback } from 'react'

const PREFERENCES_KEY = 'salon-preferences'

export interface UserPreferences {
  /** Preferred service category shown first */
  preferredCategory?: string
  /** Whether the user has dismissed the welcome banner */
  welcomeDismissed: boolean
  /** Last visited section for personalized landing */
  lastVisitedSection?: 'services' | 'gallery' | 'chat'
  /** Notification opt-in */
  notificationsEnabled: boolean
}

const defaultPreferences: UserPreferences = {
  welcomeDismissed: false,
  notificationsEnabled: false,
}

export function usePreferences() {
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(PREFERENCES_KEY)
      if (stored) {
        setPreferences({ ...defaultPreferences, ...JSON.parse(stored) })
      }
    } catch {
      // ignore parse errors
    } finally {
      setLoaded(true)
    }
  }, [])

  const updatePreferences = useCallback((updates: Partial<UserPreferences>) => {
    setPreferences(prev => {
      const next = { ...prev, ...updates }
      try {
        localStorage.setItem(PREFERENCES_KEY, JSON.stringify(next))
      } catch {
        // ignore storage errors
      }
      return next
    })
  }, [])

  const clearPreferences = useCallback(() => {
    try {
      localStorage.removeItem(PREFERENCES_KEY)
    } catch {
      // ignore
    }
    setPreferences(defaultPreferences)
  }, [])

  return { preferences, updatePreferences, clearPreferences, loaded }
}
