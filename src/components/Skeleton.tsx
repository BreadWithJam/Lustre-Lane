/**
 * Reusable skeleton loading components for consistent loading states.
 * Requirements: All requirements benefit from proper loading states
 */

import { cn } from '@/utils'

interface SkeletonProps {
  className?: string
}

/** Base skeleton block with pulse animation. */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn('animate-pulse rounded-md bg-salon-cream', className)}
    />
  )
}

/** Skeleton for a service card. */
export function ServiceCardSkeleton() {
  return (
    <div className="rounded-xl border border-border overflow-hidden" aria-hidden="true">
      <Skeleton className="h-48 w-full rounded-none" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex justify-between pt-2">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-20" />
        </div>
      </div>
    </div>
  )
}

/** Skeleton grid for the services page. */
export function ServiceGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      role="status"
      aria-label="Loading services"
    >
      {Array.from({ length: count }).map((_, i) => (
        <ServiceCardSkeleton key={i} />
      ))}
      <span className="sr-only">Loading services…</span>
    </div>
  )
}

/** Skeleton for a gallery tile. */
export function GalleryTileSkeleton({ height = 200 }: { height?: number }) {
  return (
    <div
      aria-hidden="true"
      className="animate-pulse rounded-lg bg-salon-cream w-full mb-3 break-inside-avoid"
      style={{ height }}
    />
  )
}

/** Skeleton masonry grid for the gallery page. */
export function GalleryGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div
      className="columns-2 md:columns-3 lg:columns-4"
      style={{ columnGap: '12px' }}
      role="status"
      aria-label="Loading gallery"
    >
      {Array.from({ length: count }).map((_, i) => (
        <GalleryTileSkeleton key={i} height={180 + (i % 3) * 60} />
      ))}
      <span className="sr-only">Loading gallery images…</span>
    </div>
  )
}

/** Skeleton for a single message bubble. */
export function MessageBubbleSkeleton({ isClient = true }: { isClient?: boolean }) {
  return (
    <div
      className={cn('flex gap-2 mb-2', isClient ? 'justify-end' : 'justify-start')}
      aria-hidden="true"
    >
      {!isClient && <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />}
      <div className="space-y-1 max-w-[70%]">
        <Skeleton className="h-10 w-48 rounded-2xl" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  )
}

/** Skeleton for the message thread list in admin inbox. */
export function ThreadListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="divide-y divide-border" role="status" aria-label="Loading messages">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-start gap-3 p-4" aria-hidden="true">
          <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4" />
          </div>
        </div>
      ))}
      <span className="sr-only">Loading messages…</span>
    </div>
  )
}
