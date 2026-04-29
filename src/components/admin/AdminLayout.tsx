'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: '📊', exact: true },
  { href: '/admin/services', label: 'Services', icon: '✂️' },
  { href: '/admin/gallery', label: 'Gallery', icon: '🖼️' },
  { href: '/admin/messages', label: 'Messages', icon: '💬' },
  { href: '/admin/analytics', label: 'Analytics', icon: '📈' },
]

interface AdminLayoutProps {
  children: React.ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace('/admin/login')
        return
      }
      const token = await user.getIdTokenResult()
      if (!token.claims.admin && token.claims.role !== 'admin') {
        await signOut(auth)
        router.replace('/admin/login')
        return
      }
      setUserEmail(user.email)
      setChecking(false)
    })
    return unsub
  }, [router])

  async function handleSignOut() {
    await signOut(auth)
    router.push('/admin/login')
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-salon-cream">
        <div className="text-salon-warm-gray">Verifying access…</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-border flex flex-col">
        <div className="p-6 border-b border-border">
          <h1 className="text-xl font-serif font-bold text-salon-brown">Salon Admin</h1>
          <p className="text-xs text-salon-warm-gray mt-1 truncate">{userEmail}</p>
        </div>

        <nav className="flex-1 p-4 space-y-1" aria-label="Admin navigation">
          {NAV_ITEMS.map((item) => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-salon-brown text-white'
                    : 'text-salon-warm-gray hover:bg-salon-cream hover:text-salon-brown'
                }`}
                aria-current={active ? 'page' : undefined}
              >
                <span aria-hidden="true">{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-salon-warm-gray hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <span aria-hidden="true">🚪</span>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
