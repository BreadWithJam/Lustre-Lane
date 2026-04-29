'use client'

import Image from 'next/image'
import type { GalleryImage } from '@/types'

export interface Lookbook {
  id: string
  title: string
  description?: string
  images: GalleryImage[]
}

interface LookbookPlaylistProps {
  lookbooks: Lookbook[]
  onImageSelect: (image: GalleryImage, allImages: GalleryImage[]) => void
}

export function LookbookPlaylist({ lookbooks, onImageSelect }: LookbookPlaylistProps) {
  if (lookbooks.length === 0) return null

  return (
    <div className="space-y-10">
      {lookbooks.map(lookbook => (
        <div key={lookbook.id}>
          <div className="mb-4">
            <h3 className="text-xl font-serif font-bold text-salon-brown">{lookbook.title}</h3>
            {lookbook.description && (
              <p className="text-salon-warm-gray text-sm mt-1">{lookbook.description}</p>
            )}
          </div>

          {/* Horizontal scroll strip */}
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {lookbook.images.map(image => (
              <button
                key={image.id}
                onClick={() => onImageSelect(image, lookbook.images)}
                className="relative flex-shrink-0 w-40 h-40 rounded-lg overflow-hidden group focus:outline-none focus-visible:ring-2 focus-visible:ring-salon-brown"
                aria-label={image.title ?? 'View style'}
              >
                <Image
                  src={image.thumbnailUrl ?? image.imageUrl}
                  alt={image.title ?? 'Style image'}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="160px"
                  loading="lazy"
                />
                {image.title && (
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                    <p className="text-white text-xs font-medium line-clamp-1">{image.title}</p>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
