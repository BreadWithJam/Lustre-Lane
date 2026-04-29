/**
 * Notification preferences and push notification utilities.
 * Requirements: 4.3, 4.4, 4.5
 */

import { adminDb } from './firebase-admin'
import { Timestamp } from 'firebase-admin/firestore'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface NotificationPreferences {
  userId: string
  emailEnabled: boolean
  pushEnabled: boolean
  updatedAt: Date
}

export interface PushSubscription {
  userId: string
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
  createdAt: Date
}

export interface NotificationRecord {
  id?: string
  type: 'new_message' | 'status_update' | 'push'
  recipientEmail?: string
  threadId?: string
  status: 'sent' | 'failed' | 'skipped'
  error?: string
  createdAt: Date
}

// ---------------------------------------------------------------------------
// Firestore collection names
// ---------------------------------------------------------------------------

const COLLECTIONS = {
  NOTIFICATION_PREFS: 'notification_preferences',
  PUSH_SUBSCRIPTIONS: 'push_subscriptions',
  NOTIFICATION_HISTORY: 'notification_history',
} as const

// ---------------------------------------------------------------------------
// Notification preferences
// ---------------------------------------------------------------------------

export async function getNotificationPreferences(
  userId: string
): Promise<NotificationPreferences> {
  const snap = await adminDb.collection(COLLECTIONS.NOTIFICATION_PREFS).doc(userId).get()
  if (!snap.exists) {
    // Return defaults
    return { userId, emailEnabled: true, pushEnabled: false, updatedAt: new Date() }
  }
  const data = snap.data()!
  return {
    userId,
    emailEnabled: data.emailEnabled ?? true,
    pushEnabled: data.pushEnabled ?? false,
    updatedAt: data.updatedAt?.toDate?.() ?? new Date(),
  }
}

export async function setNotificationPreferences(
  userId: string,
  prefs: Partial<Pick<NotificationPreferences, 'emailEnabled' | 'pushEnabled'>>
): Promise<NotificationPreferences> {
  const ref = adminDb.collection(COLLECTIONS.NOTIFICATION_PREFS).doc(userId)
  const update = { ...prefs, updatedAt: Timestamp.now() }
  await ref.set(update, { merge: true })
  return getNotificationPreferences(userId)
}

// ---------------------------------------------------------------------------
// Push subscriptions
// ---------------------------------------------------------------------------

export async function savePushSubscription(sub: Omit<PushSubscription, 'createdAt'>): Promise<void> {
  const ref = adminDb.collection(COLLECTIONS.PUSH_SUBSCRIPTIONS).doc(sub.userId)
  await ref.set({
    ...sub,
    createdAt: Timestamp.now(),
  })
}

export async function getPushSubscription(userId: string): Promise<PushSubscription | null> {
  const snap = await adminDb.collection(COLLECTIONS.PUSH_SUBSCRIPTIONS).doc(userId).get()
  if (!snap.exists) return null
  const data = snap.data()!
  return {
    userId,
    endpoint: data.endpoint,
    keys: data.keys,
    createdAt: data.createdAt?.toDate?.() ?? new Date(),
  }
}

export async function deletePushSubscription(userId: string): Promise<void> {
  await adminDb.collection(COLLECTIONS.PUSH_SUBSCRIPTIONS).doc(userId).delete()
}

// ---------------------------------------------------------------------------
// Notification history (for admin dashboard — Req 4.5)
// ---------------------------------------------------------------------------

export async function recordNotification(
  record: Omit<NotificationRecord, 'id'>
): Promise<string> {
  const ref = await adminDb.collection(COLLECTIONS.NOTIFICATION_HISTORY).add({
    ...record,
    createdAt: Timestamp.now(),
  })
  return ref.id
}

export async function getNotificationHistory(limit = 50): Promise<NotificationRecord[]> {
  const snap = await adminDb
    .collection(COLLECTIONS.NOTIFICATION_HISTORY)
    .orderBy('createdAt', 'desc')
    .limit(limit)
    .get()

  return snap.docs.map((d) => {
    const data = d.data()
    return {
      id: d.id,
      type: data.type,
      recipientEmail: data.recipientEmail,
      threadId: data.threadId,
      status: data.status,
      error: data.error,
      createdAt: data.createdAt?.toDate?.() ?? new Date(),
    } as NotificationRecord
  })
}

export async function getNotificationMetrics(): Promise<{
  total: number
  sent: number
  failed: number
  last24h: number
}> {
  const snap = await adminDb
    .collection(COLLECTIONS.NOTIFICATION_HISTORY)
    .orderBy('createdAt', 'desc')
    .limit(500)
    .get()

  const now = Date.now()
  const oneDayMs = 24 * 60 * 60 * 1000

  let sent = 0
  let failed = 0
  let last24h = 0

  for (const d of snap.docs) {
    const data = d.data()
    if (data.status === 'sent') sent++
    if (data.status === 'failed') failed++
    const createdAt: Date = data.createdAt?.toDate?.() ?? new Date()
    if (now - createdAt.getTime() < oneDayMs) last24h++
  }

  return { total: snap.size, sent, failed, last24h }
}
