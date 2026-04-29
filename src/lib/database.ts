import { supabase, createServerClient } from './supabase'
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
  MessageUpdate
} from '@/types'

// Database error types
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

// Generic database operation wrapper with error handling
async function handleDatabaseOperation<T>(
  operation: () => Promise<{ data: T | null; error: any }>
): Promise<T> {
  try {
    const { data, error } = await operation()
    
    if (error) {
      throw new DatabaseError(
        error.message || 'Database operation failed',
        error.code,
        error.details
      )
    }
    
    if (!data) {
      throw new DatabaseError('No data returned from database operation')
    }
    
    return data
  } catch (error) {
    if (error instanceof DatabaseError || error instanceof ValidationError) {
      throw error
    }
    
    throw new DatabaseError(
      `Unexpected database error: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

// Services database operations
export const servicesDb = {
  async getAll(activeOnly = true): Promise<ServiceRow[]> {
    return handleDatabaseOperation(async () => {
      let query = supabase.from('services').select('*').order('created_at', { ascending: false })
      
      if (activeOnly) {
        query = query.eq('is_active', true)
      }
      
      return query
    })
  },

  async getById(id: string): Promise<ServiceRow> {
    return handleDatabaseOperation(async () => {
      return supabase
        .from('services')
        .select('*')
        .eq('id', id)
        .single()
    })
  },

  async getByCategory(category: string, activeOnly = true): Promise<ServiceRow[]> {
    return handleDatabaseOperation(async () => {
      let query = supabase
        .from('services')
        .select('*')
        .eq('category', category)
        .order('created_at', { ascending: false })
      
      if (activeOnly) {
        query = query.eq('is_active', true)
      }
      
      return query
    })
  },

  async create(service: ServiceInsert): Promise<ServiceRow> {
    validateServiceData(service)
    
    return handleDatabaseOperation(async () => {
      return supabase
        .from('services')
        .insert(service)
        .select()
        .single()
    })
  },

  async update(id: string, updates: ServiceUpdate): Promise<ServiceRow> {
    if (Object.keys(updates).length === 0) {
      throw new ValidationError('No updates provided')
    }
    
    return handleDatabaseOperation(async () => {
      return supabase
        .from('services')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
    })
  },

  async delete(id: string): Promise<void> {
    await handleDatabaseOperation(async () => {
      return supabase
        .from('services')
        .delete()
        .eq('id', id)
    })
  }
}

// Gallery database operations
export const galleryDb = {
  async getAll(featuredOnly = false): Promise<GalleryImageRow[]> {
    return handleDatabaseOperation(async () => {
      let query = supabase
        .from('gallery_images')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (featuredOnly) {
        query = query.eq('is_featured', true)
      }
      
      return query
    })
  },

  async getById(id: string): Promise<GalleryImageRow> {
    return handleDatabaseOperation(async () => {
      return supabase
        .from('gallery_images')
        .select('*')
        .eq('id', id)
        .single()
    })
  },

  async getByCategory(category: string): Promise<GalleryImageRow[]> {
    return handleDatabaseOperation(async () => {
      return supabase
        .from('gallery_images')
        .select('*')
        .eq('category', category)
        .order('created_at', { ascending: false })
    })
  },

  async getByTags(tags: string[]): Promise<GalleryImageRow[]> {
    return handleDatabaseOperation(async () => {
      return supabase
        .from('gallery_images')
        .select('*')
        .overlaps('tags', tags)
        .order('created_at', { ascending: false })
    })
  },

  async create(image: GalleryImageInsert): Promise<GalleryImageRow> {
    validateGalleryImageData(image)
    
    return handleDatabaseOperation(async () => {
      return supabase
        .from('gallery_images')
        .insert(image)
        .select()
        .single()
    })
  },

  async update(id: string, updates: GalleryImageUpdate): Promise<GalleryImageRow> {
    if (Object.keys(updates).length === 0) {
      throw new ValidationError('No updates provided')
    }
    
    return handleDatabaseOperation(async () => {
      return supabase
        .from('gallery_images')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
    })
  },

  async delete(id: string): Promise<void> {
    await handleDatabaseOperation(async () => {
      return supabase
        .from('gallery_images')
        .delete()
        .eq('id', id)
    })
  }
}

// Message threads database operations
export const messageThreadsDb = {
  async getAll(): Promise<MessageThreadRow[]> {
    return handleDatabaseOperation(async () => {
      return supabase
        .from('message_threads')
        .select('*')
        .order('last_message_at', { ascending: false })
    })
  },

  async getById(id: string): Promise<MessageThreadRow> {
    return handleDatabaseOperation(async () => {
      return supabase
        .from('message_threads')
        .select('*')
        .eq('id', id)
        .single()
    })
  },

  async getByEmail(email: string): Promise<MessageThreadRow[]> {
    return handleDatabaseOperation(async () => {
      return supabase
        .from('message_threads')
        .select('*')
        .eq('client_email', email)
        .order('last_message_at', { ascending: false })
    })
  },

  async create(thread: MessageThreadInsert): Promise<MessageThreadRow> {
    validateMessageThreadData(thread)
    
    return handleDatabaseOperation(async () => {
      return supabase
        .from('message_threads')
        .insert(thread)
        .select()
        .single()
    })
  },

  async update(id: string, updates: MessageThreadUpdate): Promise<MessageThreadRow> {
    if (Object.keys(updates).length === 0) {
      throw new ValidationError('No updates provided')
    }
    
    return handleDatabaseOperation(async () => {
      return supabase
        .from('message_threads')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
    })
  }
}

// Messages database operations
export const messagesDb = {
  async getByThreadId(threadId: string): Promise<MessageRow[]> {
    return handleDatabaseOperation(async () => {
      return supabase
        .from('messages')
        .select('*')
        .eq('thread_id', threadId)
        .order('created_at', { ascending: true })
    })
  },

  async create(message: MessageInsert): Promise<MessageRow> {
    validateMessageData(message)
    
    return handleDatabaseOperation(async () => {
      return supabase
        .from('messages')
        .insert(message)
        .select()
        .single()
    })
  },

  async markAsRead(id: string): Promise<MessageRow> {
    return handleDatabaseOperation(async () => {
      return supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()
    })
  },

  async getUnreadCount(threadId?: string): Promise<number> {
    try {
      let query = supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .is('read_at', null)
      
      if (threadId) {
        query = query.eq('thread_id', threadId)
      }
      
      const { count, error } = await query
      
      if (error) {
        throw new DatabaseError(
          error.message || 'Failed to get unread count',
          error.code,
          error.details
        )
      }
      
      return count || 0
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error
      }
      
      throw new DatabaseError(
        `Failed to get unread count: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }
}

// Validation functions
function validateServiceData(service: ServiceInsert): void {
  if (!service.name?.trim()) {
    throw new ValidationError('Service name is required', 'name')
  }
  
  if (!service.category) {
    throw new ValidationError('Service category is required', 'category')
  }
  
  if (!['cuts', 'color', 'treatments', 'packages'].includes(service.category)) {
    throw new ValidationError('Invalid service category', 'category')
  }
  
  if (typeof service.price !== 'number' || service.price < 0) {
    throw new ValidationError('Service price must be a positive number', 'price')
  }
  
  if (typeof service.duration !== 'number' || service.duration <= 0) {
    throw new ValidationError('Service duration must be a positive number', 'duration')
  }
}

function validateGalleryImageData(image: GalleryImageInsert): void {
  if (!image.image_url?.trim()) {
    throw new ValidationError('Image URL is required', 'image_url')
  }
  
  // Validate URL format
  try {
    new URL(image.image_url)
  } catch {
    throw new ValidationError('Invalid image URL format', 'image_url')
  }
  
  if (image.thumbnail_url) {
    try {
      new URL(image.thumbnail_url)
    } catch {
      throw new ValidationError('Invalid thumbnail URL format', 'thumbnail_url')
    }
  }
}

function validateMessageThreadData(thread: MessageThreadInsert): void {
  if (!thread.client_email?.trim()) {
    throw new ValidationError('Client email is required', 'client_email')
  }
  
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(thread.client_email)) {
    throw new ValidationError('Invalid email format', 'client_email')
  }
  
  if (thread.status && !['open', 'closed', 'archived'].includes(thread.status)) {
    throw new ValidationError('Invalid thread status', 'status')
  }
}

