'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/utils'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/services', label: 'Services' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/chat', label: 'Chat' },
]

export function Header() {
  const pathname = usePathname()

  // Admin section has its own navigation
  if (pathname.startsWith('/admin')) return null

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-border shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="font-serif text-xl font-bold text-salon-brown hover:text-salon-gold transition-colors"
          aria-label="Salon home"
        >
          Salon
        </Link>

        {/* Desktop Navigation */}
        <nav aria-label="Main navigation" className="hidden md:flex items-center gap-1">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                pathname === href
                  ? 'bg-salon-cream text-salon-brown'
                  : 'text-salon-warm-gray hover:text-salon-brown hover:bg-salon-cream/60'
              )}
              aria-current={pathname === href ? 'page' : undefined}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <a
            href="tel:+15555550100"
            className="text-sm font-medium text-salon-warm-gray hover:text-salon-brown transition-colors"
            aria-label="Call the salon"
          >
            📞 Call
          </a>
          <Link
            href="/chat"
            className="bg-salon-brown text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-salon-brown/90 transition-colors"
          >
            Book Now
          </Link>
        </div>
      </div>
    </header>
  )
}
