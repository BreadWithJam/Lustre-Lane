import { describe, it, expect, vi, beforeEach } from 'vitest'
import { 
  DatabaseError, 
  ValidationError,
  transformServiceRowToService,
  transformGalleryImageRowToGalleryImage,
  transformMessageThreadRowToMessageThread,
  transformMessageRowToMessage
} from '../database'
import type { ServiceRow, GalleryImageRow, MessageThreadRow, MessageRow } from '@/types'

// Mock Firebase so the module can be imported without real credentials
vi.mock('../firebase', () => ({
  db: {},
  auth: {},
  storage: {},
}))

describe('Database Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Error Classes', () => {
    it('should create DatabaseError with message and code', () => {
      const error = new DatabaseError('Test error', 'TEST_CODE', 'Test details')
      
      expect(error.message).toBe('Test error')
      expect(error.code).toBe('TEST_CODE')
      expect(error.details).toBe('Test details')
      expect(error.name).toBe('DatabaseError')
    })

    it('should create ValidationError with message and field', () => {
      const error = new ValidationError('Invalid field', 'test_field')
      
      expect(error.message).toBe('Invalid field')
      expect(error.field).toBe('test_field')
      expect(error.name).toBe('ValidationError')
    })
  })

  describe('Data Transformation Functions', () => {
    it('should transform ServiceRow to Service', () => {
      const serviceRow: ServiceRow = {
        id: '123',
        name: 'Test Service',
        description: 'Test description',
        category: 'cuts',
        price: 50.00,
        duration: 60,
        stylist_name: 'John Doe',
        image_url: 'https://example.com/image.jpg',
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }

      const service = transformServiceRowToService(serviceRow)

      expect(service).toEqual({
        id: '123',
        name: 'Test Service',
        description: 'Test description',
        category: 'cuts',
        price: 50.00,
        duration: 60,
        stylistName: 'John Doe',
        imageUrl: 'https://example.com/image.jpg',
        isActive: true,
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z')
      })
    })

    it('should transform ServiceRow with null values', () => {
      const serviceRow: ServiceRow = {
        id: '123',
        name: 'Test Service',
        description: null,
        category: 'cuts',
        price: 50.00,
        duration: 60,
        stylist_name: null,
        image_url: null,
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }

      const service = transformServiceRowToService(serviceRow)

      expect(service.description).toBeUndefined()
      expect(service.stylistName).toBeUndefined()
      expect(service.imageUrl).toBeUndefined()
    })

    it('should transform GalleryImageRow to GalleryImage', () => {
      const galleryImageRow: GalleryImageRow = {
        id: '456',
        title: 'Test Image',
        description: 'Test description',
        image_url: 'https://example.com/image.jpg',
        thumbnail_url: 'https://example.com/thumb.jpg',
        tags: ['tag1', 'tag2'],
        category: 'cuts',
        is_featured: true,
        created_at: '2024-01-01T00:00:00Z'
      }

      const galleryImage = transformGalleryImageRowToGalleryImage(galleryImageRow)

      expect(galleryImage).toEqual({
        id: '456',
        title: 'Test Image',
        description: 'Test description',
        imageUrl: 'https://example.com/image.jpg',
        thumbnailUrl: 'https://example.com/thumb.jpg',
        tags: ['tag1', 'tag2'],
        category: 'cuts',
        isFeatured: true,
        createdAt: new Date('2024-01-01T00:00:00Z')
      })
    })

    it('should transform MessageThreadRow to MessageThread', () => {
      const messageThreadRow: MessageThreadRow = {
        id: '789',
        client_email: 'test@example.com',
        client_name: 'Test Client',
        client_phone: '555-1234',
        status: 'open',
        last_message_at: '2024-01-01T00:00:00Z',
        created_at: '2024-01-01T00:00:00Z'
      }

      const messageThread = transformMessageThreadRowToMessageThread(messageThreadRow)

      expect(messageThread).toEqual({
        id: '789',
        clientEmail: 'test@example.com',
        clientName: 'Test Client',
        clientPhone: '555-1234',
        status: 'open',
        lastMessageAt: new Date('2024-01-01T00:00:00Z'),
        createdAt: new Date('2024-01-01T00:00:00Z')
      })
    })

    it('should transform MessageRow to Message', () => {
      const messageRow: MessageRow = {
        id: '101',
        thread_id: '789',
        sender_type: 'client',
        sender_name: 'Test Client',
        content: 'Hello, I need help',
        attachments: [
          {
            id: 'att1',
            file_name: 'image.jpg',
            file_url: 'https://example.com/image.jpg',
            file_type: 'image/jpeg',
            file_size: 1024
          }
        ],
        read_at: '2024-01-01T01:00:00Z',
        created_at: '2024-01-01T00:00:00Z'
      }

      const message = transformMessageRowToMessage(messageRow)

      expect(message).toEqual({
        id: '101',
        threadId: '789',
        senderType: 'client',
        senderName: 'Test Client',
        content: 'Hello, I need help',
        attachments: [
          {
            id: 'att1',
            fileName: 'image.jpg',
            fileUrl: 'https://example.com/image.jpg',
            fileType: 'image/jpeg',
            fileSize: 1024
          }
        ],
        readAt: new Date('2024-01-01T01:00:00Z'),
        createdAt: new Date('2024-01-01T00:00:00Z')
      })
    })

    it('should handle MessageRow with null values', () => {
      const messageRow: MessageRow = {
        id: '101',
        thread_id: '789',
        sender_type: 'client',
        sender_name: null,
        content: 'Hello, I need help',
        attachments: [],
        read_at: null,
        created_at: '2024-01-01T00:00:00Z'
      }

      const message = transformMessageRowToMessage(messageRow)

      expect(message.senderName).toBeUndefined()
      expect(message.readAt).toBeUndefined()
      expect(message.attachments).toEqual([])
    })
  })
})