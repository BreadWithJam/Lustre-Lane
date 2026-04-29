import Link from 'next/link'
import { SearchBar } from '@/components/navigation/SearchBar'

export default function HomePage() {
  return (
    <main className="flex-1">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center salon-gradient">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-serif font-bold mb-4">
            Premium Hair &amp; Beauty
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-white/90">
            Discover exceptional styling with our expert team
          </p>

          {/* Primary CTAs — Requirement 7.1 */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
            <Link
              href="/chat"
              className="bg-white text-salon-brown px-8 py-3 rounded-lg font-semibold hover:bg-white/90 transition-colors"
            >
              📅 Book Appointment
            </Link>
            <Link
              href="/chat"
              className="bg-salon-gold text-white px-8 py-3 rounded-lg font-semibold hover:bg-salon-gold/90 transition-colors"
            >
              💬 Message Us
            </Link>
            <a
              href="tel:+15555550100"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
            >
              📞 Call
            </a>
            <a
              href="https://maps.google.com/?q=123+Main+St"
              target="_blank"
              rel="noopener noreferrer"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
            >
              📍 Directions
            </a>
          </div>

          {/* Search Bar */}
          <div className="max-w-md mx-auto">
            <SearchBar
              placeholder="Search services or styles…"
              scope="global"
              className="shadow-lg"
            />
          </div>
        </div>
      </section>

      {/* Quick Info Section */}
      <section className="py-16 bg-salon-cream">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="p-6">
              <div className="w-16 h-16 bg-salon-brown rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl" aria-hidden="true">✂️</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-salon-brown">Expert Stylists</h3>
              <p className="text-salon-warm-gray">Professional team with years of experience</p>
            </div>
            <div className="p-6">
              <div className="w-16 h-16 bg-salon-brown rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl" aria-hidden="true">💬</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-salon-brown">Personal Consultation</h3>
              <p className="text-salon-warm-gray">Get personalized advice for your style</p>
            </div>
            <div className="p-6">
              <div className="w-16 h-16 bg-salon-brown rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl" aria-hidden="true">📱</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-salon-brown">Easy Booking</h3>
              <p className="text-salon-warm-gray">Book appointments through our messaging system</p>
            </div>
          </div>
        </div>
      </section>

      {/* Explore Section */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-serif font-bold text-salon-brown text-center mb-10">
            Explore
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Link
              href="/services"
              className="group relative overflow-hidden rounded-2xl bg-salon-cream p-8 hover:shadow-lg transition-shadow"
            >
              <div className="text-4xl mb-4" aria-hidden="true">✂️</div>
              <h3 className="text-2xl font-serif font-bold text-salon-brown mb-2 group-hover:text-salon-gold transition-colors">
                Our Services
              </h3>
              <p className="text-salon-warm-gray">
                Browse cuts, color, treatments, and packages with pricing and stylist info.
              </p>
              <span className="mt-4 inline-block text-sm font-medium text-salon-brown group-hover:text-salon-gold transition-colors">
                View Services →
              </span>
            </Link>
            <Link
              href="/gallery"
              className="group relative overflow-hidden rounded-2xl bg-salon-cream p-8 hover:shadow-lg transition-shadow"
            >
              <div className="text-4xl mb-4" aria-hidden="true">🖼️</div>
              <h3 className="text-2xl font-serif font-bold text-salon-brown mb-2 group-hover:text-salon-gold transition-colors">
                Style Gallery
              </h3>
              <p className="text-salon-warm-gray">
                Find inspiration in our curated collection of styles and lookbooks.
              </p>
              <span className="mt-4 inline-block text-sm font-medium text-salon-brown group-hover:text-salon-gold transition-colors">
                View Gallery →
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Strip — Requirement 7.4 */}
      <section className="bg-salon-brown py-10">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-serif font-bold text-white text-center mb-6">
            Get in Touch
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="tel:+15555550100"
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg transition-colors"
            >
              <span aria-hidden="true">📞</span> Call Us
            </a>
            <Link
              href="/chat"
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg transition-colors"
            >
              <span aria-hidden="true">💬</span> Send a Message
            </Link>
            <a
              href="mailto:hello@salon.example"
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg transition-colors"
            >
              <span aria-hidden="true">✉️</span> Email Us
            </a>
            <a
              href="https://maps.google.com/?q=123+Main+St"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg transition-colors"
            >
              <span aria-hidden="true">📍</span> Get Directions
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}
