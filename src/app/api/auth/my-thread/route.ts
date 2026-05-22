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

    // Find the most recent thread for this user
    const snap = await adminDb
      .collection('message_threads')
      .where('uid', '==', decoded.uid)
      .orderBy('last_message_at', 'desc')
      .limit(1)
      .get()

    if (snap.empty) {
      return NextResponse.json({ data: null })
    }

    const threadDoc = snap.docs[0]
    const thread = transformMessageThreadRowToMessageThread({ id: threadDoc.id, ...threadDoc.data() } as MessageThreadRow)

    // Fetch messages
    const msgSnap = await adminDb
      .collection('message_threads')
      .doc(threadDoc.id)
      .collection('messages')
      .orderBy('created_at', 'asc')
      .get()

    thread.messages = msgSnap.docs.map((d) =>
      transformMessageRowToMessage({ id: d.id, ...d.data() } as MessageRow)
    )

    return NextResponse.json({ data: thread })
  } catch (err) {
    console.error('[my-thread]', err)
    return NextResponse.json({ error: 'Failed to fetch thread' }, { status: 500 })
  }
}
