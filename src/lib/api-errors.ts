/**
 * Standardized API error handling with proper HTTP status codes.
 * Requirements: All requirements benefit from proper error handling
 */

import { NextResponse } from 'next/server'

export enum ErrorCode {
  // Client errors (4xx)
  BAD_REQUEST = 'BAD_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  
  // Server errors (5xx)
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
}

export interface ApiErrorResponse {
  error: string
  code: ErrorCode
  message?: string
  details?: Record<string, unknown>
  timestamp: string
}

export class ApiError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
    public statusCode: number,
    public details?: Record<string, unknown>
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

/**
 * Create a standardized error response with proper HTTP status code.
 */
export function createErrorResponse(
  error: unknown,
  fallbackMessage = 'An unexpected error occurred'
): NextResponse<ApiErrorResponse> {
  // Handle our custom ApiError
  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
        details: error.details,
        timestamp: new Date().toISOString(),
      },
      { status: error.statusCode }
    )
  }

  // Handle validation errors from database layer
  if (error instanceof Error && error.name === 'ValidationError') {
    return NextResponse.json(
      {
        error: error.message,
        code: ErrorCode.VALIDATION_ERROR,
        timestamp: new Date().toISOString(),
      },
      { status: 400 }
    )
  }

  // Handle database errors
  if (error instanceof Error && error.name === 'DatabaseError') {
    const dbError = error as { code?: string; details?: string }
    if (dbError.code === 'NOT_FOUND') {
      return NextResponse.json(
        {
          error: error.message,
          code: ErrorCode.NOT_FOUND,
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      )
    }
    return NextResponse.json(
      {
        error: 'Database operation failed',
        code: ErrorCode.DATABASE_ERROR,
        message: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }

  // Handle generic errors
  const message = error instanceof Error ? error.message : fallbackMessage
  console.error('[API Error]', error)

  return NextResponse.json(
    {
      error: fallbackMessage,
      code: ErrorCode.INTERNAL_ERROR,
      message,
      timestamp: new Date().toISOString(),
    },
    { status: 500 }
  )
}

/**
 * Common error factory functions for consistent error creation.
 */
export const ApiErrors = {
  badRequest: (message: string, details?: Record<string, unknown>) =>
    new ApiError(ErrorCode.BAD_REQUEST, message, 400, details),

  unauthorized: (message = 'Authentication required') =>
    new ApiError(ErrorCode.UNAUTHORIZED, message, 401),

  forbidden: (message = 'Access denied') =>
    new ApiError(ErrorCode.FORBIDDEN, message, 403),

  notFound: (resource: string) =>
    new ApiError(ErrorCode.NOT_FOUND, `${resource} not found`, 404),

  validationError: (message: string, details?: Record<string, unknown>) =>
    new ApiError(ErrorCode.VALIDATION_ERROR, message, 400, details),

  rateLimitExceeded: (message = 'Too many requests, please try again later') =>
    new ApiError(ErrorCode.RATE_LIMIT_EXCEEDED, message, 429),

  internalError: (message = 'Internal server error') =>
    new ApiError(ErrorCode.INTERNAL_ERROR, message, 500),

  databaseError: (message: string) =>
    new ApiError(ErrorCode.DATABASE_ERROR, message, 500),

  externalServiceError: (service: string, message?: string) =>
    new ApiError(
      ErrorCode.EXTERNAL_SERVICE_ERROR,
      `External service error: ${service}`,
      503,
      { service, message }
    ),
}
