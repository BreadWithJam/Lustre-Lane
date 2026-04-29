/**
 * Hook for managing Web Push notification subscriptions.
 * Requirements: 4.3, 4.4
 */
'use client'

import { useState, useEffect, useCallback } from 'react'

interface PushNotificationState {
  isSupported: boolean
  permission: NotificationPermission | 'default'
  isSubscribed: boolean
  isLoading: boolean
  error: string | null
}

export function usePushNotifications(userId: string | null) {
  const [state, setState] = useState<PushNotificationState>({
    isSupported: false,
    permission: 'default',
    isSubscribed: false,
    isLoading: false,
    error: null,
  })

  useEffect(() => {
    const supported =
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window

    setState((prev) => ({
      ...prev,
      isSupported: supported,
      permission: supported ? Notification.permission : 'default',
    }))
  }, [])

  const subscribe = useCallback(async () => {
    if (!state.isSupported || !userId) return

    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      // Register service worker
      const registration = await navigator.serviceWorker.register('/sw.js')
      await navigator.serviceWorker.ready

      // Request permission
      const permission = await Notification.requestPermission()
      setState((prev) => ({ ...prev, permission }))

      if (permission !== 'granted') {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: 'Notification permission denied',
        }))
        return
      }

      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      if (!vapidPublicKey) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: 'Push notifications not configured',
        }))
        return
      }

      // Subscribe to push
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      })

      const subJson = subscription.toJSON()

      // Save subscription to server
      const response = await fetch('/api/notifications/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          endpoint: subJson.endpoint,
          keys: subJson.keys,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save push subscription')
      }

      // Update preferences to enable push
      await fetch('/api/notifications/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, pushEnabled: true }),
      })

      setState((prev) => ({ ...prev, isSubscribed: true, isLoading: false }))
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to subscribe',
      }))
    }
  }, [state.isSupported, userId])

  const unsubscribe = useCallback(async () => {
    if (!userId) return

    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      const registration = await navigator.serviceWorker.getRegistration('/sw.js')
      if (registration) {
        const subscription = await registration.pushManager.getSubscription()
        if (subscription) {
          await subscription.unsubscribe()
        }
      }

      await fetch(`/api/notifications/push/subscribe?userId=${encodeURIComponent(userId)}`, {
        method: 'DELETE',
      })

      await fetch('/api/notifications/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, pushEnabled: false }),
      })

      setState((prev) => ({ ...prev, isSubscribed: false, isLoading: false }))
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to unsubscribe',
      }))
    }
  }, [userId])

  return { ...state, subscribe, unsubscribe }
}

// ---------------------------------------------------------------------------
// Utility
// ---------------------------------------------------------------------------

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  const buffer = new ArrayBuffer(rawData.length)
  const view = new Uint8Array(buffer)
  for (let i = 0; i < rawData.length; i++) {
    view[i] = rawData.charCodeAt(i)
  }
  return buffer
}
