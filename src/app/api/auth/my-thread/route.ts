import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase-admin'
import { transformMessageThreadRowToMessageThread, transformMessageRowToMessage } from '@/lib/database-admin'
import type { MessageThreadRow, MessageRow } from '@/types'

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const token = authHeader.slice(7)
    const decoded = await adminAuth.verifyIdToken(token)

    // Query by uid only (no orderBy to avoid requiring a composite index)
    const snap = await adminDb
      .collection('message_threads')
      .where('uid', '==', decoded.uid)
      .get()

    if (snap.empty) {
      return NextResponse.json({ data: [] })
    }

    // Fetch messages for each thread, then sort by last_message_at descending in memory
    const threads = await Promise.all(
      snap.docs.map(async (threadDoc) => {
        const thread = transformMessageThreadRowToMessageThread({
          id: threadDoc.id,
          ...threadDoc.data(),
        } as MessageThreadRow)

        const msgSnap = await adminDb
          .collection('message_threads')
          .doc(threadDoc.id)
          .collection('messages')
          .orderBy('created_at', 'asc')
          .get()

        thread.messages = msgSnap.docs.map((d) =>
          transformMessageRowToMessage({ id: d.id, ...d.data() } as MessageRow)
        )

        return thread
      })
    )

    // Sort newest first in memory
    threads.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime())

    return NextResponse.json({ data: threads })
  } catch (err) {
    console.error('[my-thread]', err)
    return NextResponse.json({ error: 'Failed to fetch threads' }, { status: 500 })
  }
}
