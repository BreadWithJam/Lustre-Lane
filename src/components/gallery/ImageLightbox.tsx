'use client'

import { useEffect, useCallback } from 'react'
import Image from 'next/image'
import type { GalleryImage } from '@/types'

interface ImageLightboxProps {
  image: GalleryImage
  onClose: () => void
  onPrev?: () => void
  onNext?: () => void
  hasPrev?: boolean
  hasNext?: boolean
}

export function ImageLightbox({
  image,
  onClose,
  onPrev,
  onNext,
  hasPrev = false,
  hasNext = false,
}: ImageLightboxProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft' && hasPrev) onPrev?.()
      if (e.key === 'ArrowRight' && hasNext) onNext?.()
    },
    [onClose, onPrev, onNext, hasPrev, hasNext]
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [handleKeyDown])

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: image.title ?? 'Style inspiration', url: image.imageUrl })
    } else {
      await navigator.clipboard.writeText(image.imageUrl)
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={image.title ?? 'Gallery image'}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
      onClick={onClose}
    >
      {/* Main content — stop propagation so clicks inside don't close */}
      <div
        className="relative flex flex-col max-w-4xl w-full max-h-screen p-4"
        onClick={e => e.stopPropagation()}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex-1">
            {image.title && (
              <h2 className="text-white font-semibold text-lg">{image.title}</h2>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              aria-label="Share image"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                />
              </svg>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              aria-label="Close lightbox"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Image with prev/next navigation */}
        <div className="relative flex items-center justify-center">
          {hasPrev && (
            <button
              onClick={onPrev}
              className="absolute left-0 z-10 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              aria-label="Previous image"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          <div className="relative w-full" style={{ height: 'min(70vh, 560px)' }}>
            <Image
              src={image.imageUrl}
              alt={image.title ?? 'Gallery image'}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 80vw"
              priority
            />
          </div>

          {hasNext && (
            <button
              onClick={onNext}
              className="absolute right-0 z-10 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              aria-label="Next image"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>

        {/* Caption and tags */}
        <div className="mt-3 space-y-2">
          {image.description && (
            <p className="text-white/80 text-sm">{image.description}</p>
          )}
          {image.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {image.tags.map(tag => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-white/10 text-white/80 rounded-full text-xs capitalize"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
