'use client'

import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ServiceCard } from './ServiceCard'
import { ServiceDetailDrawer } from './ServiceDetailDrawer'
import { ServiceFilters } from './ServiceFilters'
import type { Service, ServiceCategory, ServiceFilters as ServiceFiltersType } from '@/types'

async function fetchServices(filters?: ServiceFiltersType): Promise<Service[]> {
  const params = new URLSearchParams()
  
  if (filters?.category) {
    params.append('category', filters.category)
  }
  
  if (filters?.priceRange) {
    params.append('priceMin', filters.priceRange[0].toString())
    params.append('priceMax', filters.priceRange[1].toString())
  }
  
  if (filters?.duration) {
    params.append('duration', filters.duration.toString())
  }
  
  if (filters?.stylist) {
    params.append('stylist', filters.stylist)
  }

  const response = await fetch(`/api/services?${params.toString()}`)
  
  if (!response.ok) {
    throw new Error('Failed to fetch services')
  }
  
  const result = await response.json()
  return result.data
}

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

  const { 
    data: services = [], 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['services', queryFilters],
    queryFn: () => fetchServices(queryFilters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

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
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          <span className="text-4xl">⚠️</span>
        </div>
        <h3 className="text-xl font-semibold text-salon-brown mb-2">
          Unable to load services
        </h3>
        <p className="text-salon-warm-gray">
          Please try again later or contact support if the problem persists.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 justify-center">
        {categories.map((category) => (
          <button
            key={category.value}
            onClick={() => setSelectedCategory(category.value)}
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
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="bg-salon-cream rounded-lg h-80"></div>
            </div>
          ))}
        </div>
      )}

      {/* Services Grid */}
      {!isLoading && (
        <>
          {filteredServices.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredServices.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  onSelect={() => setSelectedService(service)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-salon-warm-gray mb-4">
                <span className="text-4xl">🔍</span>
              </div>
              <h3 className="text-xl font-semibold text-salon-brown mb-2">
                No services found
              </h3>
              <p className="text-salon-warm-gray">
                Try adjusting your search or filter criteria.
              </p>
            </div>
          )}
        </>
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