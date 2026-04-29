'use client'

import { usePreferences } from '@/hooks/usePreferences'
import { useFavorites } from '@/hooks/useFavorites'
import Link from 'next/link'

export default function ProfilePage() {
  const { preferences, updatePreferences, clearPreferences } = usePreferences()
  const { getFavoriteCount, clearFavorites } = useFavorites()

  return (
    <main className="flex-1 pb-20 md:pb-0">
      <section className="bg-salon-cream py-12">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-salon-brown mb-2">
            Your Profile
          </h1>
          <p className="text-salon-warm-gray">
            Manage your preferences and favorites
          </p>
        </div>
      </section>

      <section className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Favorites Summary */}
        <div className="bg-white rounded-xl border border-border p-6">
          <h2 className="text-xl font-semibold text-salon-brown mb-4">Favorites</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-salon-warm-gray mb-1">Saved Services</p>
              <p className="text-2xl font-bold text-salon-brown">{getFavoriteCount()}</p>
            </div>
            <Link
              href="/services"
              className="text-sm font-medium text-salon-brown hover:text-salon-gold transition-colors"
            >
              View All →
            </Link>
          </div>
          {getFavoriteCount() > 0 && (
            <button
              onClick={clearFavorites}
              className="mt-4 text-sm text-red-600 hover:text-red-700 transition-colors"
            >
              Clear all favorites
            </button>
          )}
        </div>

        {/* Preferences */}
        <div className="bg-white rounded-xl border border-border p-6">
          <h2 className="text-xl font-semibold text-salon-brown mb-4">Preferences</h2>
          
          <div className="space-y-4">
            {/* Preferred Category */}
            <div>
              <label htmlFor="preferred-category" className="block text-sm font-medium text-salon-brown mb-2">
                Preferred Service Category
              </label>
              <select
                id="preferred-category"
                value={preferences.preferredCategory || ''}
                onChange={(e) => updatePreferences({ preferredCategory: e.target.value || undefined })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-salon-brown/30"
              >
                <option value="">No preference</option>
                <option value="cuts">Cuts</option>
                <option value="color">Color</option>
                <option value="treatments">Treatments</option>
                <option value="packages">Packages</option>
              </select>
            </div>

            {/* Notifications */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-salon-brown">Notifications</p>
                <p className="text-xs text-salon-warm-gray">Receive updates about your messages</p>
              </div>
              <button
                role="switch"
                aria-checked={preferences.notificationsEnabled}
                onClick={() => updatePreferences({ notificationsEnabled: !preferences.notificationsEnabled })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  preferences.notificationsEnabled ? 'bg-salon-brown' : 'bg-gray-300'
                }`}
              >
                <span className="sr-only">Enable notifications</span>
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preferences.notificationsEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-xl border border-border p-6">
          <h2 className="text-xl font-semibold text-salon-brown mb-4">Contact Us</h2>
          <div className="space-y-3">
            <a
              href="tel:+15555550100"
              className="flex items-center gap-3 text-salon-warm-gray hover:text-salon-brown transition-colors"
            >
              <span className="text-xl">📞</span>
              <span className="text-sm">(555) 555-0100</span>
            </a>
            <a
              href="mailto:hello@salon.example"
              className="flex items-center gap-3 text-salon-warm-gray hover:text-salon-brown transition-colors"
            >
              <span className="text-xl">✉️</span>
              <span className="text-sm">hello@salon.example</span>
            </a>
            <a
              href="https://maps.google.com/?q=123+Main+St"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-salon-warm-gray hover:text-salon-brown transition-colors"
            >
              <span className="text-xl">📍</span>
              <span className="text-sm">123 Main St, City, State 12345</span>
            </a>
          </div>
        </div>

        {/* Reset */}
        <div className="pt-4">
          <button
            onClick={clearPreferences}
            className="text-sm text-salon-warm-gray hover:text-red-600 transition-colors"
          >
            Reset all preferences
          </button>
        </div>
      </section>
    </main>
  )
}
