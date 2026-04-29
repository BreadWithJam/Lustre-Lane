'use client'

import { useState, useEffect, useRef } from 'react'

const FAVORITES_STORAGE_KEY = 'salon-favorites'

export function useFavorites() {
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  // Track whether the initial load from localStorage has completed
  const hasLoaded = useRef(false)

  // Load favorites from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(FAVORITES_STORAGE_KEY)
      if (stored) {
        const favoriteIds = JSON.parse(stored) as string[]
        setFavorites(new Set(favoriteIds))
      }
    } catch (error) {
      console.error('Failed to load favorites from localStorage:', error)
    } finally {
      hasLoaded.current = true
    }
  }, [])

  // Save favorites to localStorage whenever they change, but only after initial load
  useEffect(() => {
    if (!hasLoaded.current) return
    try {
      const favoriteIds = Array.from(favorites)
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favoriteIds))
    } catch (error) {
      console.error('Failed to save favorites to localStorage:', error)
    }
  }, [favorites])

  const isFavorite = (serviceId: string): boolean => {
    return favorites.has(serviceId)
  }

  const addFavorite = (serviceId: string): void => {
    setFavorites(prev => new Set([...prev, serviceId]))
  }

  const removeFavorite = (serviceId: string): void => {
    setFavorites(prev => {
      const newFavorites = new Set(prev)
      newFavorites.delete(serviceId)
      return newFavorites
    })
  }

  const toggleFavorite = (serviceId: string): void => {
    if (isFavorite(serviceId)) {
      removeFavorite(serviceId)
    } else {
      addFavorite(serviceId)
    }
  }

  const clearFavorites = (): void => {
    setFavorites(new Set())
  }

  const getFavoriteIds = (): string[] => {
    return Array.from(favorites)
  }

  const getFavoriteCount = (): number => {
    return favorites.size
  }

  return {
    favorites,
    isFavorite,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    clearFavorites,
    getFavoriteIds,
    getFavoriteCount
  }
}