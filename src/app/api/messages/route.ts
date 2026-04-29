import { NextRequest, NextResponse } from 'next/server'
import {
  messageThreadsDb,
  messagesDb,
  transformMessageThreadRowToMessageThread,
  transformMessageRowToMessage,
} from '@/lib/database'
import type { MessageThreadInsert, MessageInsert } from '@/types'

// GET /api/messages - list all threads (admin) or threads by email
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    const status = searchParams.get('status')

    let threads = email
      ? await messageThreadsDb.getByEmail(email)
      : await messageThreadsDb.getAll()

    if (status) {
      threads = threads.filter((t) => t.status === status)
    }

    const transformed = threads.map(transformMessageThreadRowToMessageThread)

    return NextResponse.json({ data: transformed, message: 'Threads retrieved successfully' })
  } catch (error) {
    console.error('Error fetching message threads:', error)
    return NextResponse.json(
      { error: 'Failed to fetch message threads', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// POST /api/messages - create a new thread + first message
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { clientEmail, clientName, clientPhone, content, senderType, senderName, attachments } = body

    if (!clientEmail) {
      return NextResponse.json({ error: 'clientEmail is required' }, { status: 400 })
    }
    if (!content) {
      return NextResponse.json({ error: 'content is required' }, { status: 400 })
    }

    // Create thread
    const threadInsert: MessageThreadInsert = {
      client_email: clientEmail,
      client_name: clientName || null,
      client_phone: clientPhone || null,
      status: 'open',
    }
    const thread = await messageThreadsDb.create(threadInsert)

    // Create first message
    const messageInsert: MessageInsert = {
      thread_id: thread.id,
      sender_type: senderType || 'client',
      sender_name: senderName || clientName || null,
      content,
      attachments: attachments || [],
      read_at: null,
    }
    const message = await messagesDb.create(messageInsert)

    return NextResponse.json(
      {
        data: {
          thread: transformMessageThreadRowToMessageThread(thread),
          message: transformMessageRowToMessage(message),
        },
        message: 'Thread created successfully',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating message thread:', error)
    return NextResponse.json(
      { error: 'Failed to create message thread', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
