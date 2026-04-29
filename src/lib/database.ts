import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  type QueryConstraint,
} from 'firebase/firestore'
import { db } from './firebase'
import type {
  ServiceRow,
  GalleryImageRow,
  MessageThreadRow,
  MessageRow,
  ServiceInsert,
  ServiceUpdate,
  GalleryImageInsert,
  GalleryImageUpdate,
  MessageThreadInsert,
  MessageThreadUpdate,
  MessageInsert,
  Service,
  GalleryImage,
  MessageThread,
  Message,
} from '@/types'

// ---------------------------------------------------------------------------
// Custom error types
// ---------------------------------------------------------------------------

export class DatabaseError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: string
  ) {
    super(message)
    this.name = 'DatabaseError'
  }
}

export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

// ---------------------------------------------------------------------------
// Collection names
// ---------------------------------------------------------------------------

const COLLECTIONS = {
  SERVICES: 'services',
  GALLERY: 'gallery_images',
  THREADS: 'message_threads',
  MESSAGES: 'messages',
} as const

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toDate(value: unknown): Date {
  if (value instanceof Timestamp) return value.toDate()
  if (value instanceof Date) return value
  if (typeof value === 'string' || typeof value === 'number') return new Date(value)
  return new Date()
}

async function handleOp<T>(op: () => Promise<T>): Promise<T> {
  try {
    return await op()
  } catch (error) {
    if (error instanceof DatabaseError || error instanceof ValidationError) throw error
    throw new DatabaseError(
      `Database operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

// ---------------------------------------------------------------------------
// Services
// ---------------------------------------------------------------------------

export const servicesDb = {
  async getAll(activeOnly = true): Promise<ServiceRow[]> {
    return handleOp(async () => {
      const constraints: QueryConstraint[] = [orderBy('created_at', 'desc')]
      if (activeOnly) constraints.unshift(where('is_active', '==', true))

      const snap = await getDocs(query(collection(db, COLLECTIONS.SERVICES), ...constraints))
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as ServiceRow))
    })
  },

  async getById(id: string): Promise<ServiceRow> {
    return handleOp(async () => {
      const snap = await getDoc(doc(db, COLLECTIONS.SERVICES, id))
      if (!snap.exists()) throw new DatabaseError(`Service not found: ${id}`, 'NOT_FOUND')
      return { id: snap.id, ...snap.data() } as ServiceRow
    })
  },

  async getByCategory(category: string, activeOnly = true): Promise<ServiceRow[]> {
    return handleOp(async () => {
      const constraints: QueryConstraint[] = [
        where('category', '==', category),
        orderBy('created_at', 'desc'),
      ]
      if (activeOnly) constraints.unshift(where('is_active', '==', true))

      const snap = await getDocs(query(collection(db, COLLECTIONS.SERVICES), ...constraints))
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as ServiceRow))
    })
  },

  async create(service: ServiceInsert): Promise<ServiceRow> {
    validateServiceData(service)
    return handleOp(async () => {
      const now = Timestamp.now()
      const data = { ...service, created_at: now, updated_at: now }
      const ref = await addDoc(collection(db, COLLECTIONS.SERVICES), data)
      return { id: ref.id, ...data } as unknown as ServiceRow
    })
  },

  async update(id: string, updates: ServiceUpdate): Promise<ServiceRow> {
    if (Object.keys(updates).length === 0) throw new ValidationError('No updates provided')
    return handleOp(async () => {
      const ref = doc(db, COLLECTIONS.SERVICES, id)
      await updateDoc(ref, { ...updates, updated_at: Timestamp.now() })
      const snap = await getDoc(ref)
      if (!snap.exists()) throw new DatabaseError(`Service not found: ${id}`, 'NOT_FOUND')
      return { id: snap.id, ...snap.data() } as ServiceRow
    })
  },

  async delete(id: string): Promise<void> {
    return handleOp(async () => {
      await deleteDoc(doc(db, COLLECTIONS.SERVICES, id))
    })
  },
}

// ---------------------------------------------------------------------------
// Gallery
// ---------------------------------------------------------------------------

export const galleryDb = {
  async getAll(featuredOnly = false): Promise<GalleryImageRow[]> {
    return handleOp(async () => {
      const constraints: QueryConstraint[] = [orderBy('created_at', 'desc')]
      if (featuredOnly) constraints.unshift(where('is_featured', '==', true))

      const snap = await getDocs(query(collection(db, COLLECTIONS.GALLERY), ...constraints))
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as GalleryImageRow))
    })
  },

  async getById(id: string): Promise<GalleryImageRow> {
    return handleOp(async () => {
      const snap = await getDoc(doc(db, COLLECTIONS.GALLERY, id))
      if (!snap.exists()) throw new DatabaseError(`Gallery image not found: ${id}`, 'NOT_FOUND')
      return { id: snap.id, ...snap.data() } as GalleryImageRow
    })
  },

  async getByCategory(category: string): Promise<GalleryImageRow[]> {
    return handleOp(async () => {
      const snap = await getDocs(
        query(
          collection(db, COLLECTIONS.GALLERY),
          where('category', '==', category),
          orderBy('created_at', 'desc')
        )
      )
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as GalleryImageRow))
    })
  },

  async getByTags(tags: string[]): Promise<GalleryImageRow[]> {
    return handleOp(async () => {
      // Firestore array-contains-any supports up to 30 values
      const snap = await getDocs(
        query(
          collection(db, COLLECTIONS.GALLERY),
          where('tags', 'array-contains-any', tags.slice(0, 30)),
          orderBy('created_at', 'desc')
        )
      )
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as GalleryImageRow))
    })
  },

  async create(image: GalleryImageInsert): Promise<GalleryImageRow> {
    validateGalleryImageData(image)
    return handleOp(async () => {
      const now = Timestamp.now()
      const data = { ...image, created_at: now }
      const ref = await addDoc(collection(db, COLLECTIONS.GALLERY), data)
      return { id: ref.id, ...data } as unknown as GalleryImageRow
    })
  },

  async update(id: string, updates: GalleryImageUpdate): Promise<GalleryImageRow> {
    if (Object.keys(updates).length === 0) throw new ValidationError('No updates provided')
    return handleOp(async () => {
      const ref = doc(db, COLLECTIONS.GALLERY, id)
      await updateDoc(ref, updates)
      const snap = await getDoc(ref)
      if (!snap.exists()) throw new DatabaseError(`Gallery image not found: ${id}`, 'NOT_FOUND')
      return { id: snap.id, ...snap.data() } as GalleryImageRow
    })
  },

  async delete(id: string): Promise<void> {
    return handleOp(async () => {
      await deleteDoc(doc(db, COLLECTIONS.GALLERY, id))
    })
  },
}

// ---------------------------------------------------------------------------
// Message threads
// ---------------------------------------------------------------------------

export const messageThreadsDb = {
  async getAll(): Promise<MessageThreadRow[]> {
    return handleOp(async () => {
      const snap = await getDocs(
        query(collection(db, COLLECTIONS.THREADS), orderBy('last_message_at', 'desc'))
      )
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as MessageThreadRow))
    })
  },

  async getById(id: string): Promise<MessageThreadRow> {
    return handleOp(async () => {
      const snap = await getDoc(doc(db, COLLECTIONS.THREADS, id))
      if (!snap.exists()) throw new DatabaseError(`Thread not found: ${id}`, 'NOT_FOUND')
      return { id: snap.id, ...snap.data() } as MessageThreadRow
    })
  },

  async getByEmail(email: string): Promise<MessageThreadRow[]> {
    return handleOp(async () => {
      const snap = await getDocs(
        query(
          collection(db, COLLECTIONS.THREADS),
          where('client_email', '==', email),
          orderBy('last_message_at', 'desc')
        )
      )
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as MessageThreadRow))
    })
  },

  async create(thread: MessageThreadInsert): Promise<MessageThreadRow> {
    validateMessageThreadData(thread)
    return handleOp(async () => {
      const now = Timestamp.now()
      const data = { ...thread, last_message_at: now, created_at: now }
      const ref = await addDoc(collection(db, COLLECTIONS.THREADS), data)
      return { id: ref.id, ...data } as unknown as MessageThreadRow
    })
  },

  async update(id: string, updates: MessageThreadUpdate): Promise<MessageThreadRow> {
    if (Object.keys(updates).length === 0) throw new ValidationError('No updates provided')
    return handleOp(async () => {
      const ref = doc(db, COLLECTIONS.THREADS, id)
      await updateDoc(ref, updates)
      const snap = await getDoc(ref)
      if (!snap.exists()) throw new DatabaseError(`Thread not found: ${id}`, 'NOT_FOUND')
      return { id: snap.id, ...snap.data() } as MessageThreadRow
    })
  },
}

// ---------------------------------------------------------------------------
// Messages (stored as a subcollection under each thread)
// ---------------------------------------------------------------------------

export const messagesDb = {
  async getByThreadId(threadId: string): Promise<MessageRow[]> {
    return handleOp(async () => {
      const snap = await getDocs(
        query(
          collection(db, COLLECTIONS.THREADS, threadId, COLLECTIONS.MESSAGES),
          orderBy('created_at', 'asc')
        )
      )
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as MessageRow))
    })
  },

  async create(message: MessageInsert): Promise<MessageRow> {
    validateMessageData(message)
    return handleOp(async () => {
      const now = Timestamp.now()
      const data = { ...message, created_at: now }

      // Add message to subcollection
      const ref = await addDoc(
        collection(db, COLLECTIONS.THREADS, message.thread_id, COLLECTIONS.MESSAGES),
        data
      )

      // Update thread's last_message_at
      await updateDoc(doc(db, COLLECTIONS.THREADS, message.thread_id), {
        last_message_at: now,
      })

      return { id: ref.id, ...data } as unknown as MessageRow
    })
  },

  async markAsRead(threadId: string, messageId: string): Promise<MessageRow> {
    return handleOp(async () => {
      const ref = doc(db, COLLECTIONS.THREADS, threadId, COLLECTIONS.MESSAGES, messageId)
      await updateDoc(ref, { read_at: Timestamp.now() })
      const snap = await getDoc(ref)
      if (!snap.exists()) throw new DatabaseError(`Message not found: ${messageId}`, 'NOT_FOUND')
      return { id: snap.id, ...snap.data() } as MessageRow
    })
  },

  async getUnreadCount(threadId?: string): Promise<number> {
    return handleOp(async () => {
      if (threadId) {
        const snap = await getDocs(
          query(
            collection(db, COLLECTIONS.THREADS, threadId, COLLECTIONS.MESSAGES),
            where('read_at', '==', null)
          )
        )
        return snap.size
      }

      // Cross-collection unread count — requires a collection group query
      // For now return 0 when no threadId; implement collection group in a later task
      return 0
    })
  },
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

function validateServiceData(service: ServiceInsert): void {
  if (!service.name?.trim()) throw new ValidationError('Service name is required', 'name')
  if (!service.category) throw new ValidationError('Service category is required', 'category')
  if (!['cuts', 'color', 'treatments', 'packages'].includes(service.category))
    throw new ValidationError('Invalid service category', 'category')
  if (typeof service.price !== 'number' || service.price < 0)
    throw new ValidationError('Service price must be a positive number', 'price')
  if (typeof service.duration !== 'number' || service.duration <= 0)
    throw new ValidationError('Service duration must be a positive number', 'duration')
}

function validateGalleryImageData(image: GalleryImageInsert): void {
  if (!image.image_url?.trim()) throw new ValidationError('Image URL is required', 'image_url')
  try { new URL(image.image_url) } catch {
    throw new ValidationError('Invalid image URL format', 'image_url')
  }
  if (image.thumbnail_url) {
    try { new URL(image.thumbnail_url) } catch {
      throw new ValidationError('Invalid thumbnail URL format', 'thumbnail_url')
    }
  }
}

function validateMessageThreadData(thread: MessageThreadInsert): void {
  if (!thread.client_email?.trim())
    throw new ValidationError('Client email is required', 'client_email')
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(thread.client_email))
    throw new ValidationError('Invalid email format', 'client_email')
  if (thread.status && !['open', 'closed', 'archived'].includes(thread.status))
    throw new ValidationError('Invalid thread status', 'status')
}

function validateMessageData(message: MessageInsert): void {
  if (!message.thread_id?.trim()) throw new ValidationError('Thread ID is required', 'thread_id')
  if (!message.sender_type) throw new ValidationError('Sender type is required', 'sender_type')
  if (!['client', 'admin'].includes(message.sender_type))
    throw new ValidationError('Invalid sender type', 'sender_type')
  if (!message.content?.trim()) throw new ValidationError('Message content is required', 'content')
}

// ---------------------------------------------------------------------------
// Data transformers (row → app model)
// ---------------------------------------------------------------------------

export function transformServiceRowToService(row: ServiceRow): Service {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? undefined,
    category: row.category,
    price: row.price,
    duration: row.duration,
    stylistName: row.stylist_name ?? undefined,
    imageUrl: row.image_url ?? undefined,
    isActive: row.is_active,
    createdAt: toDate(row.created_at),
    updatedAt: toDate(row.updated_at),
  }
}

export function transformGalleryImageRowToGalleryImage(row: GalleryImageRow): GalleryImage {
  return {
    id: row.id,
    title: row.title ?? undefined,
    description: row.description ?? undefined,
    imageUrl: row.image_url,
    thumbnailUrl: row.thumbnail_url ?? undefined,
    tags: row.tags,
    category: row.category ?? undefined,
    isFeatured: row.is_featured,
    createdAt: toDate(row.created_at),
  }
}

export function transformMessageThreadRowToMessageThread(row: MessageThreadRow): MessageThread {
  return {
    id: row.id,
    clientEmail: row.client_email,
    clientName: row.client_name ?? undefined,
    clientPhone: row.client_phone ?? undefined,
    status: row.status,
    lastMessageAt: toDate(row.last_message_at),
    createdAt: toDate(row.created_at),
  }
}

export function transformMessageRowToMessage(row: MessageRow): Message {
  return {
    id: row.id,
    threadId: row.thread_id,
    senderType: row.sender_type,
    senderName: row.sender_name ?? undefined,
    content: row.content,
    attachments: row.attachments?.map(att => ({
      id: att.id,
      fileName: att.file_name,
      fileUrl: att.file_url,
      fileType: att.file_type,
      fileSize: att.file_size,
    })),
    readAt: row.read_at ? toDate(row.read_at) : undefined,
    createdAt: toDate(row.created_at),
  }
}
