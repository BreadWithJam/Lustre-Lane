'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Service, ServiceCategory } from '@/types'

const CATEGORIES: ServiceCategory[] = ['cuts', 'color', 'treatments', 'packages']

interface ServiceFormData {
  name: string
  description: string
  category: ServiceCategory
  price: string
  duration: string
  stylistName: string
  isActive: boolean
}

const EMPTY_FORM: ServiceFormData = {
  name: '',
  description: '',
  category: 'cuts',
  price: '',
  duration: '',
  stylistName: '',
  isActive: true,
}

async function fetchServices(): Promise<Service[]> {
  const res = await fetch('/api/services?active=false')
  if (!res.ok) throw new Error('Failed to fetch services')
  const json = await res.json()
  return json.data
}

async function createService(data: ServiceFormData): Promise<Service> {
  const res = await fetch('/api/services', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: data.name,
      description: data.description || undefined,
      category: data.category,
      price: parseFloat(data.price),
      duration: parseInt(data.duration),
      stylistName: data.stylistName || undefined,
      isActive: data.isActive,
    }),
  })
  if (!res.ok) throw new Error('Failed to create service')
  const json = await res.json()
  return json.data
}

async function updateService(id: string, data: ServiceFormData): Promise<Service> {
  const res = await fetch(`/api/services/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: data.name,
      description: data.description || undefined,
      category: data.category,
      price: parseFloat(data.price),
      duration: parseInt(data.duration),
      stylistName: data.stylistName || undefined,
      isActive: data.isActive,
    }),
  })
  if (!res.ok) throw new Error('Failed to update service')
  const json = await res.json()
  return json.data
}

async function deleteService(id: string): Promise<void> {
  const res = await fetch(`/api/services/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete service')
}

export function ServiceManager() {
  const queryClient = useQueryClient()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<ServiceFormData>(EMPTY_FORM)
  const [formError, setFormError] = useState<string | null>(null)

  const { data: services = [], isLoading, error } = useQuery({
    queryKey: ['admin-services'],
    queryFn: fetchServices,
  })

  const createMutation = useMutation({
    mutationFn: createService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-services'] })
      resetForm()
    },
    onError: (err: Error) => setFormError(err.message),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ServiceFormData }) => updateService(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-services'] })
      resetForm()
    },
    onError: (err: Error) => setFormError(err.message),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteService,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-services'] }),
  })

  function resetForm() {
    setForm(EMPTY_FORM)
    setEditingId(null)
    setShowForm(false)
    setFormError(null)
  }

  function startEdit(service: Service) {
    setForm({
      name: service.name,
      description: service.description ?? '',
      category: service.category,
      price: String(service.price),
      duration: String(service.duration),
      stylistName: service.stylistName ?? '',
      isActive: service.isActive,
    })
    setEditingId(service.id)
    setShowForm(true)
    setFormError(null)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)
    if (!form.name.trim()) { setFormError('Name is required'); return }
    if (!form.price || isNaN(parseFloat(form.price))) { setFormError('Valid price is required'); return }
    if (!form.duration || isNaN(parseInt(form.duration))) { setFormError('Valid duration is required'); return }

    if (editingId) {
      updateMutation.mutate({ id: editingId, data: form })
    } else {
      createMutation.mutate(form)
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  if (isLoading) return <div className="text-salon-warm-gray py-8 text-center">Loading services…</div>
  if (error) return <div className="text-red-600 py-8 text-center">Failed to load services.</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-sm text-salon-warm-gray">{services.length} service{services.length !== 1 ? 's' : ''}</p>
        <button
          onClick={() => { resetForm(); setShowForm(true) }}
          className="px-4 py-2 bg-salon-brown text-white rounded-lg text-sm font-medium hover:bg-salon-brown/90 transition-colors"
        >
          + Add Service
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-border rounded-xl p-6 space-y-4">
          <h3 className="font-semibold text-salon-brown">{editingId ? 'Edit Service' : 'New Service'}</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-salon-brown mb-1">Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-salon-brown"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-salon-brown mb-1">Category *</label>
              <select
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value as ServiceCategory }))}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-salon-brown"
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-salon-brown mb-1">Price ($) *</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-salon-brown"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-salon-brown mb-1">Duration (min) *</label>
              <input
                type="number"
                min="1"
                value={form.duration}
                onChange={e => setForm(f => ({ ...f, duration: e.target.value }))}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-salon-brown"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-salon-brown mb-1">Stylist</label>
              <input
                type="text"
                value={form.stylistName}
                onChange={e => setForm(f => ({ ...f, stylistName: e.target.value }))}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-salon-brown"
              />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input
                id="isActive"
                type="checkbox"
                checked={form.isActive}
                onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
                className="rounded border-border"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-salon-brown">Active</label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-salon-brown mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-salon-brown resize-none"
            />
          </div>

          {formError && (
            <p role="alert" className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">{formError}</p>
          )}

          <div className="flex gap-3 justify-end">
            <button type="button" onClick={resetForm} className="px-4 py-2 text-sm text-salon-warm-gray hover:text-salon-brown transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 bg-salon-brown text-white rounded-lg text-sm font-medium hover:bg-salon-brown/90 transition-colors disabled:opacity-60"
            >
              {isPending ? 'Saving…' : editingId ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      )}

      <div className="bg-white border border-border rounded-xl overflow-hidden">
        {services.length === 0 ? (
          <p className="text-center text-salon-warm-gray py-12">No services yet. Add one above.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-salon-cream border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-salon-brown">Name</th>
                <th className="text-left px-4 py-3 font-medium text-salon-brown">Category</th>
                <th className="text-left px-4 py-3 font-medium text-salon-brown">Price</th>
                <th className="text-left px-4 py-3 font-medium text-salon-brown">Duration</th>
                <th className="text-left px-4 py-3 font-medium text-salon-brown">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {services.map(service => (
                <tr key={service.id} className="hover:bg-salon-cream/40 transition-colors">
                  <td className="px-4 py-3 font-medium text-salon-brown">{service.name}</td>
                  <td className="px-4 py-3 text-salon-warm-gray capitalize">{service.category}</td>
                  <td className="px-4 py-3 text-salon-warm-gray">${service.price.toFixed(2)}</td>
                  <td className="px-4 py-3 text-salon-warm-gray">{service.duration} min</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${service.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {service.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => startEdit(service)}
                        className="text-salon-brown hover:underline text-xs font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete "${service.name}"?`)) deleteMutation.mutate(service.id)
                        }}
                        className="text-red-500 hover:underline text-xs font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
