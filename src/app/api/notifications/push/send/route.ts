/**
 * POST /api/notifications/push/send
 * Sends a Web Push notification to a subscribed user.
 * Requirements: 4.3
 */
import { NextRequest, NextResponse } from 'next/server'
import webpush from 'web-push'
import { getPushSubscription, getNotificationPreferences, recordNotification } from '@/lib/notifications'

export interface PushPayload {
  title: string
  body: string
  url?: string
  icon?: string
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, payload } = body as { userId: string; payload: PushPayload }

    if (!userId || !payload?.title) {
      return NextResponse.json(
        { error: 'userId and payload.title are required' },
        { status: 400 }
      )
    }

    // Check user preferences — respect opt-in (Req 4.3, 4.4)
    const prefs = await getNotificationPreferences(userId)
    if (!prefs.pushEnabled) {
      await recordNotification({
        type: 'push',
        status: 'skipped',
        createdAt: new Date(),
      }).catch(() => {})
      return NextResponse.json({ message: 'Push notifications not enabled for this user', skipped: true })
    }

    const subscription = await getPushSubscription(userId)
    if (!subscription) {
      return NextResponse.json({ error: 'No push subscription found for user' }, { status: 404 })
    }

    const result = await sendWebPush(subscription.endpoint, subscription.keys, payload)

    await recordNotification({
      type: 'push',
      status: result.success ? 'sent' : 'failed',
      error: result.error,
      createdAt: new Date(),
    }).catch(() => {})

    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to send push notification', details: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Push notification sent' })
  } catch (error) {
    console.error('[push/send] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// ---------------------------------------------------------------------------
// Web Push via VAPID (using the Web Push Protocol directly)
// ---------------------------------------------------------------------------

async function sendWebPush(
  endpoint: string,
  keys: { p256dh: string; auth: string },
  payload: PushPayload
): Promise<{ success: boolean; error?: string }> {
  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY
  const vapidSubject = process.env.VAPID_SUBJECT ?? 'mailto:admin@salon.example.com'

  if (!vapidPublicKey || !vapidPrivateKey) {
    console.warn('[push] VAPID keys not configured — skipping push send')
    return { success: false, error: 'Push service not configured' }
  }

  try {
    webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey)

    await webpush.sendNotification(
      { endpoint, keys },
      JSON.stringify(payload)
    )

    return { success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[push] Failed to send push notification:', message)
    return { success: false, error: message }
  }
}
