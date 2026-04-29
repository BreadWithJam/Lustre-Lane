/**
 * POST /api/notifications/email
 * Sends an email notification for a new message or status update.
 * Requirements: 4.1, 4.2
 */
import { NextRequest, NextResponse } from 'next/server'
import {
  sendNewMessageNotification,
  sendStatusUpdateNotification,
} from '@/lib/email'
import { recordNotification } from '@/lib/notifications'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, clientEmail, clientName, messageContent, threadId, status } = body

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

    if (!type || !threadId) {
      return NextResponse.json(
        { error: 'type and threadId are required' },
        { status: 400 }
      )
    }

    let result: { success: boolean; id?: string; error?: string }

    if (type === 'new_message') {
      if (!clientEmail || !messageContent) {
        return NextResponse.json(
          { error: 'clientEmail and messageContent are required for new_message type' },
          { status: 400 }
        )
      }
      result = await sendNewMessageNotification({
        clientEmail,
        clientName,
        messageContent,
        threadId,
        appUrl,
      })
    } else if (type === 'status_update') {
      if (!clientEmail || !status) {
        return NextResponse.json(
          { error: 'clientEmail and status are required for status_update type' },
          { status: 400 }
        )
      }
      result = await sendStatusUpdateNotification({
        clientEmail,
        clientName,
        status,
        threadId,
        appUrl,
      })
    } else {
      return NextResponse.json({ error: `Unknown notification type: ${type}` }, { status: 400 })
    }

    // Record in history
    await recordNotification({
      type,
      recipientEmail: clientEmail,
      threadId,
      status: result.success ? 'sent' : 'failed',
      error: result.error,
      createdAt: new Date(),
    }).catch((err) => console.error('[notifications] Failed to record notification:', err))

    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to send email notification', details: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Email notification sent', id: result.id })
  } catch (error) {
    console.error('[notifications/email] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
