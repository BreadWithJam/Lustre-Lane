'use client'

import type { GalleryFilters as GalleryFiltersType } from '@/types'

const HAIR_CATEGORIES = [
  { value: 'all', label: 'All Styles' },
  { value: 'cuts', label: 'Cuts' },
  { value: 'color', label: 'Color' },
  { value: 'treatments', label: 'Treatments' },
  { value: 'updos', label: 'Updos' },
  { value: 'extensions', label: 'Extensions' },
]

const POPULAR_TAGS = [
  'blonde', 'brunette', 'balayage', 'highlights', 'curly',
  'straight', 'wavy', 'short', 'long', 'trending',
]

interface GalleryFiltersProps {
  filters: GalleryFiltersType
  onFiltersChange: (filters: GalleryFiltersType) => void
}

export function GalleryFilters({ filters, onFiltersChange }: GalleryFiltersProps) {
  const selectedCategory = filters.category ?? 'all'

  const handleCategoryChange = (category: string) => {
    onFiltersChange({
      ...filters,
      category: category === 'all' ? undefined : category,
    })
  }

  const handleTagToggle = (tag: string) => {
    const current = filters.tags ?? []
    const next = current.includes(tag)
      ? current.filter(t => t !== tag)
      : [...current, tag]
    onFiltersChange({ ...filters, tags: next.length > 0 ? next : undefined })
  }

  const handleFeaturedToggle = () => {
    onFiltersChange({ ...filters, featured: filters.featured ? undefined : true })
  }

  const hasActiveFilters =
    filters.category || (filters.tags && filters.tags.length > 0) || filters.featured

  const clearFilters = () => onFiltersChange({})

  return (
    <div className="space-y-4">
      {/* Category tabs */}
      <div className="flex flex-wrap gap-2">
        {HAIR_CATEGORIES.map(cat => (
          <button
            key={cat.value}
            onClick={() => handleCategoryChange(cat.value)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === cat.value
                ? 'bg-salon-brown text-white'
                : 'bg-salon-cream text-salon-brown hover:bg-salon-brown/10'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Tag filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-sm text-salon-warm-gray font-medium">Tags:</span>
        {POPULAR_TAGS.map(tag => {
          const active = filters.tags?.includes(tag)
          return (
            <button
              key={tag}
              onClick={() => handleTagToggle(tag)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors capitalize ${
                active
                  ? 'bg-salon-gold text-white'
                  : 'bg-white border border-salon-cream text-salon-warm-gray hover:border-salon-brown hover:text-salon-brown'
              }`}
            >
              {tag}
            </button>
          )
        })}
      </div>

      {/* Featured toggle + clear */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleFeaturedToggle}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            filters.featured
              ? 'bg-salon-gold text-white'
              : 'bg-salon-cream text-salon-brown hover:bg-salon-brown/10'
          }`}
        >
          <span>⭐</span>
          <span>Featured Only</span>
        </button>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-salon-warm-gray hover:text-salon-brown transition-colors underline"
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  )
}
