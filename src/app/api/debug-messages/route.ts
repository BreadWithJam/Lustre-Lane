import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Step 1: can we import firebase-admin?
    const { adminDb } = await import('@/lib/firebase-admin')
    
    // Step 2: can we reach Firestore?
    const snap = await adminDb.collection('message_threads').limit(1).get()
    
    return NextResponse.json({ ok: true, docCount: snap.size })
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: String(err), stack: err instanceof Error ? err.stack : undefined },
      { status: 500 }
    )
  }
}
