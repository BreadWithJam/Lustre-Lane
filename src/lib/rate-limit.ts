/**
 * In-memory rate limiting for API routes.
 * Requirements: All requirements benefit from abuse prevention
 */

interface RateLimitEntry {
  count: number
  resetAt: number
}

// Simple in-memory store — resets on server restart (suitable for serverless with short windows)
const store = new Map<string, RateLimitEntry>()

// Periodically clean up expired entries to prevent memory leaks
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of store.entries()) {
      if (entry.resetAt <= now) store.delete(key)
    }
  }, 60_000)
}

export interface RateLimitConfig {
  /** Maximum number of requests allowed within the window */
  limit: number
  /** Window duration in milliseconds */
  windowMs: number
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: number
  limit: number
}

/**
 * Check whether a given key (e.g. IP address) is within the rate limit.
 */
export function checkRateLimit(key: string, config: RateLimitConfig): RateLimitResult {
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || entry.resetAt <= now) {
    // First request in this window
    const resetAt = now + config.windowMs
    store.set(key, { count: 1, resetAt })
    return { allowed: true, remaining: config.limit - 1, resetAt, limit: config.limit }
  }

  if (entry.count >= config.limit) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt, limit: config.limit }
  }

  entry.count += 1
  return {
    allowed: true,
    remaining: config.limit - entry.count,
    resetAt: entry.resetAt,
    limit: config.limit,
  }
}

/**
 * Extract a rate-limit key from a request.
 * Uses the x-forwarded-for header (set by Vercel/proxies) or falls back to a constant.
 */
export function getRateLimitKey(request: Request, prefix = ''): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown'
  return prefix ? `${prefix}:${ip}` : ip
}

// Pre-configured rate limit profiles
export const RateLimits = {
  /** General API endpoints — 60 req / min */
  api: { limit: 60, windowMs: 60_000 } satisfies RateLimitConfig,
  /** Message creation — 10 req / min to prevent spam */
  messages: { limit: 10, windowMs: 60_000 } satisfies RateLimitConfig,
  /** Auth endpoints — 5 attempts / 15 min */
  auth: { limit: 5, windowMs: 15 * 60_000 } satisfies RateLimitConfig,
  /** Notification endpoints — 20 req / min */
  notifications: { limit: 20, windowMs: 60_000 } satisfies RateLimitConfig,
}
