'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useFavorites } from '@/hooks/useFavorites'
import type { Service } from '@/types'

interface ServiceCardProps {
  service: Service
  onSelect: () => void
}

export function ServiceCard({ service, onSelect }: ServiceCardProps) {
  const { isFavorite, toggleFavorite } = useFavorites()
  const [imageError, setImageError] = useState(false)

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    toggleFavorite(service.id)
  }

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}min`
    }
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  return (
    <div
      onClick={onSelect}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect() } }}
      role="button"
      tabIndex={0}
      data-testid="service-card"
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer group overflow-hidden"
    >
      {/* Service Image */}
      <div className="relative h-48 bg-salon-cream">
        {service.imageUrl && !imageError ? (
          <Image
            src={service.imageUrl}
            alt={service.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-salon-warm-gray">
            <span className="text-4xl">✂️</span>
          </div>
        )}
        
        {/* Favorite Button */}
        <button
          onClick={handleFavoriteClick}
          className={`absolute top-3 right-3 p-2 rounded-full transition-colors ${
            isFavorite(service.id)
              ? 'bg-red-500 text-white'
              : 'bg-white/80 text-salon-warm-gray hover:bg-white hover:text-red-500'
          }`}
          aria-label={isFavorite(service.id) ? 'Remove from favorites' : 'Add to favorites'}
        >
          <svg
            className="w-5 h-5"
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

        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <span className="bg-salon-brown text-white px-3 py-1 rounded-full text-sm font-medium capitalize">
            {service.category}
          </span>
        </div>
      </div>

      {/* Service Details */}
      <div className="p-6">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-semibold text-salon-brown group-hover:text-salon-gold transition-colors">
            {service.name}
          </h3>
          <span className="text-2xl font-bold text-salon-brown">
            {formatPrice(service.price)}
          </span>
        </div>

        {service.description && (
          <p className="text-salon-warm-gray mb-4 line-clamp-2">
            {service.description}
          </p>
        )}

        <div className="flex justify-between items-center text-sm text-salon-warm-gray">
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{formatDuration(service.duration)}</span>
          </div>

          {service.stylistName && (
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>{service.stylistName}</span>
            </div>
          )}
        </div>

        {/* Action Hint */}
        <div className="mt-4 pt-4 border-t border-salon-cream">
          <p className="text-sm text-salon-warm-gray text-center group-hover:text-salon-brown transition-colors">
            Click for details and booking
          </p>
        </div>
      </div>
    </div>
  )
}