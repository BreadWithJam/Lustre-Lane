/**
 * Server-side database operations using Firebase Admin SDK.
 * Use this in API routes (server context) instead of @/lib/database which uses the client SDK.
 */
import { FieldValue, Timestamp } from 'firebase-admin/firestore'
import { adminDb } from './firebase-admin'
import type {
  MessageThreadRow,
  MessageRow,
  MessageThreadInsert,
  MessageThreadUpdate,
  MessageInsert,
} from '@/types'

const THREADS = 'message_threads'
const MESSAGES = 'messages'

function toDate(value: unknown): Date {
  if (value instanceof Timestamp) return value.toDate()
  if (value instanceof Date) return value
  if (typeof value === 'string' || typeof value === 'number') return new Date(value)
  return new Date()
}

export class DatabaseError extends Error {
  constructor(message: string, public code?: string) {
    super(message)
    this.name = 'DatabaseError'
  }
}

// ---------------------------------------------------------------------------
// Message threads
// ---------------------------------------------------------------------------

export const adminMessageThreadsDb = {
  async getAll(): Promise<MessageThreadRow[]> {
    const snap = await adminDb
      .collection(THREADS)
      .orderBy('last_message_at', 'desc')
      .get()
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as MessageThreadRow))
  },

  async getById(id: string): Promise<MessageThreadRow> {
    const snap = await adminDb.collection(THREADS).doc(id).get()
    if (!snap.exists) throw new DatabaseError(`Thread not found: ${id}`, 'NOT_FOUND')
    return { id: snap.id, ...snap.data() } as MessageThreadRow
  },

  async getByEmail(email: string): Promise<MessageThreadRow[]> {
    const snap = await adminDb
      .collection(THREADS)
      .where('client_email', '==', email)
      .orderBy('last_message_at', 'desc')
      .get()
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as MessageThreadRow))
  },

  async create(thread: MessageThreadInsert): Promise<MessageThreadRow> {
    const now = FieldValue.serverTimestamp()
    const data = { ...thread, last_message_at: now, created_at: now }
    const ref = await adminDb.collection(THREADS).add(data)
    const snap = await ref.get()
    return { id: snap.id, ...snap.data() } as MessageThreadRow
  },

  async update(id: string, updates: MessageThreadUpdate): Promise<MessageThreadRow> {
    const ref = adminDb.collection(THREADS).doc(id)
    await ref.update(updates)
    const snap = await ref.get()
    if (!snap.exists) throw new DatabaseError(`Thread not found: ${id}`, 'NOT_FOUND')
    return { id: snap.id, ...snap.data() } as MessageThreadRow
  },
}

// ---------------------------------------------------------------------------
// Messages (subcollection)
// ---------------------------------------------------------------------------

export const adminMessagesDb = {
  async getByThreadId(threadId: string): Promise<MessageRow[]> {
    const snap = await adminDb
      .collection(THREADS)
      .doc(threadId)
      .collection(MESSAGES)
      .orderBy('created_at', 'asc')
      .get()
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as MessageRow))
  },

  async create(message: MessageInsert): Promise<MessageRow> {
    const now = FieldValue.serverTimestamp()
    const data = { ...message, created_at: now }
    const ref = await adminDb
      .collection(THREADS)
      .doc(message.thread_id)
      .collection(MESSAGES)
      .add(data)

    // Update thread's last_message_at
    await adminDb
      .collection(THREADS)
      .doc(message.thread_id)
      .update({ last_message_at: now })

    const snap = await ref.get()
    return { id: snap.id, ...snap.data() } as MessageRow
  },

  async markAsRead(threadId: string, messageId: string): Promise<void> {
    await adminDb
      .collection(THREADS)
      .doc(threadId)
      .collection(MESSAGES)
      .doc(messageId)
      .update({ read_at: FieldValue.serverTimestamp() })
  },
}

// ---------------------------------------------------------------------------
// Re-export transformers from the shared database module
// ---------------------------------------------------------------------------
export {
  transformMessageThreadRowToMessageThread,
  transformMessageRowToMessage,
} from './database'

export { toDate }
