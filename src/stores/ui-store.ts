import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { Service, GalleryImage, MessageThread } from '@/types'

interface UIState {
  // Loading states
  isLoading: boolean
  
  // Error handling
  error: string | null
  
  // Modal/drawer states
  isServiceDetailOpen: boolean
  isImageLightboxOpen: boolean
  isChatOpen: boolean
  
  // Selected items
  selectedService: Service | null
  selectedImage: GalleryImage | null
  activeThread: MessageThread | null
  
  // Mobile navigation
  isMobileMenuOpen: boolean
  
  // Search and filters
  searchQuery: string
  activeFilters: Record<string, unknown>
  
  // Actions
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  
  // Modal/drawer actions
  openServiceDetail: (service: Service) => void
  closeServiceDetail: () => void
  openImageLightbox: (image: GalleryImage) => void
  closeImageLightbox: () => void
  openChat: (thread?: MessageThread) => void
  closeChat: () => void
  
  // Mobile navigation actions
  toggleMobileMenu: () => void
  closeMobileMenu: () => void
  
  // Search and filter actions
  setSearchQuery: (query: string) => void
  setFilters: (filters: Record<string, unknown>) => void
  clearFilters: () => void
  
  // Reset all state
  reset: () => void
}

const initialState = {
  isLoading: false,
  error: null,
  isServiceDetailOpen: false,
  isImageLightboxOpen: false,
  isChatOpen: false,
  selectedService: null,
  selectedImage: null,
  activeThread: null,
  isMobileMenuOpen: false,
  searchQuery: '',
  activeFilters: {},
}

export const useUIStore = create<UIState>()(
  devtools(
    (set) => ({
      ...initialState,
      
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      
      openServiceDetail: (service) =>
        set({
          selectedService: service,
          isServiceDetailOpen: true,
          isMobileMenuOpen: false,
        }),
      closeServiceDetail: () =>
        set({
          selectedService: null,
          isServiceDetailOpen: false,
        }),
        
      openImageLightbox: (image) =>
        set({
          selectedImage: image,
          isImageLightboxOpen: true,
          isMobileMenuOpen: false,
        }),
      closeImageLightbox: () =>
        set({
          selectedImage: null,
          isImageLightboxOpen: false,
        }),
        
      openChat: (thread) =>
        set({
          activeThread: thread || null,
          isChatOpen: true,
          isMobileMenuOpen: false,
        }),
      closeChat: () =>
        set({
          activeThread: null,
          isChatOpen: false,
        }),
        
      toggleMobileMenu: () =>
        set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
      closeMobileMenu: () => set({ isMobileMenuOpen: false }),
      
      setSearchQuery: (query) => set({ searchQuery: query }),
      setFilters: (filters) => set({ activeFilters: filters }),
      clearFilters: () => set({ activeFilters: {} }),
      
      reset: () => set(initialState),
    }),
    {
      name: 'salon-ui-store',
    }
  )
)