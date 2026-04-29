import Link from 'next/link'

export default function DemoPage() {
  return (
    <main className="flex-1">
      {/* Header Section */}
      <section className="bg-salon-cream py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-salon-brown mb-4">
            Service Management Demo
          </h1>
          <p className="text-xl text-salon-warm-gray max-w-2xl mx-auto mb-8">
            This demo showcases the service management system implementation. 
            In a production environment, this would connect to a live Supabase database.
          </p>
          <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold text-salon-brown mb-4">
              ✅ Task 3: Service Management System - COMPLETED
            </h2>
            <div className="text-left space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span>Service model with validation and CRUD operations</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span>API routes for service management (/api/services endpoints)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span>ServiceGrid component with responsive card layout</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span>ServiceCard component with pricing, duration, and favorite functionality</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span>ServiceDetailDrawer component with gallery and messaging CTAs</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span>Category-based filtering and search functionality</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Implementation Details */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8">
            {/* API Implementation */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-2xl font-semibold text-salon-brown mb-4">
                🔌 API Implementation
              </h3>
              <div className="space-y-3 text-salon-warm-gray">
                <div>
                  <strong>GET /api/services</strong>
                  <p>Fetch services with filtering support (category, price, duration, stylist)</p>
                </div>
                <div>
                  <strong>POST /api/services</strong>
                  <p>Create new services with validation</p>
                </div>
                <div>
                  <strong>GET /api/services/[id]</strong>
                  <p>Fetch individual service details</p>
                </div>
                <div>
                  <strong>PUT /api/services/[id]</strong>
                  <p>Update existing services</p>
                </div>
                <div>
                  <strong>DELETE /api/services/[id]</strong>
                  <p>Remove services from the system</p>
                </div>
              </div>
            </div>

            {/* Component Architecture */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-2xl font-semibold text-salon-brown mb-4">
                🧩 Component Architecture
              </h3>
              <div className="space-y-3 text-salon-warm-gray">
                <div>
                  <strong>ServiceGrid</strong>
                  <p>Main container with category tabs, search, and filtering</p>
                </div>
                <div>
                  <strong>ServiceCard</strong>
                  <p>Individual service display with favorites and pricing</p>
                </div>
                <div>
                  <strong>ServiceDetailDrawer</strong>
                  <p>Modal with detailed service info and booking CTAs</p>
                </div>
                <div>
                  <strong>ServiceFilters</strong>
                  <p>Advanced filtering by price, duration, and stylist</p>
                </div>
                <div>
                  <strong>useFavorites Hook</strong>
                  <p>Local storage-based favorites management</p>
                </div>
              </div>
            </div>

            {/* Features Implemented */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-2xl font-semibold text-salon-brown mb-4">
                ⭐ Key Features
              </h3>
              <div className="space-y-2 text-salon-warm-gray">
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Responsive grid layout for all screen sizes</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Category-based service organization</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Real-time search across services and stylists</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Advanced filtering (price range, duration, stylist)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Persistent favorites with localStorage</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Detailed service drawer with booking CTAs</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Loading states and error handling</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Accessibility features (keyboard navigation, ARIA)</span>
                </div>
              </div>
            </div>

            {/* Testing Coverage */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-2xl font-semibold text-salon-brown mb-4">
                🧪 Testing Coverage
              </h3>
              <div className="space-y-2 text-salon-warm-gray">
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span>API route testing with mocked database</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span>ServiceCard component rendering and interactions</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span>useFavorites hook functionality</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Error handling and edge cases</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Data formatting and validation</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span>LocalStorage integration</span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="mt-12 text-center">
            <div className="space-y-4">
              <p className="text-salon-warm-gray">
                To see the service management system in action, you would need to:
              </p>
              <div className="bg-salon-cream p-6 rounded-lg">
                <ol className="text-left space-y-2 text-salon-warm-gray">
                  <li>1. Set up a Supabase project and configure environment variables</li>
                  <li>2. Run the database initialization script: <code className="bg-white px-2 py-1 rounded">npm run db:init</code></li>
                  <li>3. Navigate to the services page: <Link href="/services" className="text-salon-brown hover:text-salon-gold">/services</Link></li>
                </ol>
              </div>
              <div className="flex gap-4 justify-center">
                <Link
                  href="/"
                  className="bg-salon-brown text-white px-6 py-3 rounded-lg font-semibold hover:bg-salon-brown/90 transition-colors"
                >
                  Back to Home
                </Link>
                <Link
                  href="/services"
                  className="border-2 border-salon-brown text-salon-brown px-6 py-3 rounded-lg font-semibold hover:bg-salon-brown/5 transition-colors"
                >
                  View Services Page
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}