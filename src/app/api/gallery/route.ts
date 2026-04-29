import { NextRequest, NextResponse } from 'next/server'
import { galleryDb, transformGalleryImageRowToGalleryImage } from '@/lib/database'
import type { GalleryImageInsert } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const tags = searchParams.get('tags')
    const featured = searchParams.get('featured')

    let images

    if (category) {
      images = await galleryDb.getByCategory(category)
    } else if (tags) {
      const tagList = tags.split(',').map(t => t.trim()).filter(Boolean)
      images = await galleryDb.getByTags(tagList)
    } else {
      images = await galleryDb.getAll()
    }

    // Apply featured filter as a post-filter so it works alongside category/tag filters
    if (featured === 'true') {
      images = images.filter(img => img.is_featured)
    }

    const transformed = images.map(transformGalleryImageRowToGalleryImage)

    return NextResponse.json({
      data: transformed,
      message: 'Gallery images retrieved successfully',
    })
  } catch (error) {
    console.error('Error fetching gallery images:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch gallery images',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const imageData: GalleryImageInsert = {
      title: body.title || null,
      description: body.description || null,
      image_url: body.imageUrl,
      thumbnail_url: body.thumbnailUrl || null,
      tags: body.tags || [],
      category: body.category || null,
      is_featured: body.isFeatured ?? false,
    }

    const newImage = await galleryDb.create(imageData)
    const transformed = transformGalleryImageRowToGalleryImage(newImage)

    return NextResponse.json(
      { data: transformed, message: 'Gallery image created successfully' },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating gallery image:', error)
    return NextResponse.json(
      {
        error: 'Failed to create gallery image',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
