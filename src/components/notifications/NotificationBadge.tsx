/**
 * NotificationBadge — displays a real-time unread count indicator.
 * Requirements: 4.2
 */
'use client'

import { useNotificationBadge } from '@/hooks/useNotificationBadge'

interface NotificationBadgeProps {
  /** Override the count (e.g. from a parent that already has the data) */
  count?: number
  /** Maximum number to display before showing "N+" */
  max?: number
  className?: string
}

export function NotificationBadge({ count, max = 99, className = '' }: NotificationBadgeProps) {
  const { unreadCount } = useNotificationBadge()
  const displayCount = count ?? unreadCount

  if (displayCount === 0) return null

  const label = displayCount > max ? `${max}+` : String(displayCount)

  return (
    <span
      role="status"
      aria-label={`${displayCount} unread notification${displayCount !== 1 ? 's' : ''}`}
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
