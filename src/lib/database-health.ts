import { collection, getCountFromServer } from 'firebase/firestore'
import { db } from './firebase'
import { DatabaseError } from './database'

export interface DatabaseHealthCheck {
  isHealthy: boolean
  latency?: number
  error?: string
  timestamp: Date
}

export async function checkDatabaseHealth(): Promise<DatabaseHealthCheck> {
  const startTime = Date.now()

  try {
    // Lightweight health check — just count services collection
    await getCountFromServer(collection(db, 'services'))
    const latency = Date.now() - startTime

    return { isHealthy: true, latency, timestamp: new Date() }
  } catch (error) {
    const latency = Date.now() - startTime
    return {
      isHealthy: false,
      latency,
      error: error instanceof Error ? error.message : 'Unknown database error',
      timestamp: new Date(),
    }
  }
}

export async function ensureDatabaseConnection(): Promise<void> {
  const health = await checkDatabaseHealth()

  if (!health.isHealthy) {
    throw new DatabaseError(
      `Database connection failed: ${health.error}`,
      'CONNECTION_FAILED'
    )
  }

  if (health.latency && health.latency > 1000) {
    console.warn(`Slow database connection detected: ${health.latency}ms`)
  }
}

// Retry utility with exponential backoff
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  let lastError: Error | undefined

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error')
      if (attempt === maxRetries) break
      const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  throw new DatabaseError(
    `Operation failed after ${maxRetries + 1} attempts: ${lastError?.message ?? 'Unknown error'}`,
    'MAX_RETRIES_EXCEEDED'
  )
}
