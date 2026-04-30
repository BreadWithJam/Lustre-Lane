import { NextRequest, NextResponse } from 'next/server'
import { servicesDb, transformServiceRowToService } from '@/lib/database'
import { validateServiceForm, sanitizeText } from '@/lib/validation'
import { createErrorResponse, ApiErrors } from '@/lib/api-errors'
import { checkRateLimit, getRateLimitKey, RateLimits } from '@/lib/rate-limit'
import type { ServiceInsert } from '@/types'

export async function GET(request: NextRequest) {
  // Rate limit general API access
  const rateLimit = checkRateLimit(getRateLimitKey(request, 'api'), RateLimits.api)
  if (!rateLimit.allowed) {
    return createErrorResponse(ApiErrors.rateLimitExceeded())
  }

  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const activeOnly = searchParams.get('active') !== 'false'
    const priceMin = searchParams.get('priceMin')
    const priceMax = searchParams.get('priceMax')
    const duration = searchParams.get('duration')
    const stylist = searchParams.get('stylist')

    let services
    
    if (category) {
      services = await servicesDb.getByCategory(category, activeOnly)
    } else {
      services = await servicesDb.getAll(activeOnly)
    }

    // Apply additional filters
    let filteredServices = services

    if (priceMin || priceMax) {
      const min = priceMin ? parseFloat(priceMin) : 0
      const max = priceMax ? parseFloat(priceMax) : Infinity
      filteredServices = filteredServices.filter(service => 
        service.price >= min && service.price <= max
      )
    }

    if (duration) {
      const maxDuration = parseInt(duration)
      filteredServices = filteredServices.filter(service => 
        service.duration <= maxDuration
      )
    }

    if (stylist) {
      filteredServices = filteredServices.filter(service => 
        service.stylist_name?.toLowerCase().includes(stylist.toLowerCase())
      )
    }

    // Transform to frontend format
    const transformedServices = filteredServices.map(transformServiceRowToService)

    return NextResponse.json({
      data: transformedServices,
      message: 'Services retrieved successfully'
    })
  } catch (error) {
    console.error('Error fetching services:', error)
    return createErrorResponse(error, 'Failed to fetch services')
  }
}

export async function POST(request: NextRequest) {
  const rateLimit = checkRateLimit(getRateLimitKey(request, 'api'), RateLimits.api)
  if (!rateLimit.allowed) {
    return createErrorResponse(ApiErrors.rateLimitExceeded())
  }

  try {
    const body = await request.json()

    // Validate before touching the database
    const validation = validateServiceForm({
      name: body.name,
      category: body.category,
      price: body.price,
      duration: body.duration,
      description: body.description,
      stylistName: body.stylistName,
    })
    if (!validation.valid) {
      return createErrorResponse(
        ApiErrors.validationError('Invalid service data', validation.errors as Record<string, unknown>)
      )
    }

    // Transform camelCase to snake_case for database
    const serviceData: ServiceInsert = {
      name: sanitizeText(body.name),
      description: body.description ? sanitizeText(body.description) : null,
      category: body.category,
      price: body.price,
      duration: body.duration,
      stylist_name: body.stylistName ? sanitizeText(body.stylistName) : null,
      image_url: body.imageUrl || null,
      is_active: body.isActive ?? true
    }

    const newService = await servicesDb.create(serviceData)
    const transformedService = transformServiceRowToService(newService)

    return NextResponse.json({
      data: transformedService,
      message: 'Service created successfully'
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating service:', error)
    return createErrorResponse(error, 'Failed to create service')
  }
}