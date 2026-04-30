import { NextRequest, NextResponse } from 'next/server'
import {
  messageThreadsDb,
  messagesDb,
  transformMessageThreadRowToMessageThread,
  transformMessageRowToMessage,
} from '@/lib/database'
import { sendNewMessageNotification } from '@/lib/email'
import { recordNotification } from '@/lib/notifications'
import { checkRateLimit, getRateLimitKey, RateLimits } from '@/lib/rate-limit'
import { validateContactForm, validateMessageForm, sanitizeText } from '@/lib/validation'
import { createErrorResponse, ApiErrors } from '@/lib/api-errors'
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
  // Rate limit message creation to prevent spam
  const rateLimitKey = getRateLimitKey(request, 'messages')
  const rateLimit = checkRateLimit(rateLimitKey, RateLimits.messages)
  if (!rateLimit.allowed) {
    return createErrorResponse(ApiErrors.rateLimitExceeded())
  }

  try {
    const body = await request.json()

    const { clientEmail, clientName, clientPhone, content, senderType, senderName, attachments } = body

    // Validate contact info
    const contactValidation = validateContactForm({
      name: clientName || '',
      email: clientEmail || '',
      phone: clientPhone,
      message: content || '',
    })
    if (!contactValidation.valid) {
      return createErrorResponse(
        ApiErrors.validationError('Invalid request data', contactValidation.errors as Record<string, unknown>)
      )
    }

    // Validate message content
    const messageValidation = validateMessageForm({ content, attachments })
    if (!messageValidation.valid) {
      return createErrorResponse(
        ApiErrors.validationError('Invalid message data', messageValidation.errors as Record<string, unknown>)
      )
    }

    // Sanitize user-supplied text
    const sanitizedContent = sanitizeText(content || '')
    const sanitizedName = clientName ? sanitizeText(clientName) : null

    // Create thread
    const threadInsert: MessageThreadInsert = {
      client_email: clientEmail.trim().toLowerCase(),
      client_name: sanitizedName,
      client_phone: clientPhone?.trim() || null,
      status: 'open',
    }
    const thread = await messageThreadsDb.create(threadInsert)

    // Create first message
    const messageInsert: MessageInsert = {
      thread_id: thread.id,
      sender_type: senderType || 'client',
      sender_name: senderName ? sanitizeText(senderName) : sanitizedName,
      content: sanitizedContent,
      attachments: attachments || [],
      read_at: null,
    }
    const message = await messagesDb.create(messageInsert)

    // Fire-and-forget email notification to salon staff (Req 4.1)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
    sendNewMessageNotification({
      clientEmail,
      clientName,
      messageContent: content,
      threadId: thread.id,
      appUrl,
    })
      .then((result) =>
        recordNotification({
          type: 'new_message',
          recipientEmail: clientEmail,
          threadId: thread.id,
          status: result.success ? 'sent' : 'failed',
          error: result.error,
          createdAt: new Date(),
        })
      )
      .catch((err) => console.error('[messages] Notification error:', err))

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
    return createErrorResponse(error, 'Failed to create message thread')
  }
}
