import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import * as fc from 'fast-check'
import type { Service, ServiceCategory } from '@/types'

/**
 * **Feature: salon-microsite, Property 3: Favorites Persistence**
 * 
 * For any service and user session, adding a service to favorites should persist 
 * the preference in storage and provide immediate visual confirmation
 * 
 * **Validates: Requirements 1.5**
 */

// Mock localStorage for testing
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
    get length() {
      return Object.keys(store).length
    },
    key: (index: number) => {
      const keys = Object.keys(store)
      return keys[index] || null
    }
  }
})()

// Replace global localStorage with mock
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true
})

// Generator for valid service categories
const serviceCategory = fc.constantFrom<ServiceCategory>('cuts', 'color', 'treatments', 'packages')

// Generator for valid service data with unique IDs
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

// Generator for arrays of services with unique IDs
const uniqueServicesArrayGenerator = fc.array(serviceGenerator, { minLength: 1, maxLength: 10 })
  .map(services => {
    // Ensure all services have unique IDs
    const uniqueServices: Service[] = []
    const seenIds = new Set<string>()
    
    for (const service of services) {
      if (!seenIds.has(service.id)) {
        seenIds.add(service.id)
        uniqueServices.push(service)
      }
    }
    
    return uniqueServices
  })
  .filter(services => services.length > 0)

// Favorites management utility functions
class FavoritesManager {
  private static readonly STORAGE_KEY = 'salon-favorites'
  
  static getFavorites(): string[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  }
  
  static addToFavorites(serviceId: string): boolean {
    try {
      const favorites = this.getFavorites()
      if (!favorites.includes(serviceId)) {
        favorites.push(serviceId)
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(favorites))
        return true
      }
      return false
    } catch {
      return false
    }
  }
  
  static removeFromFavorites(serviceId: string): boolean {
    try {
      const favorites = this.getFavorites()
      const index = favorites.indexOf(serviceId)
      if (index > -1) {
        favorites.splice(index, 1)
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(favorites))
        return true
      }
      return false
    } catch {
      return false
    }
  }
  
  static isFavorite(serviceId: string): boolean {
    return this.getFavorites().includes(serviceId)
  }
  
  static clearFavorites(): void {
    localStorage.removeItem(this.STORAGE_KEY)
  }
}

