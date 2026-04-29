/**
 * POST /api/notifications/push/subscribe  — save a push subscription
 * DELETE /api/notifications/push/subscribe — remove a push subscription
 * Requirements: 4.3
 */
import { NextRequest, NextResponse } from 'next/server'
import { savePushSubscription, deletePushSubscription } from '@/lib/notifications'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, endpoint, keys } = body

    if (!userId || !endpoint || !keys?.p256dh || !keys?.auth) {
      return NextResponse.json(
        { error: 'userId, endpoint, and keys (p256dh, auth) are required' },
        { status: 400 }
      )
    }

    await savePushSubscription({ userId, endpoint, keys })

    return NextResponse.json({ message: 'Push subscription saved' }, { status: 201 })
  } catch (error) {
    console.error('[push/subscribe] Error:', error)
    return NextResponse.json(
      { error: 'Failed to save push subscription', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    await deletePushSubscription(userId)

    return NextResponse.json({ message: 'Push subscription removed' })
  } catch (error) {
    console.error('[push/subscribe] Error deleting:', error)
    return NextResponse.json(
      { error: 'Failed to remove push subscription', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
