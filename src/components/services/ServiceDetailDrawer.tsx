'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useFavorites } from '@/hooks/useFavorites'
import type { Service } from '@/types'

interface ServiceDetailDrawerProps {
  service: Service
  isOpen: boolean
  onClose: () => void
}

export function ServiceDetailDrawer({ service, isOpen, onClose }: ServiceDetailDrawerProps) {
  const { isFavorite, toggleFavorite } = useFavorites()

  // Handle escape key and prevent body scroll
  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} minutes`
    }
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return remainingMinutes > 0 ? `${hours} hour ${remainingMinutes} minutes` : `${hours} hour`
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        className="absolute right-0 top-0 h-full w-full max-w-lg bg-white shadow-xl transform transition-transform"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-salon-cream">
            <h2 id="drawer-title" className="text-2xl font-serif font-bold text-salon-brown">
              Service Details
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-salon-cream transition-colors"
              aria-label="Close drawer"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {/* Service Image */}
            {service.imageUrl && (
              <div className="relative h-64 bg-salon-cream">
                <Image
                  src={service.imageUrl}
                  alt={service.name}
                  fill
                  className="object-cover"
                />
              </div>
            )}

            <div className="p-6 space-y-6">
              {/* Service Info */}
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-serif font-bold text-salon-brown mb-2">
                      {service.name}
                    </h3>
                    <span className="bg-salon-brown text-white px-3 py-1 rounded-full text-sm font-medium capitalize">
                      {service.category}
                    </span>
                  </div>
                  <button
                    onClick={() => toggleFavorite(service.id)}
                    className={`p-3 rounded-full transition-colors ${
                      isFavorite(service.id)
                        ? 'bg-red-500 text-white'
                        : 'bg-salon-cream text-salon-warm-gray hover:bg-red-50 hover:text-red-500'
                    }`}
                    aria-label={isFavorite(service.id) ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    <svg
                      className="w-6 h-6"
                      fill={isFavorite(service.id) ? 'currentColor' : 'none'}
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                  </button>
                </div>

                {service.description && (
                  <p className="text-salon-warm-gray leading-relaxed mb-6">
                    {service.description}
                  </p>
                )}

                {/* Service Details Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-salon-cream p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-5 h-5 text-salon-brown" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                      <span className="text-sm font-medium text-salon-brown">Price</span>
                    </div>
                    <span className="text-xl font-bold text-salon-brown">
                      {formatPrice(service.price)}
                    </span>
                  </div>

                  <div className="bg-salon-cream p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-5 h-5 text-salon-brown" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm font-medium text-salon-brown">Duration</span>
                    </div>
                    <span className="text-lg font-semibold text-salon-brown">
                      {formatDuration(service.duration)}
                    </span>
                  </div>
                </div>

                {service.stylistName && (
                  <div className="bg-salon-cream p-4 rounded-lg mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-5 h-5 text-salon-brown" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span className="text-sm font-medium text-salon-brown">Stylist</span>
                    </div>
                    <span className="text-lg font-semibold text-salon-brown">
                      {service.stylistName}
                    </span>
                  </div>
                )}
              </div>

              {/* Gallery Section */}
              <div>
                <h4 className="text-lg font-semibold text-salon-brown mb-4">
                  Related Styles
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {/* Placeholder for related gallery images */}
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="aspect-square bg-salon-cream rounded-lg flex items-center justify-center">
                      <span className="text-salon-warm-gray text-2xl">📸</span>
                    </div>
                  ))}
                </div>
                <Link
                  href="/gallery"
                  className="inline-flex items-center gap-2 text-salon-brown hover:text-salon-gold transition-colors mt-4"
                >
                  <span>View full gallery</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-6 border-t border-salon-cream bg-white">
            <div className="space-y-3">
              <Link
                href={`/chat?service=${encodeURIComponent(service.name)}`}
                className="w-full bg-salon-brown text-white py-3 px-6 rounded-lg font-semibold hover:bg-salon-brown/90 transition-colors text-center block"
              >
                Book Consultation
              </Link>
              <Link
                href={`/chat?service=${encodeURIComponent(service.name)}&type=question`}
                className="w-full border-2 border-salon-brown text-salon-brown py-3 px-6 rounded-lg font-semibold hover:bg-salon-brown/5 transition-colors text-center block"
              >
                Ask Questions
              </Link>
              <div className="flex gap-3">
                <a
                  href="tel:+1234567890"
                  className="flex-1 bg-salon-gold text-white py-3 px-6 rounded-lg font-semibold hover:bg-salon-gold/90 transition-colors text-center"
                >
                  Call Now
                </a>
                <a
                  href="https://maps.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-salon-cream text-salon-brown py-3 px-6 rounded-lg font-semibold hover:bg-salon-brown/10 transition-colors text-center"
                >
                  Get Directions
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}