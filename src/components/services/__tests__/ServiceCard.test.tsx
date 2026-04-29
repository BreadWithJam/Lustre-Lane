import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ServiceCard } from '../ServiceCard'
import type { Service } from '@/types'

// Mock the useFavorites hook
vi.mock('@/hooks/useFavorites', () => ({
  useFavorites: () => ({
    isFavorite: vi.fn(() => false),
    toggleFavorite: vi.fn(),
  }),
}))

// Mock Next.js Image component
vi.mock('next/image', () => ({
  default: ({ alt, ...props }: any) => <img alt={alt} {...props} />,
}))

const mockService: Service = {
  id: '1',
  name: 'Classic Cut & Style',
  description: 'Professional haircut with wash and style',
  category: 'cuts',
  price: 65,
  duration: 60,
  stylistName: 'Sarah Johnson',
  imageUrl: 'https://example.com/image.jpg',
  isActive: true,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
}

describe('ServiceCard', () => {
  it('should render service information correctly', () => {
    const onSelect = vi.fn()
    
    render(<ServiceCard service={mockService} onSelect={onSelect} />)
    
    expect(screen.getByText('Classic Cut & Style')).toBeInTheDocument()
    expect(screen.getByText('Professional haircut with wash and style')).toBeInTheDocument()
    expect(screen.getByText('$65')).toBeInTheDocument()
    expect(screen.getByText('1h')).toBeInTheDocument()
    expect(screen.getByText('Sarah Johnson')).toBeInTheDocument()
    expect(screen.getByText('cuts')).toBeInTheDocument()
  })

  it('should format duration correctly for different values', () => {
    const onSelect = vi.fn()
    
    // Test 30 minutes
    const service30min = { ...mockService, duration: 30 }
    const { rerender } = render(<ServiceCard service={service30min} onSelect={onSelect} />)
    expect(screen.getByText('30min')).toBeInTheDocument()
    
    // Test 90 minutes (1h 30min)
    const service90min = { ...mockService, duration: 90 }
    rerender(<ServiceCard service={service90min} onSelect={onSelect} />)
    expect(screen.getByText('1h 30min')).toBeInTheDocument()
    
    // Test 120 minutes (2h)
    const service120min = { ...mockService, duration: 120 }
    rerender(<ServiceCard service={service120min} onSelect={onSelect} />)
    expect(screen.getByText('2h')).toBeInTheDocument()
  })

  it('should format price correctly', () => {
    const onSelect = vi.fn()
    
    // Test whole number price
    const service65 = { ...mockService, price: 65 }
    const { rerender } = render(<ServiceCard service={service65} onSelect={onSelect} />)
    expect(screen.getByText('$65')).toBeInTheDocument()
    
    // Test decimal price
    const service65_50 = { ...mockService, price: 65.5 }
    rerender(<ServiceCard service={service65_50} onSelect={onSelect} />)
    expect(screen.getByText('$66')).toBeInTheDocument() // Should round to nearest dollar
  })

  it('should call onSelect when card is clicked', () => {
    const onSelect = vi.fn()
    
    render(<ServiceCard service={mockService} onSelect={onSelect} />)
    
    // Click the outer card element
    const card = screen.getByTestId('service-card')
    fireEvent.click(card)
    
    expect(onSelect).toHaveBeenCalledTimes(1)
  })

  it('should handle missing optional fields gracefully', () => {
    const onSelect = vi.fn()
    const minimalService: Service = {
      id: '2',
      name: 'Basic Service',
      category: 'cuts',
      price: 50,
      duration: 45,
      isActive: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    }
    
    render(<ServiceCard service={minimalService} onSelect={onSelect} />)
    
    expect(screen.getByText('Basic Service')).toBeInTheDocument()
    expect(screen.getByText('$50')).toBeInTheDocument()
    expect(screen.getByText('45min')).toBeInTheDocument()
    expect(screen.getByText('cuts')).toBeInTheDocument()
    
    // Should not show description or stylist if not provided
    expect(screen.queryByText('Professional haircut')).not.toBeInTheDocument()
    expect(screen.queryByText('Sarah Johnson')).not.toBeInTheDocument()
  })

  it('should show placeholder when image fails to load', () => {
    const onSelect = vi.fn()
    const serviceWithoutImage = { ...mockService, imageUrl: undefined }
    
    render(<ServiceCard service={serviceWithoutImage} onSelect={onSelect} />)
    
    // Should show emoji placeholder
    expect(screen.getByText('✂️')).toBeInTheDocument()
  })
})