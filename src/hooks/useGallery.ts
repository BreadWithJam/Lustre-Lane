'use client'

/**
 * Custom hooks for gallery data fetching with React Query.
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { GalleryImage, GalleryFilters, GalleryImageInsert, GalleryImageUpdate } from '@/types'

// ---------------------------------------------------------------------------
// Query keys
// ---------------------------------------------------------------------------

export const galleryKeys = {
  all: ['gallery'] as const,
  list: (filters?: GalleryFilters) => [...galleryKeys.all, 'list', filters ?? {}] as const,
  detail: (id: string) => [...galleryKeys.all, 'detail', id] as const,
}

// ---------------------------------------------------------------------------
// Fetchers
// ---------------------------------------------------------------------------

async function fetchGalleryImages(filters?: GalleryFilters): Promise<GalleryImage[]> {
  const params = new URLSearchParams()
  if (filters?.category) params.append('category', filters.category)
  if (filters?.tags?.length) params.append('tags', filters.tags.join(','))
  if (filters?.featured) params.append('featured', 'true')

  const res = await fetch(`/api/gallery?${params}`)
  if (!res.ok) throw new Error('Failed to fetch gallery images')
  const json = await res.json()
  return json.data as GalleryImage[]
}

async function uploadGalleryImage(data: GalleryImageInsert): Promise<GalleryImage> {
  const res = await fetch('/api/gallery', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to upload gallery image')
  const json = await res.json()
  return json.data as GalleryImage
}

async function updateGalleryImage(id: string, data: GalleryImageUpdate): Promise<GalleryImage> {
  const res = await fetch(`/api/gallery/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to update gallery image')
  const json = await res.json()
  return json.data as GalleryImage
}

async function deleteGalleryImage(id: string): Promise<void> {
  const res = await fetch(`/api/gallery/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete gallery image')
}

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

/** Fetch gallery images, optionally filtered. */
export function useGalleryImages(filters?: GalleryFilters) {
  return useQuery({
    queryKey: galleryKeys.list(filters),
    queryFn: () => fetchGalleryImages(filters),
    staleTime: 5 * 60 * 1000,
  })
}

/** Upload a new gallery image (admin). Invalidates the list on success. */
export function useUploadGalleryImage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: uploadGalleryImage,
    onSuccess: () => qc.invalidateQueries({ queryKey: galleryKeys.all }),
  })
}

/** Update gallery image metadata (admin). Invalidates the list and detail on success. */
export function useUpdateGalleryImage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: GalleryImageUpdate }) =>
      updateGalleryImage(id, data),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: galleryKeys.detail(id) })
      qc.invalidateQueries({ queryKey: galleryKeys.all })
    },
  })
}

/** Delete a gallery image (admin). Invalidates the list on success. */
export function useDeleteGalleryImage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deleteGalleryImage,
    onSuccess: () => qc.invalidateQueries({ queryKey: galleryKeys.all }),
  })
}
