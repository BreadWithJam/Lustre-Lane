/**
 * Hook for real-time notification badge count using Firebase Realtime listener.
 * Requirements: 4.2
 */
'use client'

import { useState, useEffect } from 'react'
import {
  collectionGroup,
  collection,
  query,
  where,
  onSnapshot,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'

interface NotificationBadgeState {
  unreadCount: number
  isLoading: boolean
}

/**
 * Subscribes to real-time unread client message count across all threads.
 * Uses a Firestore collectionGroup query on the messages subcollection,
 * filtering for client messages that have not been read yet.
 */
export function useNotificationBadge(): NotificationBadgeState {
  const [state, setState] = useState<NotificationBadgeState>({
    unreadCount: 0,
    isLoading: true,
  })

  useEffect(() => {
    // collectionGroup queries all 'messages' subcollections across every thread
    const unreadQuery = query(
      collectionGroup(db, 'messages'),
      where('sender_type', '==', 'client'),
      where('read_at', '==', null)
    )

    const unsubscribe: Unsubscribe = onSnapshot(
      unreadQuery,
      (snapshot) => {
        setState({ unreadCount: snapshot.size, isLoading: false })
      },
      (error) => {
        console.error('[useNotificationBadge] Firestore error:', error)
        setState((prev) => ({ ...prev, isLoading: false }))
      }
    )

    return () => unsubscribe()
  }, [])

  return state
}

/**
 * Subscribes to unread message count for a specific thread.
 */
export function useThreadUnreadCount(threadId: string | null): number {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!threadId) return

    const messagesRef = collection(db, 'message_threads', threadId, 'messages')
    const unreadQuery = query(messagesRef, where('read_at', '==', null))

    const unsubscribe: Unsubscribe = onSnapshot(
      unreadQuery,
      (snapshot) => setCount(snapshot.size),
      (error) => console.error('[useThreadUnreadCount] Firestore error:', error)
    )

    return () => unsubscribe()
  }, [threadId])

  return count
}
