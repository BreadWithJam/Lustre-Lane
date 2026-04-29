import { NextRequest, NextResponse } from 'next/server'
import {
  messageThreadsDb,
  messagesDb,
  transformMessageThreadRowToMessageThread,
  transformMessageRowToMessage,
} from '@/lib/database'
import type { MessageInsert, MessageThreadUpdate } from '@/types'

interface RouteParams {
  params: Promise<{ threadId: string }>
}

// GET /api/messages/[threadId] - fetch thread with all messages
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { threadId } = await params

    const [thread, messages] = await Promise.all([
      messageThreadsDb.getById(threadId),
      messagesDb.getByThreadId(threadId),
    ])

    const transformedThread = transformMessageThreadRowToMessageThread(thread)
    transformedThread.messages = messages.map(transformMessageRowToMessage)

    return NextResponse.json({ data: transformedThread, message: 'Thread retrieved successfully' })
  } catch (error) {
    console.error('Error fetching thread:', error)
    return NextResponse.json(
      { error: 'Failed to fetch thread', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// POST /api/messages/[threadId] - send a message to an existing thread
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { threadId } = await params
    const body = await request.json()

    const { content, senderType, senderName, attachments } = body
    const hasAttachments = Array.isArray(attachments) && attachments.length > 0

    if (!content && !hasAttachments) {
      return NextResponse.json({ error: 'content or at least one attachment is required' }, { status: 400 })
    }

    const messageInsert: MessageInsert = {
      thread_id: threadId,
      sender_type: senderType || 'client',
      sender_name: senderName || null,
      content: content || '',
      attachments: attachments || [],
      read_at: null,
    }

    const message = await messagesDb.create(messageInsert)

    return NextResponse.json(
      { data: transformMessageRowToMessage(message), message: 'Message sent successfully' },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json(
      { error: 'Failed to send message', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// PATCH /api/messages/[threadId] - update thread status
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { threadId } = await params
    const body = await request.json()

    const updates: MessageThreadUpdate = {}
    if (body.status !== undefined) updates.status = body.status
    if (body.clientName !== undefined) updates.client_name = body.clientName
    if (body.clientPhone !== undefined) updates.client_phone = body.clientPhone

    const thread = await messageThreadsDb.update(threadId, updates)

    return NextResponse.json({
      data: transformMessageThreadRowToMessageThread(thread),
      message: 'Thread updated successfully',
    })
  } catch (error) {
    console.error('Error updating thread:', error)
    return NextResponse.json(
      { error: 'Failed to update thread', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
