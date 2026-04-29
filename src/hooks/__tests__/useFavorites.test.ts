import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useFavorites } from '../useFavorites'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

describe('useFavorites', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
  })

  it('should initialize with empty favorites', () => {
    const { result } = renderHook(() => useFavorites())
    
    expect(result.current.getFavoriteCount()).toBe(0)
    expect(result.current.getFavoriteIds()).toEqual([])
    expect(result.current.isFavorite('service-1')).toBe(false)
  })

  it('should load favorites from localStorage on mount', () => {
    const storedFavorites = ['service-1', 'service-2']
    localStorageMock.getItem.mockReturnValue(JSON.stringify(storedFavorites))
    
    const { result } = renderHook(() => useFavorites())
    
    expect(result.current.getFavoriteCount()).toBe(2)
    expect(result.current.isFavorite('service-1')).toBe(true)
    expect(result.current.isFavorite('service-2')).toBe(true)
    expect(result.current.isFavorite('service-3')).toBe(false)
  })

  it('should add a favorite', () => {
    const { result } = renderHook(() => useFavorites())
    
    act(() => {
      result.current.addFavorite('service-1')
    })
    
    expect(result.current.isFavorite('service-1')).toBe(true)
    expect(result.current.getFavoriteCount()).toBe(1)
    expect(result.current.getFavoriteIds()).toEqual(['service-1'])
  })

  it('should remove a favorite', () => {
    localStorageMock.getItem.mockReturnValue(JSON.stringify(['service-1', 'service-2']))
    
    const { result } = renderHook(() => useFavorites())
    
    act(() => {
      result.current.removeFavorite('service-1')
    })
    
    expect(result.current.isFavorite('service-1')).toBe(false)
    expect(result.current.isFavorite('service-2')).toBe(true)
    expect(result.current.getFavoriteCount()).toBe(1)
  })

  it('should toggle favorites', () => {
    const { result } = renderHook(() => useFavorites())
    
    // Toggle on
    act(() => {
      result.current.toggleFavorite('service-1')
    })
    
    expect(result.current.isFavorite('service-1')).toBe(true)
    
    // Toggle off
    act(() => {
      result.current.toggleFavorite('service-1')
    })
    
    expect(result.current.isFavorite('service-1')).toBe(false)
  })

  it('should clear all favorites', () => {
    localStorageMock.getItem.mockReturnValue(JSON.stringify(['service-1', 'service-2']))
    
    const { result } = renderHook(() => useFavorites())
    
    expect(result.current.getFavoriteCount()).toBe(2)
    
    act(() => {
      result.current.clearFavorites()
    })
    
    expect(result.current.getFavoriteCount()).toBe(0)
    expect(result.current.getFavoriteIds()).toEqual([])
  })

  it('should save to localStorage when favorites change', () => {
    const { result } = renderHook(() => useFavorites())
    
    act(() => {
      result.current.addFavorite('service-1')
    })
    
    // Should save to localStorage (called twice: once on mount, once on change)
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'salon-favorites',
      JSON.stringify(['service-1'])
    )
  })

  it('should handle localStorage errors gracefully', () => {
    localStorageMock.getItem.mockImplementation(() => {
      throw new Error('localStorage error')
    })
    
    // Should not throw error
    const { result } = renderHook(() => useFavorites())
    
    expect(result.current.getFavoriteCount()).toBe(0)
  })

  it('should handle invalid JSON in localStorage', () => {
    localStorageMock.getItem.mockReturnValue('invalid json')
    
    // Should not throw error and initialize with empty favorites
    const { result } = renderHook(() => useFavorites())
    
    expect(result.current.getFavoriteCount()).toBe(0)
  })
})