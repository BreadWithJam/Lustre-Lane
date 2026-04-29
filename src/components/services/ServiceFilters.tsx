'use client'

import { useState } from 'react'
import type { ServiceFilters as ServiceFiltersType } from '@/types'

interface ServiceFiltersProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  filters: ServiceFiltersType
  onFiltersChange: (filters: ServiceFiltersType) => void
}

export function ServiceFilters({
  searchQuery,
  onSearchChange,
  filters,
  onFiltersChange
}: ServiceFiltersProps) {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)

  const handlePriceRangeChange = (min: number, max: number) => {
    onFiltersChange({
      ...filters,
      priceRange: [min, max]
    })
  }

  const handleDurationChange = (duration: number | undefined) => {
    onFiltersChange({
      ...filters,
      duration
    })
  }

  const handleStylistChange = (stylist: string) => {
    onFiltersChange({
      ...filters,
      stylist: stylist || undefined
    })
  }

  const clearFilters = () => {
    onFiltersChange({})
    onSearchChange('')
  }

  const hasActiveFilters = searchQuery || filters.priceRange || filters.duration || filters.stylist

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative max-w-md mx-auto">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-salon-warm-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <label htmlFor="service-search" className="sr-only">Search services</label>
        <input
          id="service-search"
          type="search"
          placeholder="Search services, stylists..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-salon-cream rounded-lg focus:ring-2 focus:ring-salon-brown focus:border-transparent"
          aria-label="Search services and stylists"
        />
      </div>

      {/* Filter Toggle */}
      <div className="text-center">
        <button
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          aria-expanded={showAdvancedFilters}
          aria-controls="advanced-filters"
          className="inline-flex items-center gap-2 text-salon-brown hover:text-salon-gold transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
          </svg>
          <span>{showAdvancedFilters ? 'Hide' : 'Show'} Filters</span>
          {hasActiveFilters && (
            <span className="bg-salon-brown text-white text-xs px-2 py-1 rounded-full" aria-label="Filters active">
              Active
            </span>
          )}
        </button>
      </div>

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <div id="advanced-filters" className="bg-salon-cream p-6 rounded-lg space-y-6" role="group" aria-label="Advanced filters">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Price Range */}
            <fieldset>
              <legend className="block text-sm font-medium text-salon-brown mb-3">
                Price Range
              </legend>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <label htmlFor="price-min" className="sr-only">Minimum price</label>
                  <input
                    id="price-min"
                    type="number"
                    placeholder="Min"
                    value={filters.priceRange?.[0] || ''}
                    onChange={(e) => {
                      const min = e.target.value ? parseInt(e.target.value) : 0
                      const max = filters.priceRange?.[1] || 500
                      handlePriceRangeChange(min, max)
                    }}
                    className="flex-1 px-3 py-2 border border-salon-cream rounded focus:ring-2 focus:ring-salon-brown focus:border-transparent"
                    aria-label="Minimum price"
                  />
                  <label htmlFor="price-max" className="sr-only">Maximum price</label>
                  <input
                    id="price-max"
                    type="number"
                    placeholder="Max"
                    value={filters.priceRange?.[1] || ''}
                    onChange={(e) => {
                      const max = e.target.value ? parseInt(e.target.value) : 500
                      const min = filters.priceRange?.[0] || 0
                      handlePriceRangeChange(min, max)
                    }}
                    className="flex-1 px-3 py-2 border border-salon-cream rounded focus:ring-2 focus:ring-salon-brown focus:border-transparent"
                    aria-label="Maximum price"
                  />
                </div>
                <div className="flex gap-2 text-xs" role="group" aria-label="Quick price presets">
                  {[50, 100, 200, 300].map((price) => (
                    <button
                      key={price}
                      onClick={() => handlePriceRangeChange(0, price)}
                      className="px-2 py-1 bg-white text-salon-brown rounded hover:bg-salon-brown hover:text-white transition-colors"
                      aria-label={`Under $${price}`}
                    >
                      Under ${price}
                    </button>
                  ))}
                </div>
              </div>
            </fieldset>

            {/* Duration */}
            <div>
              <label htmlFor="duration-filter" className="block text-sm font-medium text-salon-brown mb-3">
                Max Duration
              </label>
              <select
                id="duration-filter"
                value={filters.duration || ''}
                onChange={(e) => handleDurationChange(e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-salon-cream rounded focus:ring-2 focus:ring-salon-brown focus:border-transparent"
              >
                <option value="">Any duration</option>
                <option value="30">30 minutes or less</option>
                <option value="60">1 hour or less</option>
                <option value="90">1.5 hours or less</option>
                <option value="120">2 hours or less</option>
                <option value="180">3 hours or less</option>
              </select>
            </div>

            {/* Stylist */}
            <div>
              <label htmlFor="stylist-filter" className="block text-sm font-medium text-salon-brown mb-3">
                Stylist
              </label>
              <input
                id="stylist-filter"
                type="text"
                placeholder="Search by stylist name"
                value={filters.stylist || ''}
                onChange={(e) => handleStylistChange(e.target.value)}
                className="w-full px-3 py-2 border border-salon-cream rounded focus:ring-2 focus:ring-salon-brown focus:border-transparent"
              />
            </div>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <div className="text-center pt-4 border-t border-white">
              <button
                onClick={clearFilters}
                className="text-salon-brown hover:text-salon-gold transition-colors font-medium"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}