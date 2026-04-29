'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import Image from 'next/image'
import { GalleryFilters } from './GalleryFilters'
import { ImageLightbox } from './ImageLightbox'
import { LookbookPlaylist, type Lookbook } from './LookbookPlaylist'
import type { GalleryImage, GalleryFilters as GalleryFiltersType } from '@/types'

const PAGE_SIZE = 12

async function fetchGalleryImages(filters: GalleryFiltersType): Promise<GalleryImage[]> {
  const params = new URLSearchParams()
  if (filters.category) params.append('category', filters.category)
  if (filters.tags?.length) params.append('tags', filters.tags.join(','))
  if (filters.featured) params.append('featured', 'true')

  const res = await fetch(`/api/gallery?${params.toString()}`)
  if (!res.ok) throw new Error('Failed to fetch gallery images')
  const result = await res.json()
  return result.data as GalleryImage[]
}

/** Build simple lookbook groupings from the full image list */
function buildLookbooks(images: GalleryImage[]): Lookbook[] {
  const grouped = new Map<string, GalleryImage[]>()

  for (const img of images) {
    const key = img.category ?? 'Other'
    if (!grouped.has(key)) grouped.set(key, [])
    grouped.get(key)!.push(img)
  }

  const lookbooks: Lookbook[] = []
  grouped.forEach((imgs, category) => {
    if (imgs.length >= 3) {
      lookbooks.push({
        id: category,
        title: categoryLabel(category),
        description: `Explore our ${categoryLabel(category).toLowerCase()} styles`,
        images: imgs.slice(0, 10),
      })
    }
  })

  return lookbooks
}

function categoryLabel(category: string): string {
  const labels: Record<string, string> = {
    cuts: 'Fresh Cuts',
    color: 'Color Transformations',
    treatments: 'Treatments & Care',
    updos: 'Elegant Updos',
    extensions: 'Extensions',
  }
  return labels[category] ?? category.charAt(0).toUpperCase() + category.slice(1)
}

