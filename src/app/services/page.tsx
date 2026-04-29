import { ServiceGrid } from '@/components/services/ServiceGrid'

export default function ServicesPage() {
  return (
    <main className="flex-1">
      {/* Header Section */}
      <section className="bg-salon-cream py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-salon-brown mb-4">
            Our Services
          </h1>
          <p className="text-xl text-salon-warm-gray max-w-2xl mx-auto">
            Discover our comprehensive range of professional hair and beauty services, 
            tailored to enhance your natural beauty.
          </p>
        </div>
      </section>

      {/* Services Grid Section */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <ServiceGrid />
        </div>
      </section>
    </main>
  )
}