function validateMessageData(message: MessageInsert): void {
  if (!message.thread_id?.trim()) {
    throw new ValidationError('Thread ID is required', 'thread_id')
  }
  
  if (!message.sender_type) {
    throw new ValidationError('Sender type is required', 'sender_type')
  }
  
  if (!['client', 'admin'].includes(message.sender_type)) {
    throw new ValidationError('Invalid sender type', 'sender_type')
  }
  
  if (!message.content?.trim()) {
    throw new ValidationError('Message content is required', 'content')
  }
}

// Utility functions for data transformation
export function transformServiceRowToService(row: ServiceRow): import('@/types').Service {
  return {
    id: row.id,
    name: row.name,
    description: row.description || undefined,
    category: row.category,
    price: row.price,
    duration: row.duration,
    stylistName: row.stylist_name || undefined,
    imageUrl: row.image_url || undefined,
    isActive: row.is_active,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at)
  }
}

export function transformGalleryImageRowToGalleryImage(row: GalleryImageRow): import('@/types').GalleryImage {
  return {
    id: row.id,
    title: row.title || undefined,
    description: row.description || undefined,
    imageUrl: row.image_url,
    thumbnailUrl: row.thumbnail_url || undefined,
    tags: row.tags,
    category: row.category || undefined,
    isFeatured: row.is_featured,
    createdAt: new Date(row.created_at)
  }
}

export function transformMessageThreadRowToMessageThread(row: MessageThreadRow): import('@/types').MessageThread {
  return {
    id: row.id,
    clientEmail: row.client_email,
    clientName: row.client_name || undefined,
    clientPhone: row.client_phone || undefined,
    status: row.status,
    lastMessageAt: new Date(row.last_message_at),
    createdAt: new Date(row.created_at)
  }
}

export function transformMessageRowToMessage(row: MessageRow): import('@/types').Message {
  return {
    id: row.id,
    threadId: row.thread_id,
    senderType: row.sender_type,
    senderName: row.sender_name || undefined,
    content: row.content,
    attachments: row.attachments?.map(att => ({
      id: att.id,
      fileName: att.file_name,
      fileUrl: att.file_url,
      fileType: att.file_type,
      fileSize: att.file_size
    })),
    readAt: row.read_at ? new Date(row.read_at) : undefined,
    createdAt: new Date(row.created_at)
  }
}