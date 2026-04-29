'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { GalleryImage } from '@/types'

interface GalleryFormData {
  title: string
  description: string
  imageUrl: string
  thumbnailUrl: string
  category: string
  tags: string
  isFeatured: boolean
}

const EMPTY_FORM: GalleryFormData = {
  title: '',
  description: '',
  imageUrl: '',
  thumbnailUrl: '',
  category: '',
  tags: '',
  isFeatured: false,
}

async function fetchImages(): Promise<GalleryImage[]> {
  const res = await fetch('/api/gallery')
  if (!res.ok) throw new Error('Failed to fetch gallery images')
  const json = await res.json()
  return json.data
}

async function createImage(data: GalleryFormData): Promise<GalleryImage> {
  const res = await fetch('/api/gallery', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: data.title || undefined,
      description: data.description || undefined,
      imageUrl: data.imageUrl,
      thumbnailUrl: data.thumbnailUrl || undefined,
      category: data.category || undefined,
      tags: data.tags ? data.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      isFeatured: data.isFeatured,
    }),
  })
  if (!res.ok) throw new Error('Failed to create gallery image')
  const json = await res.json()
  return json.data
}

async function updateImage(id: string, data: GalleryFormData): Promise<GalleryImage> {
  const res = await fetch(`/api/gallery/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: data.title || undefined,
      description: data.description || undefined,
      imageUrl: data.imageUrl,
      thumbnailUrl: data.thumbnailUrl || undefined,
      category: data.category || undefined,
      tags: data.tags ? data.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      isFeatured: data.isFeatured,
    }),
  })
  if (!res.ok) throw new Error('Failed to update gallery image')
  const json = await res.json()
  return json.data
}

async function deleteImage(id: string): Promise<void> {
  const res = await fetch(`/api/gallery/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete gallery image')
}

export function GalleryManager() {
  const queryClient = useQueryClient()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<GalleryFormData>(EMPTY_FORM)
  const [formError, setFormError] = useState<string | null>(null)

  const { data: images = [], isLoading, error } = useQuery({
    queryKey: ['admin-gallery'],
    queryFn: fetchImages,
  })

  const createMutation = useMutation({
    mutationFn: createImage,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-gallery'] }); resetForm() },
    onError: (err: Error) => setFormError(err.message),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: GalleryFormData }) => updateImage(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-gallery'] }); resetForm() },
    onError: (err: Error) => setFormError(err.message),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteImage,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-gallery'] }),
  })

  function resetForm() {
    setForm(EMPTY_FORM)
    setEditingId(null)
    setShowForm(false)
    setFormError(null)
  }

  function startEdit(image: GalleryImage) {
    setForm({
      title: image.title ?? '',
      description: image.description ?? '',
      imageUrl: image.imageUrl,
      thumbnailUrl: image.thumbnailUrl ?? '',
      category: image.category ?? '',
      tags: image.tags.join(', '),
      isFeatured: image.isFeatured,
    })
    setEditingId(image.id)
    setShowForm(true)
    setFormError(null)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)
    if (!form.imageUrl.trim()) { setFormError('Image URL is required'); return }
    try { new URL(form.imageUrl) } catch { setFormError('Invalid image URL'); return }

    if (editingId) {
      updateMutation.mutate({ id: editingId, data: form })
    } else {
      createMutation.mutate(form)
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  if (isLoading) return <div className="text-salon-warm-gray py-8 text-center">Loading gallery…</div>
  if (error) return <div className="text-red-600 py-8 text-center">Failed to load gallery.</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-sm text-salon-warm-gray">{images.length} image{images.length !== 1 ? 's' : ''}</p>
        <button
          onClick={() => { resetForm(); setShowForm(true) }}
          className="px-4 py-2 bg-salon-brown text-white rounded-lg text-sm font-medium hover:bg-salon-brown/90 transition-colors"
        >
          + Add Image
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-border rounded-xl p-6 space-y-4">
          <h3 className="font-semibold text-salon-brown">{editingId ? 'Edit Image' : 'New Image'}</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-salon-brown mb-1">Image URL *</label>
              <input
                type="url"
                value={form.imageUrl}
                onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-salon-brown"
                placeholder="https://…"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-salon-brown mb-1">Title</label>
              <input
                type="text"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-salon-brown"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-salon-brown mb-1">Category</label>
              <input
                type="text"
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-salon-brown"
                placeholder="e.g. color, cuts"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-salon-brown mb-1">Tags (comma-separated)</label>
              <input
                type="text"
                value={form.tags}
                onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-salon-brown"
                placeholder="blonde, balayage, summer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-salon-brown mb-1">Thumbnail URL</label>
              <input
                type="url"
                value={form.thumbnailUrl}
                onChange={e => setForm(f => ({ ...f, thumbnailUrl: e.target.value }))}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-salon-brown"
                placeholder="https://…"
              />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input
                id="isFeatured"
                type="checkbox"
                checked={form.isFeatured}
                onChange={e => setForm(f => ({ ...f, isFeatured: e.target.checked }))}
                className="rounded border-border"
              />
              <label htmlFor="isFeatured" className="text-sm font-medium text-salon-brown">Featured</label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-salon-brown mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={2}
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
              {isPending ? 'Saving…' : editingId ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      )}

      {images.length === 0 ? (
        <div className="bg-white border border-border rounded-xl py-12 text-center text-salon-warm-gray">
          No images yet. Add one above.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map(image => (
            <div key={image.id} className="bg-white border border-border rounded-xl overflow-hidden group">
              <div className="relative aspect-square bg-salon-cream">
                <Image
                  src={image.thumbnailUrl ?? image.imageUrl}
                  alt={image.title ?? 'Gallery image'}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
                {image.isFeatured && (
                  <span className="absolute top-2 left-2 bg-salon-brown text-white text-xs px-2 py-0.5 rounded-full">
                    Featured
                  </span>
                )}
              </div>
              <div className="p-3">
                <p className="text-sm font-medium text-salon-brown truncate">{image.title ?? 'Untitled'}</p>
                {image.category && (
                  <p className="text-xs text-salon-warm-gray capitalize mt-0.5">{image.category}</p>
                )}
                {image.tags.length > 0 && (
                  <p className="text-xs text-salon-warm-gray mt-1 truncate">{image.tags.join(', ')}</p>
                )}
                <div className="flex gap-2 mt-2">
                  <button onClick={() => startEdit(image)} className="text-xs text-salon-brown hover:underline font-medium">
                    Edit
                  </button>
                  <button
                    onClick={() => { if (confirm('Delete this image?')) deleteMutation.mutate(image.id) }}
                    className="text-xs text-red-500 hover:underline font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