export function GalleryGrid() {
  const [filters, setFilters] = useState<GalleryFiltersType>({})
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [lightboxImage, setLightboxImage] = useState<GalleryImage | null>(null)
  const [lightboxImages, setLightboxImages] = useState<GalleryImage[]>([])
  const [showLookbooks, setShowLookbooks] = useState(false)
  const sentinelRef = useRef<HTMLDivElement>(null)

  const { data: allImages = [], isLoading, error } = useQuery({
    queryKey: ['gallery', filters],
    queryFn: () => fetchGalleryImages(filters),
    staleTime: 5 * 60 * 1000,
  })

  // Reset pagination when filters change
  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
  }, [filters])

  // Infinite scroll via IntersectionObserver
  // Use a ref for visibleCount so the observer callback always sees the latest value
  // without needing to be re-created on every count change.
  const visibleCountRef = useRef(visibleCount)
  visibleCountRef.current = visibleCount
  const allImagesLengthRef = useRef(allImages.length)
  allImagesLengthRef.current = allImages.length

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      entries => {
        if (
          entries[0].isIntersecting &&
          visibleCountRef.current < allImagesLengthRef.current
        ) {
          setVisibleCount(prev => Math.min(prev + PAGE_SIZE, allImagesLengthRef.current))
        }
      },
      { rootMargin: '200px' }
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
    // Only re-create when the sentinel element itself changes
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const visibleImages = allImages.slice(0, visibleCount)
  const lookbooks = buildLookbooks(allImages)

  const openLightbox = useCallback((image: GalleryImage, images: GalleryImage[]) => {
    setLightboxImage(image)
    setLightboxImages(images)
  }, [])

  const closeLightbox = useCallback(() => {
    setLightboxImage(null)
    setLightboxImages([])
  }, [])

  const lightboxIndex = lightboxImage
    ? lightboxImages.findIndex(img => img.id === lightboxImage.id)
    : -1

  const goToPrev = useCallback(() => {
    if (lightboxIndex > 0) setLightboxImage(lightboxImages[lightboxIndex - 1])
  }, [lightboxIndex, lightboxImages])

  const goToNext = useCallback(() => {
    if (lightboxIndex < lightboxImages.length - 1)
      setLightboxImage(lightboxImages[lightboxIndex + 1])
  }, [lightboxIndex, lightboxImages])

  if (error) {
    return (
      <div className="text-center py-12">
        <span className="text-4xl">⚠️</span>
        <h3 className="text-xl font-semibold text-salon-brown mt-4 mb-2">
          Unable to load gallery
        </h3>
        <p className="text-salon-warm-gray">Please try again later.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Filters */}
      <GalleryFilters filters={filters} onFiltersChange={setFilters} />

      {/* Lookbook toggle */}
      {lookbooks.length > 0 && (
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowLookbooks(v => !v)}
            aria-expanded={showLookbooks}
            aria-controls="lookbook-section"
            className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
              showLookbooks
                ? 'bg-salon-brown text-white'
                : 'bg-salon-cream text-salon-brown hover:bg-salon-brown/10'
            }`}
          >
            {showLookbooks ? 'Hide Lookbooks' : '📚 View Lookbooks'}
          </button>
        </div>
      )}

      {/* Lookbook playlists */}
      {showLookbooks && lookbooks.length > 0 && (
        <section id="lookbook-section" aria-label="Lookbook playlists">
          <LookbookPlaylist lookbooks={lookbooks} onImageSelect={openLightbox} />
        </section>
      )}
      {/* Keep the id in the DOM even when hidden so aria-controls always resolves */}
      {!showLookbooks && <div id="lookbook-section" hidden />}

      {/* Loading skeleton */}
      {isLoading && (
        <div
          className="columns-2 md:columns-3 lg:columns-4"
          style={{ columnGap: '12px' }}
          role="status"
          aria-label="Loading gallery images"
          aria-live="polite"
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse bg-salon-cream rounded-lg break-inside-avoid mb-3"
              style={{ height: `${180 + (i % 3) * 60}px` }}
              aria-hidden="true"
            />
          ))}
          <span className="sr-only">Loading gallery images…</span>
        </div>
      )}

      {/* Masonry grid */}
      {!isLoading && visibleImages.length > 0 && (
        <section aria-label="Style gallery">
          <div className="columns-2 md:columns-3 lg:columns-4" style={{ columnGap: '12px' }}>
            {visibleImages.map(image => (
              <GalleryTile
                key={image.id}
                image={image}
                onClick={() => openLightbox(image, allImages)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Empty state */}
      {!isLoading && allImages.length === 0 && (
        <div className="text-center py-16">
          <span className="text-4xl">🖼️</span>
          <h3 className="text-xl font-semibold text-salon-brown mt-4 mb-2">No images found</h3>
          <p className="text-salon-warm-gray">Try adjusting your filters.</p>
        </div>
      )}

      {/* Infinite scroll sentinel */}
      <div ref={sentinelRef} aria-hidden="true" />

      {/* Load more indicator */}
      {visibleCount < allImages.length && (
        <div className="text-center py-4" role="status" aria-label="Loading more images">
          <div className="inline-block w-6 h-6 border-2 border-salon-brown border-t-transparent rounded-full animate-spin" aria-hidden="true" />
          <span className="sr-only">Loading more images…</span>
        </div>
      )}

      {/* Lightbox */}
      {lightboxImage && (
        <ImageLightbox
          image={lightboxImage}
          onClose={closeLightbox}
          onPrev={goToPrev}
          onNext={goToNext}
          hasPrev={lightboxIndex > 0}
          hasNext={lightboxIndex < lightboxImages.length - 1}
        />
      )}
    </div>
  )
}

// Individual masonry tile
interface GalleryTileProps {
  image: GalleryImage
  onClick: () => void
}

function GalleryTile({ image, onClick }: GalleryTileProps) {
  return (
    <button
      onClick={onClick}
      className="block relative w-full mb-3 rounded-lg overflow-hidden group break-inside-avoid focus:outline-none focus-visible:ring-2 focus-visible:ring-salon-brown"
      aria-label={image.title ?? 'View style'}
    >
      {/* Aspect-ratio container — padding-bottom creates height for the fill image */}
      <div className="relative w-full" style={{ paddingBottom: '125%' }}>
        <Image
          src={image.thumbnailUrl ?? image.imageUrl}
          alt={image.title ?? 'Gallery style'}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          loading="lazy"
        />
      </div>

      {/* Hover overlay — sits on top of the image container */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-200 flex items-end overflow-hidden">
        {(image.title || image.tags.length > 0) && (
          <div className="w-full p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-200">
            {image.title && (
              <p className="text-white text-sm font-medium line-clamp-1">{image.title}</p>
            )}
            {image.tags.length > 0 && (
              <p className="text-white/70 text-xs mt-1 line-clamp-1">
                {image.tags.slice(0, 3).map(t => `#${t}`).join(' ')}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Featured badge */}
      {image.isFeatured && (
        <div className="absolute top-2 left-2">
          <span className="bg-salon-gold text-white text-xs px-2 py-0.5 rounded-full font-medium">
            ⭐ Featured
          </span>
        </div>
      )}
    </button>
  )
}
