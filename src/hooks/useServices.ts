'use client'

/**
 * Custom hooks for service data fetching with React Query.
 * Centralises query keys and fetch logic so components stay lean.
 * Requirements: 1.1, 1.2, 1.3, 1.4
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Service, ServiceFilters, ServiceInsert, ServiceUpdate } from '@/types'

// ---------------------------------------------------------------------------
// Query keys
// ---------------------------------------------------------------------------

export const serviceKeys = {
  all: ['services'] as const,
  list: (filters?: ServiceFilters) => [...serviceKeys.all, 'list', filters ?? {}] as const,
  detail: (id: string) => [...serviceKeys.all, 'detail', id] as const,
}

// ---------------------------------------------------------------------------
// Fetchers
// ---------------------------------------------------------------------------

async function fetchServices(filters?: ServiceFilters): Promise<Service[]> {
  const params = new URLSearchParams()
  if (filters?.category) params.append('category', filters.category)
  if (filters?.priceRange) {
    params.append('priceMin', String(filters.priceRange[0]))
    params.append('priceMax', String(filters.priceRange[1]))
  }
  if (filters?.duration) params.append('duration', String(filters.duration))
  if (filters?.stylist) params.append('stylist', filters.stylist)

  const res = await fetch(`/api/services?${params}`)
  if (!res.ok) throw new Error('Failed to fetch services')
  const json = await res.json()
  return json.data as Service[]
}

async function fetchService(id: string): Promise<Service> {
  const res = await fetch(`/api/services/${id}`)
  if (!res.ok) throw new Error('Failed to fetch service')
  const json = await res.json()
  return json.data as Service
}

async function createService(data: ServiceInsert): Promise<Service> {
  const res = await fetch('/api/services', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to create service')
  const json = await res.json()
  return json.data as Service
}

async function updateService(id: string, data: ServiceUpdate): Promise<Service> {
  const res = await fetch(`/api/services/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to update service')
  const json = await res.json()
  return json.data as Service
}

async function deleteService(id: string): Promise<void> {
  const res = await fetch(`/api/services/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete service')
}

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

/** Fetch all services, optionally filtered. */
export function useServices(filters?: ServiceFilters) {
  return useQuery({
    queryKey: serviceKeys.list(filters),
    queryFn: () => fetchServices(filters),
    staleTime: 5 * 60 * 1000,
  })
}

/** Fetch a single service by id. */
export function useService(id: string | null) {
  return useQuery({
    queryKey: serviceKeys.detail(id ?? ''),
    queryFn: () => fetchService(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
}

/** Create a service (admin). Invalidates the list on success. */
export function useCreateService() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createService,
    onSuccess: () => qc.invalidateQueries({ queryKey: serviceKeys.all }),
  })
}

/** Update a service (admin). Invalidates the list and detail on success. */
export function useUpdateService() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ServiceUpdate }) => updateService(id, data),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: serviceKeys.detail(id) })
      qc.invalidateQueries({ queryKey: serviceKeys.all })
    },
  })
}

/** Delete a service (admin). Invalidates the list on success. */
export function useDeleteService() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deleteService,
    onSuccess: () => qc.invalidateQueries({ queryKey: serviceKeys.all }),
  })
}
