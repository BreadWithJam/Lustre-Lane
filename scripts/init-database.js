#!/usr/bin/env node

/**
 * Database initialization script for the salon microsite
 * This script sets up the database schema and initial data
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables:')
  console.error('- NEXT_PUBLIC_SUPABASE_URL')
  console.error('- SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runMigration(filePath) {
  console.log(`Running migration: ${filePath}`)
  
  try {
    const sql = fs.readFileSync(filePath, 'utf8')
    const { error } = await supabase.rpc('exec_sql', { sql })
    
    if (error) {
      throw error
    }
    
    console.log(`✅ Migration completed: ${filePath}`)
  } catch (error) {
    console.error(`❌ Migration failed: ${filePath}`)
    console.error(error.message)
    throw error
  }
}

async function seedInitialData() {
  console.log('Seeding initial data...')
  
  // Sample services data
  const sampleServices = [
    {
      name: 'Classic Cut & Style',
      description: 'Professional haircut with wash and style',
      category: 'cuts',
      price: 65.00,
      duration: 60,
      stylist_name: 'Sarah Johnson',
      is_active: true
    },
    {
      name: 'Full Color Service',
      description: 'Complete hair coloring with toner and style',
      category: 'color',
      price: 120.00,
      duration: 180,
      stylist_name: 'Maria Rodriguez',
      is_active: true
    },
    {
      name: 'Deep Conditioning Treatment',
      description: 'Intensive moisture treatment for damaged hair',
      category: 'treatments',
      price: 45.00,
      duration: 45,
      stylist_name: 'Sarah Johnson',
      is_active: true
    },
    {
      name: 'Bridal Package',
      description: 'Complete bridal hair and makeup service',
      category: 'packages',
      price: 250.00,
      duration: 240,
      stylist_name: 'Maria Rodriguez',
      is_active: true
    }
  ]
  
  // Sample gallery images
  const sampleGalleryImages = [
    {
      title: 'Summer Blonde Highlights',
      description: 'Beautiful blonde highlights perfect for summer',
      image_url: 'https://images.unsplash.com/photo-1560869713-7d0b29837c64?w=800',
      thumbnail_url: 'https://images.unsplash.com/photo-1560869713-7d0b29837c64?w=400',
      tags: ['blonde', 'highlights', 'summer'],
      category: 'color',
      is_featured: true
    },
    {
      title: 'Modern Bob Cut',
      description: 'Sleek and modern bob haircut',
      image_url: 'https://images.unsplash.com/photo-1594824804732-5b4c8c6e8b8e?w=800',
      thumbnail_url: 'https://images.unsplash.com/photo-1594824804732-5b4c8c6e8b8e?w=400',
      tags: ['bob', 'modern', 'sleek'],
      category: 'cuts',
      is_featured: false
    },
    {
      title: 'Curly Hair Treatment',
      description: 'Defined curls with deep conditioning',
      image_url: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=800',
      thumbnail_url: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=400',
      tags: ['curly', 'treatment', 'conditioning'],
      category: 'treatments',
      is_featured: true
    }
  ]
  
  try {
    // Insert sample services
    const { error: servicesError } = await supabase
      .from('services')
      .insert(sampleServices)
    
    if (servicesError) {
      throw servicesError
    }
    
    console.log('✅ Sample services inserted')
    
    // Insert sample gallery images
    const { error: galleryError } = await supabase
      .from('gallery_images')
      .insert(sampleGalleryImages)
    
    if (galleryError) {
      throw galleryError
    }
    
    console.log('✅ Sample gallery images inserted')
    
  } catch (error) {
    console.error('❌ Failed to seed initial data:')
    console.error(error.message)
    throw error
  }
}

async function verifySetup() {
  console.log('Verifying database setup...')
  
  try {
    // Check if tables exist and have data
    const { data: services, error: servicesError } = await supabase
      .from('services')
      .select('count', { count: 'exact', head: true })
    
    if (servicesError) {
      throw servicesError
    }
    
    const { data: gallery, error: galleryError } = await supabase
      .from('gallery_images')
      .select('count', { count: 'exact', head: true })
    
    if (galleryError) {
      throw galleryError
    }
    
    console.log(`✅ Database verification complete:`)
    console.log(`   - Services table: ${services.count || 0} records`)
    console.log(`   - Gallery images table: ${gallery.count || 0} records`)
    
  } catch (error) {
    console.error('❌ Database verification failed:')
    console.error(error.message)
    throw error
  }
}

async function main() {
  console.log('🚀 Initializing salon microsite database...')
  
  try {
    // Run migrations in order
    const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations')
    
    if (fs.existsSync(migrationsDir)) {
      const migrationFiles = fs.readdirSync(migrationsDir)
        .filter(file => file.endsWith('.sql'))
        .sort()
      
      for (const file of migrationFiles) {
        await runMigration(path.join(migrationsDir, file))
      }
    } else {
      console.log('⚠️  No migrations directory found, skipping migrations')
    }
    
    // Seed initial data
    await seedInitialData()
    
    // Verify setup
    await verifySetup()
    
    console.log('🎉 Database initialization completed successfully!')
    
  } catch (error) {
    console.error('💥 Database initialization failed:')
    console.error(error.message)
    process.exit(1)
  }
}

// Run the initialization
if (require.main === module) {
  main()
}

module.exports = { main }