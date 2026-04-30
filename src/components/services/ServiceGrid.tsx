'use client'

import { useState, useMemo } from 'react'
import { ServiceCard } from './ServiceCard'
import { ServiceDetailDrawer } from './ServiceDetailDrawer'
import { ServiceFilters } from './ServiceFilters'
import { ServiceGridSkeleton } from '@/components/Skeleton'
import { InlineError } from '@/components/ErrorBoundary'
import { useServices } from '@/hooks/useServices'
import type { Service, ServiceCategory, ServiceFilters as ServiceFiltersType } from '@/types'

const categories: { value: ServiceCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All Services' },
  { value: 'cuts', label: 'Cuts' },
  { value: 'color', label: 'Color' },
  { value: 'treatments', label: 'Treatments' },
  { value: 'packages', label: 'Packages' }
]

export function ServiceGrid() {
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | 'all'>('all')
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<ServiceFiltersType>({})

  // Combine category selection with other filters
  const queryFilters = useMemo(() => {
    const combinedFilters: ServiceFiltersType = { ...filters }
    if (selectedCategory !== 'all') {
      combinedFilters.category = selectedCategory
    }
    return combinedFilters
  }, [filters, selectedCategory])

  const { data: services = [], isLoading, error } = useServices(queryFilters)

  // Filter services by search query
  const filteredServices = useMemo(() => {
    if (!searchQuery.trim()) return services
    
    const query = searchQuery.toLowerCase()
    return services.filter(service => 
      service.name.toLowerCase().includes(query) ||
      service.description?.toLowerCase().includes(query) ||
      service.stylistName?.toLowerCase().includes(query)
    )
  }, [services, searchQuery])

  if (error) {
    return (
      <InlineError
        message="Unable to load services. Please try again later."
        onRetry={() => window.location.reload()}
      />
    )
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

      {/* Loading State */}
      {isLoading && <ServiceGridSkeleton />}

      {/* Services Grid */}
      {!isLoading && (
        <div aria-live="polite" aria-atomic="false">
          {filteredServices.length > 0 ? (
            <div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              role="list"
              aria-label={`${filteredServices.length} service${filteredServices.length !== 1 ? 's' : ''} found`}
            >
              {filteredServices.map((service) => (
                <div key={service.id} role="listitem">
                  <ServiceCard
                    service={service}
                    onSelect={() => setSelectedService(service)}
                  />
                </div>
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
      )}

      {/* Service Detail Drawer */}
      {selectedService && (
        <ServiceDetailDrawer
          service={selectedService}
          isOpen={!!selectedService}
          onClose={() => setSelectedService(null)}
        />
      )}
    </div>
  )
}