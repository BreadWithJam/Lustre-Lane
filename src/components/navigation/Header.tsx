'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { cn } from '@/utils'
import LogoMark from '@assets/images/logo only.png'

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
        <Link href="/" aria-label="Lustre Lane home" className="flex items-center">
          <Image
            src={LogoMark}
            alt="Lustre Lane Salon logo"
            priority
            width={420}
            height={260}
            sizes="120px"
            className="h-14 w-auto md:h-16 object-contain"
            style={{ width: 'auto', height: 'auto' }}
          />
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
