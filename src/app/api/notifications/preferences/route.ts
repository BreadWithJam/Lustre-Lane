/**
 * GET  /api/notifications/preferences?userId=...  — fetch preferences
 * POST /api/notifications/preferences              — update preferences
 * Requirements: 4.4
 */
import { NextRequest, NextResponse } from 'next/server'
import { getNotificationPreferences, setNotificationPreferences } from '@/lib/notifications'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    const prefs = await getNotificationPreferences(userId)
    return NextResponse.json({ data: prefs })
  } catch (error) {
    console.error('[preferences] GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch preferences', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, emailEnabled, pushEnabled } = body

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    const updates: { emailEnabled?: boolean; pushEnabled?: boolean } = {}
    if (typeof emailEnabled === 'boolean') updates.emailEnabled = emailEnabled
    if (typeof pushEnabled === 'boolean') updates.pushEnabled = pushEnabled

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'At least one preference field is required' }, { status: 400 })
    }

    const prefs = await setNotificationPreferences(userId, updates)
    return NextResponse.json({ data: prefs, message: 'Preferences updated' })
  } catch (error) {
    console.error('[preferences] POST error:', error)
    return NextResponse.json(
      { error: 'Failed to update preferences', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
