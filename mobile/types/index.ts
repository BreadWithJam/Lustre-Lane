export type ServiceCategory = 'cuts' | 'color' | 'treatments' | 'packages'
export type MessageThreadStatus = 'open' | 'closed' | 'archived'
export type MessageSenderType = 'client' | 'admin'

export interface Service {
  id: string
  name: string
  description?: string
  category: ServiceCategory
  price: number
  duration: number
  stylistName?: string
  imageUrl?: string
  isActive: boolean
  createdAt: string
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
  createdAt: string
}

export interface Message {
  id: string
  threadId: string
  senderType: MessageSenderType
  senderName?: string
  content: string
  readAt?: string
  createdAt: string
}

export interface MessageThread {
  id: string
  clientEmail: string
  clientName?: string
  status: MessageThreadStatus
  messages?: Message[]
  lastMessageAt: string
  createdAt: string
}
