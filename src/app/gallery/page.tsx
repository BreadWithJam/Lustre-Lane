import { GalleryGrid } from '@/components/gallery/GalleryGrid'
import { ErrorBoundary } from '@/components/ErrorBoundary'

export const metadata = {
  title: 'Style Gallery | Salon',
  description: 'Browse our style gallery for hair inspiration and reference photos.',
}

export default function GalleryPage() {
  return (
    <main className="flex-1">
      {/* Header */}
      <section className="bg-salon-cream py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-salon-brown mb-4">
            Style Gallery
          </h1>
          <p className="text-xl text-salon-warm-gray max-w-2xl mx-auto">
            Find inspiration for your next look. Browse our curated collection of styles
            organized by category and trend.
          </p>
        </div>
      </section>

      {/* Gallery */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <ErrorBoundary>
            <GalleryGrid />
          </ErrorBoundary>
        </div>
      </section>
    </main>
  )
}
