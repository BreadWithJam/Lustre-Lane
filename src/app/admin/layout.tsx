import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin Panel – Salon Microsite',
  robots: { index: false, follow: false },
}

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  // Auth guard is handled client-side in AdminLayout component
  return <>{children}</>
}
