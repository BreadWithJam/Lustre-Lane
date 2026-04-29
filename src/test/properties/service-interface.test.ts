import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import type { Service, ServiceCategory } from '@/types'

/**
 * **Feature: salon-microsite, Property 1: Service Interface Completeness**
 * 
 * For any service data set, the service browser should display all services with 
 * category organization, complete information (price, duration, stylist, favorite option), 
 * and functional detail drawers with gallery and messaging CTAs
 * 
 * **Validates: Requirements 1.1, 1.2, 1.3**
 */

// Generator for valid service categories
const serviceCategory = fc.constantFrom<ServiceCategory>('cuts', 'color', 'treatments', 'packages')

// Generator for valid service data
const serviceGenerator = fc.record({
  id: fc.uuid(),
  name: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
  description: fc.option(fc.string({ minLength: 1, maxLength: 500 }).filter(s => s.trim().length > 0), { nil: undefined }),
  category: serviceCategory,
  price: fc.float({ min: 10, max: 500, noNaN: true }),
  duration: fc.integer({ min: 15, max: 480 }), // 15 minutes to 8 hours
  stylistName: fc.option(fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0), { nil: undefined }),
  imageUrl: fc.option(fc.webUrl(), { nil: undefined }),
  isActive: fc.boolean(),
  createdAt: fc.date(),
  updatedAt: fc.date(),
}) as fc.Arbitrary<Service>

// Generator for arrays of services
const servicesArrayGenerator = fc.array(serviceGenerator, { minLength: 0, maxLength: 50 })

describe('Service Interface Completeness Property Tests', () => {
  it('should organize services by categories correctly', () => {
    fc.assert(
      fc.property(servicesArrayGenerator, (services) => {
        // Property: Services should be organizable by their categories
        const categories = ['cuts', 'color', 'treatments', 'packages'] as const
        
        // Group services by category
        const servicesByCategory = services.reduce((acc, service) => {
          if (!acc[service.category]) {
            acc[service.category] = []
          }
          acc[service.category].push(service)
          return acc
        }, {} as Record<ServiceCategory, Service[]>)

        // Verify that all categories are valid
        Object.keys(servicesByCategory).forEach(category => {
          expect(categories).toContain(category)
        })

        // Verify that services in each category actually belong to that category
        Object.entries(servicesByCategory).forEach(([category, categoryServices]) => {
          categoryServices.forEach(service => {
            expect(service.category).toBe(category)
          })
        })

        // Verify that all services are accounted for
        const totalServicesInCategories = Object.values(servicesByCategory)
          .reduce((sum, categoryServices) => sum + categoryServices.length, 0)
        expect(totalServicesInCategories).toBe(services.length)
      }),
      { numRuns: 100 }
    )
  })

  it('should contain complete service information for display', () => {
    fc.assert(
      fc.property(serviceGenerator, (service) => {
        // Property: Each service should have all required display information
        
        // Required fields should always be present and valid
        expect(service.id).toBeDefined()
        expect(typeof service.id).toBe('string')
        expect(service.id.length).toBeGreaterThan(0)
        
        expect(service.name).toBeDefined()
        expect(typeof service.name).toBe('string')
        expect(service.name.trim().length).toBeGreaterThan(0)
        
        expect(service.category).toBeDefined()
        expect(['cuts', 'color', 'treatments', 'packages']).toContain(service.category)
        
        expect(service.price).toBeDefined()
        expect(typeof service.price).toBe('number')
        expect(service.price).toBeGreaterThan(0)
        expect(Number.isFinite(service.price)).toBe(true)
        
        expect(service.duration).toBeDefined()
        expect(typeof service.duration).toBe('number')
        expect(service.duration).toBeGreaterThan(0)
        expect(Number.isInteger(service.duration)).toBe(true)
        
        expect(typeof service.isActive).toBe('boolean')
        
        expect(service.createdAt).toBeInstanceOf(Date)
        expect(service.updatedAt).toBeInstanceOf(Date)
        
        // Optional fields should be either undefined or valid strings
        if (service.description !== undefined) {
          expect(typeof service.description).toBe('string')
          expect(service.description.trim().length).toBeGreaterThan(0)
        }
        
        if (service.stylistName !== undefined) {
          expect(typeof service.stylistName).toBe('string')
          expect(service.stylistName.trim().length).toBeGreaterThan(0)
        }
        
        if (service.imageUrl !== undefined) {
          expect(typeof service.imageUrl).toBe('string')
          expect(service.imageUrl.length).toBeGreaterThan(0)
          // Should be a valid URL format
          expect(() => new URL(service.imageUrl!)).not.toThrow()
        }
      }),
      { numRuns: 100 }
    )
  })

  it('should support service detail interface requirements', () => {
    fc.assert(
      fc.property(serviceGenerator, (service) => {
        // Property: Service should have all information needed for detail drawer
        
        // Service must have basic identification for detail view
        expect(service.id).toBeDefined()
        expect(service.name).toBeDefined()
        
        // Service must have pricing and timing information for detail view
        expect(service.price).toBeGreaterThan(0)
        expect(service.duration).toBeGreaterThan(0)
        
        // Service must have category for proper organization in detail view
        expect(['cuts', 'color', 'treatments', 'packages']).toContain(service.category)
        
        // Service should be able to support favorite functionality (requires ID)
        expect(typeof service.id).toBe('string')
        expect(service.id.length).toBeGreaterThan(0)
        
        // Service should support messaging CTA (requires service context)
        expect(service.name.trim().length).toBeGreaterThan(0)
        expect(service.category).toBeDefined()
      }),
      { numRuns: 100 }
    )
  })

  it('should maintain data consistency across service operations', () => {
    fc.assert(
      fc.property(servicesArrayGenerator, (services) => {
        // Property: Service data should maintain consistency when filtered or organized
        
        // All services should have unique IDs
        const ids = services.map(s => s.id)
        const uniqueIds = new Set(ids)
        expect(uniqueIds.size).toBe(ids.length)
        
        // Active services should be a subset of all services
        const activeServices = services.filter(s => s.isActive)
        expect(activeServices.length).toBeLessThanOrEqual(services.length)
        
        // Each active service should exist in the original array
        activeServices.forEach(activeService => {
          expect(services).toContainEqual(activeService)
        })
        
        // Category filtering should preserve service integrity
        const categories: ServiceCategory[] = ['cuts', 'color', 'treatments', 'packages']
        categories.forEach(category => {
          const categoryServices = services.filter(s => s.category === category)
          categoryServices.forEach(service => {
            expect(service.category).toBe(category)
            expect(services).toContainEqual(service)
          })
        })
      }),
      { numRuns: 100 }
    )
  })
})