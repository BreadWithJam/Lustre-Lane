import { supabase } from './supabase'
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
    // Simple health check query
    const { data, error } = await supabase
      .from('services')
      .select('count', { count: 'exact', head: true })
      .limit(1)
    
    const latency = Date.now() - startTime
    
    if (error) {
      return {
        isHealthy: false,
        latency,
        error: error.message,
        timestamp: new Date()
      }
    }
    
    return {
      isHealthy: true,
      latency,
      timestamp: new Date()
    }
  } catch (error) {
    const latency = Date.now() - startTime
    
    return {
      isHealthy: false,
      latency,
      error: error instanceof Error ? error.message : 'Unknown database error',
      timestamp: new Date()
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
  
  // Log slow connections
  if (health.latency && health.latency > 1000) {
    console.warn(`Slow database connection detected: ${health.latency}ms`)
  }
}

// Connection retry utility with exponential backoff
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
      
      if (attempt === maxRetries) {
        break
      }
      
      // Exponential backoff with jitter
      const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  throw new DatabaseError(
    `Operation failed after ${maxRetries + 1} attempts: ${lastError?.message || 'Unknown error'}`,
    'MAX_RETRIES_EXCEEDED'
  )
}