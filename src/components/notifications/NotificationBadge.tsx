/**
 * NotificationBadge — displays a real-time unread count indicator.
 * Requirements: 4.2
 */
'use client'

import { useNotificationBadge } from '@/hooks/useNotificationBadge'

interface NotificationBadgeProps {
  /** Override the count (e.g. from a parent that already has the data). When provided, skips the Firestore subscription. */
  count?: number
  /** Maximum number to display before showing "N+" */
  max?: number
  className?: string
}

/** Inner component that subscribes to Firestore — only rendered when no explicit count is given. */
function LiveBadge({ max, className }: { max: number; className: string }) {
  const { unreadCount } = useNotificationBadge()
  return <BadgeDisplay count={unreadCount} max={max} className={className} />
}

function BadgeDisplay({
  count,
  max,
  className,
}: {
  count: number
  max: number
  className: string
}) {
  if (count === 0) return null
  const label = count > max ? `${max}+` : String(count)

  return (
    <span
      role="status"
      aria-label={`${count} unread notification${count !== 1 ? 's' : ''}`}
      className={`
        inline-flex items-center justify-center
        min-w-[18px] h-[18px] px-1
        text-[10px] font-bold leading-none text-white
        bg-red-500 rounded-full
        ${className}
      `}
    >
      {label}
    </span>
  )
}

export function NotificationBadge({ count, max = 99, className = '' }: NotificationBadgeProps) {
  // When an explicit count is provided, render statically without a Firestore listener
  if (count !== undefined) {
    return <BadgeDisplay count={count} max={max} className={className} />
  }

  return <LiveBadge max={max} className={className} />
}
