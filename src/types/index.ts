// Core data types for the salon microsite

export type ServiceCategory = 'cuts' | 'color' | 'treatments' | 'packages'

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
  status: 'open' | 'closed' | 'archived'
  messages: Message[]
  lastMessageAt: Date
  createdAt: Date
}

export interface Message {
  id: string
  threadId: string
  senderType: 'client' | 'admin'
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