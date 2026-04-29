import { NextRequest, NextResponse } from 'next/server'
import { messagesDb, transformMessageRowToMessage } from '@/lib/database'

interface RouteParams {
  params: Promise<{ threadId: string }>
}

// POST /api/messages/[threadId]/read - mark a message as read
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { threadId } = await params
    const body = await request.json()
    const { messageId } = body

    if (!messageId) {
      return NextResponse.json({ error: 'messageId is required' }, { status: 400 })
    }

    const message = await messagesDb.markAsRead(threadId, messageId)

    return NextResponse.json({
      data: transformMessageRowToMessage(message),
      message: 'Message marked as read',
    })
  } catch (error) {
    console.error('Error marking message as read:', error)
    return NextResponse.json(
      { error: 'Failed to mark message as read', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
