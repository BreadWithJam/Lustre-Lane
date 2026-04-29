import { NextRequest, NextResponse } from 'next/server'
import { galleryDb, transformGalleryImageRowToGalleryImage } from '@/lib/database'
import type { GalleryImageUpdate } from '@/types'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const image = await galleryDb.getById(id)
    return NextResponse.json({
      data: transformGalleryImageRowToGalleryImage(image),
      message: 'Gallery image retrieved successfully',
    })
  } catch (error) {
    console.error('Error fetching gallery image:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch gallery image',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const body = await request.json()

    const updates: GalleryImageUpdate = {}
    if (body.title !== undefined) updates.title = body.title || null
    if (body.description !== undefined) updates.description = body.description || null
    if (body.imageUrl !== undefined) updates.image_url = body.imageUrl
    if (body.thumbnailUrl !== undefined) updates.thumbnail_url = body.thumbnailUrl || null
    if (body.tags !== undefined) updates.tags = body.tags
    if (body.category !== undefined) updates.category = body.category || null
    if (body.isFeatured !== undefined) updates.is_featured = body.isFeatured

    const updated = await galleryDb.update(id, updates)
    return NextResponse.json({
      data: transformGalleryImageRowToGalleryImage(updated),
      message: 'Gallery image updated successfully',
    })
  } catch (error) {
    console.error('Error updating gallery image:', error)
    return NextResponse.json(
      {
        error: 'Failed to update gallery image',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    await galleryDb.delete(id)
    return NextResponse.json({ message: 'Gallery image deleted successfully' })
  } catch (error) {
    console.error('Error deleting gallery image:', error)
    return NextResponse.json(
      {
        error: 'Failed to delete gallery image',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
