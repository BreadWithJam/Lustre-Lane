/**
 * Network error handling with retry logic and exponential backoff.
 * Requirements: All requirements benefit from proper error handling
 */

export interface RetryConfig {
  /** Maximum number of retry attempts (not counting the initial request) */
  maxRetries: number
  /** Base delay in milliseconds before the first retry */
  baseDelayMs: number
  /** Maximum delay cap in milliseconds */
  maxDelayMs: number
  /** HTTP status codes that should trigger a retry */
  retryableStatuses: number[]
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelayMs: 500,
  maxDelayMs: 10_000,
  retryableStatuses: [408, 429, 500, 502, 503, 504],
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function getBackoffDelay(attempt: number, config: RetryConfig): number {
  // Exponential backoff with jitter: delay = min(base * 2^attempt + jitter, max)
  const exponential = config.baseDelayMs * Math.pow(2, attempt)
  const jitter = Math.random() * config.baseDelayMs
  return Math.min(exponential + jitter, config.maxDelayMs)
}

export class NetworkError extends Error {
  constructor(
    message: string,
    public status?: number,
    public retryable = false
  ) {
    super(message)
    this.name = 'NetworkError'
  }
}

/**
 * Fetch wrapper with automatic retry on transient failures.
 */
export async function fetchWithRetry(
  url: string,
  options?: RequestInit,
  config: Partial<RetryConfig> = {}
): Promise<Response> {
  const cfg = { ...DEFAULT_RETRY_CONFIG, ...config }
  let lastError: Error = new NetworkError('Request failed')

  for (let attempt = 0; attempt <= cfg.maxRetries; attempt++) {
    try {
      const response = await fetch(url, options)

      if (response.ok) return response

      if (cfg.retryableStatuses.includes(response.status) && attempt < cfg.maxRetries) {
        // Respect Retry-After header if present (e.g. for 429)
        const retryAfter = response.headers.get('Retry-After')
        const delay = retryAfter
          ? parseInt(retryAfter, 10) * 1000
          : getBackoffDelay(attempt, cfg)

        lastError = new NetworkError(
          `Request failed with status ${response.status}`,
          response.status,
          true
        )
        await sleep(delay)
        continue
      }

      // Non-retryable error — return the response as-is so callers can inspect it
      return response
    } catch (err) {
      // Network-level failure (no response)
      lastError = err instanceof Error ? err : new NetworkError('Network request failed')
      if (attempt < cfg.maxRetries) {
        await sleep(getBackoffDelay(attempt, cfg))
      }
    }
  }

  throw lastError
}

/**
 * Convenience wrapper that parses JSON and throws on non-OK responses.
 */
export async function apiFetch<T>(
  url: string,
  options?: RequestInit,
  retryConfig?: Partial<RetryConfig>
): Promise<T> {
  const response = await fetchWithRetry(url, options, retryConfig)

  if (!response.ok) {
    let errorMessage = `Request failed: ${response.status} ${response.statusText}`
    try {
      const body = await response.json()
      errorMessage = body.error ?? body.message ?? errorMessage
    } catch {
      // ignore JSON parse errors
    }
    throw new NetworkError(errorMessage, response.status, false)
  }

  return response.json() as Promise<T>
}
