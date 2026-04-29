// Core data types for the salon microsite

export type ServiceCategory = 'cuts' | 'color' | 'treatments' | 'packages'
export type MessageThreadStatus = 'open' | 'closed' | 'archived'
export type MessageSenderType = 'client' | 'admin'

// Database row interfaces (snake_case to match Supabase)
export interface ServiceRow {
  id: string
  name: string
  description: string | null
  category: ServiceCategory
  price: number
  duration: number
  stylist_name: string | null
  image_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface GalleryImageRow {
  id: string
  title: string | null
  description: string | null
  image_url: string
  thumbnail_url: string | null
  tags: string[]
  category: string | null
  is_featured: boolean
  created_at: string
}

export interface MessageThreadRow {
  id: string
  client_email: string
  client_name: string | null
  client_phone: string | null
  status: MessageThreadStatus
  last_message_at: string
  created_at: string
}

export interface MessageRow {
  id: string
  thread_id: string
  sender_type: MessageSenderType
  sender_name: string | null
  content: string
  attachments: AttachmentData[]
  read_at: string | null
  created_at: string
}

// Application interfaces (camelCase for frontend use)
export interface Service {
  id: string
  name: string
  description?: string
  category: ServiceCategory
  price: number
  duration: number // minutes
  stylistName?: string
  imageUrl?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface GalleryImage {
  id: string
  title?: string
  description?: string
  imageUrl: string
  thumbnailUrl?: string
  tags: string[]
  category?: string
  isFeatured: boolean
  createdAt: Date
}

export interface MessageThread {
  id: string
  clientEmail: string
  clientName?: string
  clientPhone?: string
  status: MessageThreadStatus
  messages?: Message[]
  lastMessageAt: Date
  createdAt: Date
}

export interface Message {
  id: string
  threadId: string
  senderType: MessageSenderType
  senderName?: string
  content: string
  attachments?: Attachment[]
  readAt?: Date
  createdAt: Date
}

export interface Attachment {
  id: string
  fileName: string
  fileUrl: string
  fileType: string
  fileSize: number
}

// Raw attachment data as stored in database
export interface AttachmentData {
  id: string
  file_name: string
  file_url: string
  file_type: string
  file_size: number
}

// Insert/Update types (omit auto-generated fields)
export type ServiceInsert = Omit<ServiceRow, 'id' | 'created_at' | 'updated_at'>
export type ServiceUpdate = Partial<ServiceInsert>

export type GalleryImageInsert = Omit<GalleryImageRow, 'id' | 'created_at'>
export type GalleryImageUpdate = Partial<GalleryImageInsert>

export type MessageThreadInsert = Omit<MessageThreadRow, 'id' | 'created_at' | 'last_message_at'>
export type MessageThreadUpdate = Partial<Pick<MessageThreadRow, 'client_name' | 'client_phone' | 'status'>>

export type MessageInsert = Omit<MessageRow, 'id' | 'created_at'>
export type MessageUpdate = Partial<Pick<MessageRow, 'read_at'>>

// API Response types
export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

// Form types
export interface ContactForm {
  name: string
  email: string
  phone?: string
  message: string
  serviceInterest?: string
}

// UI State types
export interface UIState {
  isLoading: boolean
  error?: string
  selectedService?: Service
  selectedImage?: GalleryImage
  activeThread?: MessageThread
}

// Filter types
export interface ServiceFilters {
  category?: ServiceCategory
  priceRange?: [number, number]
  duration?: number
  stylist?: string
}

export interface GalleryFilters {
  category?: string
  tags?: string[]
  featured?: boolean
}