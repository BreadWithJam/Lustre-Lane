/**
 * NotificationPreferences — lets users manage email and push notification settings.
 * Requirements: 4.4
 */
'use client'

import { useState, useEffect } from 'react'
import { usePushNotifications } from '@/hooks/usePushNotifications'

interface Preferences {
  emailEnabled: boolean
  pushEnabled: boolean
}

interface NotificationPreferencesProps {
  userId: string
}

export function NotificationPreferences({ userId }: NotificationPreferencesProps) {
  const [prefs, setPrefs] = useState<Preferences>({ emailEnabled: true, pushEnabled: false })
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)

  const { isSupported, isSubscribed, isLoading: pushLoading, subscribe, unsubscribe } =
    usePushNotifications(userId)

  // Load current preferences
  useEffect(() => {
    fetch(`/api/notifications/preferences?userId=${encodeURIComponent(userId)}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.data) setPrefs({ emailEnabled: json.data.emailEnabled, pushEnabled: json.data.pushEnabled })
      })
      .catch(console.error)
  }, [userId])

  const handleEmailToggle = async () => {
    const next = !prefs.emailEnabled
    setIsSaving(true)
    try {
      const res = await fetch('/api/notifications/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, emailEnabled: next }),
      })
      if (res.ok) {
        setPrefs((p) => ({ ...p, emailEnabled: next }))
        setSaveMessage('Preferences saved')
      }
    } finally {
      setIsSaving(false)
      setTimeout(() => setSaveMessage(null), 2000)
    }
  }

  const handlePushToggle = async () => {
    if (isSubscribed || prefs.pushEnabled) {
      await unsubscribe()
      setPrefs((p) => ({ ...p, pushEnabled: false }))
    } else {
      await subscribe()
      setPrefs((p) => ({ ...p, pushEnabled: true }))
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-salon-brown">Notification Preferences</h3>

      {/* Email notifications */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-medium text-gray-800">Email notifications</p>
          <p className="text-sm text-gray-500">Receive updates via email</p>
        </div>
        <button
          role="switch"
          aria-checked={prefs.emailEnabled}
          aria-label="Toggle email notifications"
          onClick={handleEmailToggle}
          disabled={isSaving}
          className={`
            relative inline-flex h-6 w-11 items-center rounded-full transition-colors
            focus:outline-none focus:ring-2 focus:ring-salon-brown focus:ring-offset-2
            ${prefs.emailEnabled ? 'bg-salon-brown' : 'bg-gray-300'}
            disabled:opacity-50
          `}
        >
          <span
            className={`
              inline-block h-4 w-4 transform rounded-full bg-white transition-transform
              ${prefs.emailEnabled ? 'translate-x-6' : 'translate-x-1'}
            `}
          />
        </button>
      </div>

      {/* Push notifications */}
      {isSupported && (
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-medium text-gray-800">Push notifications</p>
            <p className="text-sm text-gray-500">Receive browser push notifications</p>
          </div>
          <button
            role="switch"
            aria-checked={isSubscribed || prefs.pushEnabled}
            aria-label="Toggle push notifications"
            onClick={handlePushToggle}
            disabled={pushLoading}
            className={`
              relative inline-flex h-6 w-11 items-center rounded-full transition-colors
              focus:outline-none focus:ring-2 focus:ring-salon-brown focus:ring-offset-2
              ${isSubscribed || prefs.pushEnabled ? 'bg-salon-brown' : 'bg-gray-300'}
              disabled:opacity-50
            `}
          >
            <span
              className={`
                inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                ${isSubscribed || prefs.pushEnabled ? 'translate-x-6' : 'translate-x-1'}
              `}
            />
          </button>
        </div>
      )}

      {saveMessage && (
        <p role="status" className="text-sm text-green-600">
          {saveMessage}
        </p>
      )}
    </div>
  )
}
