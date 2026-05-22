import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase-admin'

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const token = authHeader.slice(7)
    const decoded = await adminAuth.verifyIdToken(token)

    const { threadId } = await request.json()
    if (!threadId) {
      return NextResponse.json({ error: 'threadId is required' }, { status: 400 })
    }

    // Link the thread to the authenticated user's UID
    await adminDb.collection('message_threads').doc(threadId).update({
      uid: decoded.uid,
      user_email: decoded.email ?? null,
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[link-thread]', err)
    return NextResponse.json({ error: 'Failed to link thread' }, { status: 500 })
  }
}
