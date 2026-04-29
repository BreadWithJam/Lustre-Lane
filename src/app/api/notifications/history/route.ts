/**
 * GET /api/notifications/history — notification history and metrics for admin dashboard
 * Requirements: 4.5
 */
import { NextRequest, NextResponse } from 'next/server'
import { getNotificationHistory, getNotificationMetrics } from '@/lib/notifications'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const metricsOnly = searchParams.get('metrics') === 'true'
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50', 10), 200)

    if (metricsOnly) {
      const metrics = await getNotificationMetrics()
      return NextResponse.json({ data: metrics })
    }

    const history = await getNotificationHistory(limit)
    return NextResponse.json({ data: history })
  } catch (error) {
    console.error('[notifications/history] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notification history', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