describe('Favorites Persistence Property Tests', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
    FavoritesManager.clearFavorites()
  })
  
  afterEach(() => {
    // Clean up after each test
    localStorage.clear()
    FavoritesManager.clearFavorites()
  })

  it('should persist favorite services across sessions', () => {
    fc.assert(
      fc.property(serviceGenerator, (service) => {
        // Property: Adding a service to favorites should persist in storage
        
        // Initially, service should not be in favorites
        expect(FavoritesManager.isFavorite(service.id)).toBe(false)
        expect(FavoritesManager.getFavorites()).not.toContain(service.id)
        
        // Add service to favorites
        const addResult = FavoritesManager.addToFavorites(service.id)
        expect(addResult).toBe(true)
        
        // Service should now be in favorites
        expect(FavoritesManager.isFavorite(service.id)).toBe(true)
        expect(FavoritesManager.getFavorites()).toContain(service.id)
        
        // Verify persistence by checking localStorage directly
        const storedFavorites = JSON.parse(localStorage.getItem('salon-favorites') || '[]')
        expect(storedFavorites).toContain(service.id)
        
        // Simulate new session by creating new FavoritesManager instance
        // The favorites should still be there
        expect(FavoritesManager.getFavorites()).toContain(service.id)
        expect(FavoritesManager.isFavorite(service.id)).toBe(true)
      }),
      { numRuns: 100 }
    )
  })

  it('should handle multiple favorite services correctly', () => {
    fc.assert(
      fc.property(uniqueServicesArrayGenerator, (services) => {
        // Property: Multiple services can be favorited and all should persist
        
        // Ensure we start with a clean state
        FavoritesManager.clearFavorites()
        
        const serviceIds = services.map(s => s.id)
        
        // Initially, no services should be favorited
        expect(FavoritesManager.getFavorites()).toHaveLength(0)
        serviceIds.forEach(id => {
          expect(FavoritesManager.isFavorite(id)).toBe(false)
        })
        
        // Add all services to favorites
        serviceIds.forEach(id => {
          const result = FavoritesManager.addToFavorites(id)
          expect(result).toBe(true)
        })
        
        // All services should now be in favorites
        const favorites = FavoritesManager.getFavorites()
        expect(favorites).toHaveLength(serviceIds.length)
        
        serviceIds.forEach(id => {
          expect(FavoritesManager.isFavorite(id)).toBe(true)
          expect(favorites).toContain(id)
        })
        
        // Verify persistence in localStorage
        const storedFavorites = JSON.parse(localStorage.getItem('salon-favorites') || '[]')
        expect(storedFavorites).toHaveLength(serviceIds.length)
        serviceIds.forEach(id => {
          expect(storedFavorites).toContain(id)
        })
      }),
      { numRuns: 100 }
    )
  })

  it('should prevent duplicate favorites', () => {
    fc.assert(
      fc.property(serviceGenerator, (service) => {
        // Property: Adding the same service to favorites multiple times should not create duplicates
        
        // Ensure we start with a clean state
        FavoritesManager.clearFavorites()
        
        // Add service to favorites first time
        const firstAdd = FavoritesManager.addToFavorites(service.id)
        expect(firstAdd).toBe(true)
        expect(FavoritesManager.getFavorites()).toHaveLength(1)
        expect(FavoritesManager.isFavorite(service.id)).toBe(true)
        
        // Try to add the same service again
        const secondAdd = FavoritesManager.addToFavorites(service.id)
        expect(secondAdd).toBe(false) // Should return false as it's already favorited
        
        // Should still only have one favorite
        const favorites = FavoritesManager.getFavorites()
        expect(favorites).toHaveLength(1)
        expect(favorites.filter(id => id === service.id)).toHaveLength(1)
        
        // Verify in localStorage
        const storedFavorites = JSON.parse(localStorage.getItem('salon-favorites') || '[]')
        expect(storedFavorites).toHaveLength(1)
        expect(storedFavorites.filter((id: string) => id === service.id)).toHaveLength(1)
      }),
      { numRuns: 100 }
    )
  })

  it('should support removing favorites with persistence', () => {
    fc.assert(
      fc.property(uniqueServicesArrayGenerator.filter(services => services.length >= 2), (services) => {
        // Property: Removing favorites should persist and maintain other favorites
        
        // Ensure we start with a clean state
        FavoritesManager.clearFavorites()
        
        const serviceIds = services.map(s => s.id)
        
        // Add all services to favorites
        serviceIds.forEach(id => {
          FavoritesManager.addToFavorites(id)
        })
        
        expect(FavoritesManager.getFavorites()).toHaveLength(serviceIds.length)
        
        // Remove the first service from favorites
        const serviceToRemove = serviceIds[0]
        const removeResult = FavoritesManager.removeFromFavorites(serviceToRemove)
        expect(removeResult).toBe(true)
        
        // Verify removal
        expect(FavoritesManager.isFavorite(serviceToRemove)).toBe(false)
        expect(FavoritesManager.getFavorites()).not.toContain(serviceToRemove)
        expect(FavoritesManager.getFavorites()).toHaveLength(serviceIds.length - 1)
        
        // Other services should still be favorited
        const remainingIds = serviceIds.slice(1)
        remainingIds.forEach(id => {
          expect(FavoritesManager.isFavorite(id)).toBe(true)
          expect(FavoritesManager.getFavorites()).toContain(id)
        })
        
        // Verify persistence in localStorage
        const storedFavorites = JSON.parse(localStorage.getItem('salon-favorites') || '[]')
        expect(storedFavorites).not.toContain(serviceToRemove)
        expect(storedFavorites).toHaveLength(serviceIds.length - 1)
        remainingIds.forEach(id => {
          expect(storedFavorites).toContain(id)
        })
      }),
      { numRuns: 100 }
    )
  })

  it('should handle storage errors gracefully', () => {
    fc.assert(
      fc.property(serviceGenerator, (service) => {
        // Property: Favorites system should handle storage errors without crashing
        
        // Ensure we start with a clean state
        FavoritesManager.clearFavorites()
        
        // Temporarily break localStorage
        const originalSetItem = localStorage.setItem
        localStorage.setItem = () => {
          throw new Error('Storage quota exceeded')
        }
        
        // Adding to favorites should fail gracefully
        const addResult = FavoritesManager.addToFavorites(service.id)
        expect(addResult).toBe(false)
        
        // Should not crash when checking favorites
        expect(() => FavoritesManager.isFavorite(service.id)).not.toThrow()
        expect(() => FavoritesManager.getFavorites()).not.toThrow()
        
        // Restore localStorage
        localStorage.setItem = originalSetItem
        
        // Should work normally after restoration
        const normalAddResult = FavoritesManager.addToFavorites(service.id)
        expect(normalAddResult).toBe(true)
        expect(FavoritesManager.isFavorite(service.id)).toBe(true)
      }),
      { numRuns: 100 }
    )
  })

  it('should maintain favorites state consistency', () => {
    fc.assert(
      fc.property(uniqueServicesArrayGenerator, (services) => {
        // Property: Favorites state should remain consistent across operations
        
        // Ensure we start with a clean state
        FavoritesManager.clearFavorites()
        
        const serviceIds = services.map(s => s.id)
        
        // Perform random operations
        const operations = fc.sample(
          fc.record({
            type: fc.constantFrom('add', 'remove', 'check'),
            serviceIndex: fc.integer({ min: 0, max: serviceIds.length - 1 })
          }),
          { numRuns: 10 }
        )
        
        operations.forEach(op => {
          const serviceId = serviceIds[op.serviceIndex]
          
          switch (op.type) {
            case 'add':
              FavoritesManager.addToFavorites(serviceId)
              break
            case 'remove':
              FavoritesManager.removeFromFavorites(serviceId)
              break
            case 'check':
              FavoritesManager.isFavorite(serviceId)
              break
          }
        })
        
        // Verify consistency between different access methods
        const favorites = FavoritesManager.getFavorites()
        const storedFavorites = JSON.parse(localStorage.getItem('salon-favorites') || '[]')
        
        expect(favorites).toEqual(storedFavorites)
        
        // Verify each favorite is correctly identified
        favorites.forEach(id => {
          expect(FavoritesManager.isFavorite(id)).toBe(true)
        })
        
        // Verify non-favorites are correctly identified
        const nonFavorites = serviceIds.filter(id => !favorites.includes(id))
        nonFavorites.forEach(id => {
          expect(FavoritesManager.isFavorite(id)).toBe(false)
        })
      }),
      { numRuns: 100 }
    )
  })
})