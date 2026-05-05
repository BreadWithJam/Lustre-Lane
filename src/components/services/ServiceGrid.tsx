'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { ServiceFilters } from './ServiceFilters'
import { catalogServices } from '@/data/services'
import type { ServiceCategory, ServiceFilters as ServiceFiltersType } from '@/types'

const categories: { value: ServiceCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All Services' },
  { value: 'cuts', label: 'Cuts' },
  { value: 'color', label: 'Color' },
  { value: 'treatments', label: 'Treatments' },
  { value: 'packages', label: 'Packages' }
]

export function ServiceGrid() {
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<ServiceFiltersType>({})

  const filteredServices = useMemo(() => {
    let list = selectedCategory === 'all'
      ? catalogServices
      : catalogServices.filter((service) => service.category === selectedCategory)

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      list = list.filter((service) =>
        service.name.toLowerCase().includes(query) ||
        service.description.toLowerCase().includes(query)
      )
    }

    if (filters.priceRange) {
      const [min, max] = filters.priceRange
      list = list.filter((service) => service.price >= min && service.price <= max)
    }

    if (filters.duration) {
      list = list.filter((service) => service.duration <= filters.duration!)
    }

    if (filters.stylist) {
      const stylistQuery = filters.stylist.toLowerCase()
      list = list.filter((service) => service.description.toLowerCase().includes(stylistQuery))
    }

    return list
  }, [selectedCategory, searchQuery, filters])

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price)

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`
    const hours = Math.floor(minutes / 60)
    const remainder = minutes % 60
    return remainder ? `${hours}h ${remainder}m` : `${hours}h`
  }

  return (
    <div className="space-y-8">
      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 justify-center" role="group" aria-label="Filter by category">
        {categories.map((category) => (
          <button
            key={category.value}
            onClick={() => setSelectedCategory(category.value)}
            aria-pressed={selectedCategory === category.value}
            className={`px-6 py-3 rounded-full font-medium transition-colors ${
              selectedCategory === category.value
                ? 'bg-salon-brown text-white'
                : 'bg-salon-cream text-salon-brown hover:bg-salon-brown/10'
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>

      {/* Search and Filters */}
      <ServiceFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filters={filters}
        onFiltersChange={setFilters}
      />

      {/* Services Grid */}
      <div aria-live="polite" aria-atomic="false">
        {filteredServices.length > 0 ? (
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            role="list"
            aria-label={`${filteredServices.length} service${filteredServices.length !== 1 ? 's' : ''} found`}
          >
            {filteredServices.map((service) => (
              <article
                key={service.id}
                role="listitem"
                className="rounded-2xl border border-salon-cream bg-white/90 p-6 shadow-[0_12px_30px_rgba(20,8,5,0.08)] backdrop-blur-sm flex flex-col gap-4 hover:-translate-y-1 transition-transform"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-salon-warm-gray mb-1">
                      {service.category}
                    </p>
                    <h3 className="text-2xl font-serif text-salon-brown">{service.name}</h3>
                    <p className="text-salon-warm-gray mt-2 text-sm leading-relaxed">
                      {service.description}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm uppercase tracking-[0.3em] text-salon-warm-gray">From</p>
                    <p className="text-2xl font-semibold text-salon-brown">{formatPrice(service.price)}</p>
                    <p className="text-xs text-salon-warm-gray mt-1">{formatDuration(service.duration)}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-salon-cream">
                  <span className="text-sm text-salon-warm-gray">Consult + finish included</span>
                  <Link
                    href="/chat"
                    className="rounded-full bg-salon-brown px-4 py-2 text-sm font-semibold text-white hover:bg-salon-brown/90"
                  >
                    Book
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="text-center py-12" role="status">
            <div className="text-salon-warm-gray mb-4">
              <span className="text-4xl" aria-hidden="true">🔍</span>
            </div>
            <h3 className="text-xl font-semibold text-salon-brown mb-2">
              No services found
            </h3>
            <p className="text-salon-warm-gray">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}