import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="flex-1">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center salon-gradient">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6">
            Premium Hair & Beauty
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-white/90">
            Discover exceptional styling with our expert team
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/services"
              className="bg-white text-salon-brown px-8 py-3 rounded-lg font-semibold hover:bg-white/90 transition-colors"
            >
              Browse Services
            </Link>
            <Link
              href="/gallery"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
            >
              View Gallery
            </Link>
            <Link
              href="/contact"
              className="bg-salon-gold text-white px-8 py-3 rounded-lg font-semibold hover:bg-salon-gold/90 transition-colors"
            >
              Get Consultation
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Info Section */}
      <section className="py-16 bg-salon-cream">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="p-6">
              <div className="w-16 h-16 bg-salon-brown rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">✂️</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-salon-brown">Expert Stylists</h3>
              <p className="text-salon-warm-gray">Professional team with years of experience</p>
            </div>
            <div className="p-6">
              <div className="w-16 h-16 bg-salon-brown rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">💬</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-salon-brown">Personal Consultation</h3>
              <p className="text-salon-warm-gray">Get personalized advice for your style</p>
            </div>
            <div className="p-6">
              <div className="w-16 h-16 bg-salon-brown rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">📱</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-salon-brown">Easy Booking</h3>
              <p className="text-salon-warm-gray">Book appointments through our messaging system</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}