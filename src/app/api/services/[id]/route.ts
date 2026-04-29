import { NextRequest, NextResponse } from 'next/server'
import { servicesDb, transformServiceRowToService } from '@/lib/database'
import type { ServiceUpdate } from '@/types'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params
    const service = await servicesDb.getById(id)
    const transformedService = transformServiceRowToService(service)

    return NextResponse.json({
      data: transformedService,
      message: 'Service retrieved successfully'
    })
  } catch (error) {
    console.error('Error fetching service:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch service',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params
    const body = await request.json()
    
    // Transform camelCase to snake_case for database
    const updateData: ServiceUpdate = {}
    
    if (body.name !== undefined) updateData.name = body.name
    if (body.description !== undefined) updateData.description = body.description || null
    if (body.category !== undefined) updateData.category = body.category
    if (body.price !== undefined) updateData.price = body.price
    if (body.duration !== undefined) updateData.duration = body.duration
    if (body.stylistName !== undefined) updateData.stylist_name = body.stylistName || null
    if (body.imageUrl !== undefined) updateData.image_url = body.imageUrl || null
    if (body.isActive !== undefined) updateData.is_active = body.isActive

    const updatedService = await servicesDb.update(id, updateData)
    const transformedService = transformServiceRowToService(updatedService)

    return NextResponse.json({
      data: transformedService,
      message: 'Service updated successfully'
    })
  } catch (error) {
    console.error('Error updating service:', error)
    return NextResponse.json(
      { 
        error: 'Failed to update service',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params
    await servicesDb.delete(id)

    return NextResponse.json({
      message: 'Service deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting service:', error)
    return NextResponse.json(
      { 
        error: 'Failed to delete service',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}