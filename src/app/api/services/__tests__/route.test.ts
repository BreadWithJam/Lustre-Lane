import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { GET, POST } from '../route'

// Mock Firebase so the module can be imported without real credentials
vi.mock('@/lib/firebase', () => ({
  db: {},
  auth: {},
  storage: {},
}))

// Mock the database module
vi.mock('@/lib/database', () => ({
  servicesDb: {
    getAll: vi.fn(),
    getByCategory: vi.fn(),
    create: vi.fn(),
  },
  transformServiceRowToService: vi.fn(),
}))

describe('/api/services', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET', () => {
    it('should fetch all services successfully', async () => {
      const mockServices = [
        {
          id: '1',
          name: 'Test Service',
          description: null,
          category: 'cuts' as const,
          price: 50,
          duration: 60,
          stylist_name: null,
          image_url: null,
          is_active: true,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }
      ]

      const { servicesDb, transformServiceRowToService } = await import('@/lib/database')
      vi.mocked(servicesDb.getAll).mockResolvedValue(mockServices)
      vi.mocked(transformServiceRowToService).mockReturnValue({
        id: '1',
        name: 'Test Service',
        category: 'cuts',
        price: 50,
        duration: 60,
        isActive: true,
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z')
      })

      const request = new NextRequest('http://localhost:3000/api/services')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.data).toHaveLength(1)
      expect(data.data[0].name).toBe('Test Service')
    })

    it('should filter services by category', async () => {
      const mockServices = [
        {
          id: '1',
          name: 'Cut Service',
          description: null,
          category: 'cuts' as const,
          price: 50,
          duration: 60,
          stylist_name: null,
          image_url: null,
          is_active: true,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }
      ]

      const { servicesDb, transformServiceRowToService } = await import('@/lib/database')
      vi.mocked(servicesDb.getByCategory).mockResolvedValue(mockServices)
      vi.mocked(transformServiceRowToService).mockReturnValue({
        id: '1',
        name: 'Cut Service',
        category: 'cuts',
        price: 50,
        duration: 60,
        isActive: true,
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z')
      })

      const request = new NextRequest('http://localhost:3000/api/services?category=cuts')
      const response = await GET(request)
      const data = await response.json()

      expect(servicesDb.getByCategory).toHaveBeenCalledWith('cuts', true)
      expect(response.status).toBe(200)
      expect(data.data).toHaveLength(1)
    })

    it('should handle database errors gracefully', async () => {
      const { servicesDb } = await import('@/lib/database')
      vi.mocked(servicesDb.getAll).mockRejectedValue(new Error('Database connection failed'))

      const request = new NextRequest('http://localhost:3000/api/services')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to fetch services')
    })
  })

  describe('POST', () => {
    it('should create a new service successfully', async () => {
      const newServiceData = {
        name: 'New Service',
        category: 'cuts',
        price: 75,
        duration: 90,
        stylistName: 'John Doe',
        isActive: true
      }

      const mockCreatedService = {
        id: '2',
        name: 'New Service',
        description: null,
        category: 'cuts' as const,
        price: 75,
        duration: 90,
        stylist_name: 'John Doe',
        image_url: null,
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }

      const { servicesDb, transformServiceRowToService } = await import('@/lib/database')
      vi.mocked(servicesDb.create).mockResolvedValue(mockCreatedService)
      vi.mocked(transformServiceRowToService).mockReturnValue({
        id: '2',
        name: 'New Service',
        category: 'cuts',
        price: 75,
        duration: 90,
        stylistName: 'John Doe',
        isActive: true,
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z')
      })

      const request = new NextRequest('http://localhost:3000/api/services', {
        method: 'POST',
        body: JSON.stringify(newServiceData),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.data.name).toBe('New Service')
      expect(servicesDb.create).toHaveBeenCalledWith({
        name: 'New Service',
        description: null,
        category: 'cuts',
        price: 75,
        duration: 90,
        stylist_name: 'John Doe',
        image_url: null,
        is_active: true
      })
    })

    it('should handle validation errors', async () => {
      const { servicesDb } = await import('@/lib/database')
      vi.mocked(servicesDb.create).mockRejectedValue(new Error('Validation failed'))

      const request = new NextRequest('http://localhost:3000/api/services', {
        method: 'POST',
        body: JSON.stringify({ name: '' }),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBeTruthy()
    })
  })
})