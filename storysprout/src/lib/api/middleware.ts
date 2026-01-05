/**
 * API Middleware Utilities
 *
 * Common middleware functions for API routes including:
 * - Authentication
 * - Rate limiting
 * - Error handling
 * - Request validation
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z, ZodSchema, ZodError } from 'zod'

// =====================================================
// TYPES
// =====================================================

export interface AuthenticatedUser {
  id: string
  email: string
  role?: string
  organizationId?: string
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: ApiError
  meta?: {
    timestamp: string
    requestId: string
  }
}

export interface ApiError {
  code: string
  message: string
  details?: unknown
}

export type ApiHandler<T = unknown> = (
  req: NextRequest,
  context: ApiContext
) => Promise<NextResponse<ApiResponse<T>>>

export interface ApiContext {
  user?: AuthenticatedUser
  requestId: string
  startTime: number
}

// =====================================================
// RATE LIMITER
// =====================================================

interface RateLimitEntry {
  count: number
  windowStart: number
}

const rateLimits = new Map<string, RateLimitEntry>()

export interface RateLimitConfig {
  windowMs: number
  maxRequests: number
  keyGenerator?: (req: NextRequest, user?: AuthenticatedUser) => string
}

const DEFAULT_RATE_LIMIT: RateLimitConfig = {
  windowMs: 60000, // 1 minute
  maxRequests: 60, // 60 requests per minute
}

export function checkRateLimit(
  key: string,
  config: RateLimitConfig = DEFAULT_RATE_LIMIT
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now()
  const entry = rateLimits.get(key)

  if (!entry || now - entry.windowStart > config.windowMs) {
    rateLimits.set(key, { count: 1, windowStart: now })
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetAt: now + config.windowMs,
    }
  }

  if (entry.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.windowStart + config.windowMs,
    }
  }

  entry.count++
  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetAt: entry.windowStart + config.windowMs,
  }
}

// =====================================================
// RESPONSE HELPERS
// =====================================================

export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

export function successResponse<T>(
  data: T,
  requestId: string,
  status: number = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        requestId,
      },
    },
    { status }
  )
}

export function errorResponse(
  code: string,
  message: string,
  requestId: string,
  status: number = 400,
  details?: unknown
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: { code, message, details },
      meta: {
        timestamp: new Date().toISOString(),
        requestId,
      },
    },
    { status }
  )
}

// =====================================================
// AUTHENTICATION
// =====================================================

export async function getAuthenticatedUser(
  req: NextRequest
): Promise<AuthenticatedUser | null> {
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      return null
    }

    // Optionally fetch additional user data (role, org, etc.)
    const { data: userAccount } = await supabase
      .from('user_accounts')
      .select('role, organization_id')
      .eq('user_id', user.id)
      .single()

    return {
      id: user.id,
      email: user.email || '',
      role: userAccount?.role,
      organizationId: userAccount?.organization_id,
    }
  } catch {
    return null
  }
}

// =====================================================
// REQUEST VALIDATION
// =====================================================

export async function validateRequestBody<T>(
  req: NextRequest,
  schema: ZodSchema<T>
): Promise<{ success: true; data: T } | { success: false; error: ZodError }> {
  try {
    const body = await req.json()
    const result = schema.safeParse(body)

    if (!result.success) {
      return { success: false, error: result.error }
    }

    return { success: true, data: result.data }
  } catch {
    return {
      success: false,
      error: new ZodError([
        {
          code: 'custom',
          path: [],
          message: 'Invalid JSON body',
        },
      ]),
    }
  }
}

export function formatZodError(error: ZodError): string {
  return error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join('; ')
}

// =====================================================
// API HANDLER WRAPPER
// =====================================================

export interface HandlerOptions {
  requireAuth?: boolean
  rateLimit?: RateLimitConfig
}

/**
 * Wrap an API handler with common middleware
 */
export function withMiddleware<T>(
  handler: ApiHandler<T>,
  options: HandlerOptions = {}
): (req: NextRequest) => Promise<NextResponse<ApiResponse<T>>> {
  return async (req: NextRequest) => {
    const requestId = generateRequestId()
    const startTime = Date.now()

    try {
      // Authentication
      let user: AuthenticatedUser | undefined
      if (options.requireAuth) {
        const authUser = await getAuthenticatedUser(req)
        if (!authUser) {
          return errorResponse(
            'UNAUTHORIZED',
            'Authentication required',
            requestId,
            401
          ) as NextResponse<ApiResponse<T>>
        }
        user = authUser
      }

      // Rate limiting
      if (options.rateLimit) {
        const rateLimitKey = user?.id || req.ip || 'anonymous'
        const rateCheck = checkRateLimit(rateLimitKey, options.rateLimit)

        if (!rateCheck.allowed) {
          const response = errorResponse(
            'RATE_LIMITED',
            'Too many requests. Please try again later.',
            requestId,
            429
          ) as NextResponse<ApiResponse<T>>

          response.headers.set('X-RateLimit-Remaining', '0')
          response.headers.set('X-RateLimit-Reset', rateCheck.resetAt.toString())
          return response
        }
      }

      // Call handler
      const context: ApiContext = { user, requestId, startTime }
      const response = await handler(req, context)

      // Add timing header
      response.headers.set('X-Response-Time', `${Date.now() - startTime}ms`)
      response.headers.set('X-Request-Id', requestId)

      return response
    } catch (error) {
      console.error(`API Error [${requestId}]:`, error)

      return errorResponse(
        'INTERNAL_ERROR',
        'An unexpected error occurred',
        requestId,
        500,
        process.env.NODE_ENV === 'development' ? String(error) : undefined
      ) as NextResponse<ApiResponse<T>>
    }
  }
}

// =====================================================
// COMMON VALIDATION SCHEMAS
// =====================================================

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

export const uuidSchema = z.string().uuid()

export type PaginationParams = z.infer<typeof paginationSchema>
