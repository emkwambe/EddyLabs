/**
 * POST /api/reading-sessions
 * GET /api/reading-sessions
 *
 * Manage reading sessions for tracking progress
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import {
  withMiddleware,
  validateRequestBody,
  successResponse,
  errorResponse,
  formatZodError,
  ApiContext,
  ApiResponse,
  paginationSchema,
} from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'

// =====================================================
// TYPES
// =====================================================

interface ReadingSession {
  id: string
  childId: string
  storyId: string
  startedAt: string
  endedAt?: string
  durationSeconds: number
  wordsRead: number
  currentPage?: number
  isCompleted: boolean
}

interface ReadingSessionSummary {
  sessions: ReadingSession[]
  totalSessions: number
  totalReadingSeconds: number
  totalWordsRead: number
}

// =====================================================
// REQUEST VALIDATION SCHEMAS
// =====================================================

const createSessionSchema = z.object({
  childId: z.string().uuid(),
  storyId: z.string().uuid(),
  currentPage: z.number().int().min(1).optional(),
})

const updateSessionSchema = z.object({
  sessionId: z.string().uuid(),
  endedAt: z.string().datetime().optional(),
  durationSeconds: z.number().int().min(0).optional(),
  wordsRead: z.number().int().min(0).optional(),
  currentPage: z.number().int().min(1).optional(),
  isCompleted: z.boolean().optional(),
})

// =====================================================
// HANDLERS
// =====================================================

async function handleCreateSession(
  req: NextRequest,
  context: ApiContext
): Promise<NextResponse<ApiResponse<ReadingSession>>> {
  const { requestId, user } = context

  if (!user) {
    return errorResponse(
      'UNAUTHORIZED',
      'Authentication required',
      requestId,
      401
    ) as NextResponse<ApiResponse<ReadingSession>>
  }

  const validation = await validateRequestBody(req, createSessionSchema)
  if (!validation.success) {
    return errorResponse(
      'VALIDATION_ERROR',
      formatZodError(validation.error),
      requestId,
      400
    ) as NextResponse<ApiResponse<ReadingSession>>
  }

  const { childId, storyId, currentPage } = validation.data
  const supabase = await createClient()

  // Verify user owns this child profile
  const { data: childProfile } = await supabase
    .from('child_profiles')
    .select('parent_id')
    .eq('id', childId)
    .single()

  if (!childProfile) {
    return errorResponse(
      'NOT_FOUND',
      'Child profile not found',
      requestId,
      404
    ) as NextResponse<ApiResponse<ReadingSession>>
  }

  const { data: parentAccount } = await supabase
    .from('parent_accounts')
    .select('user_id')
    .eq('id', childProfile.parent_id)
    .single()

  if (parentAccount?.user_id !== user.id) {
    return errorResponse(
      'FORBIDDEN',
      'Access denied to this child profile',
      requestId,
      403
    ) as NextResponse<ApiResponse<ReadingSession>>
  }

  // Create reading session
  const { data: session, error } = await supabase
    .from('reading_sessions')
    .insert({
      child_id: childId,
      story_id: storyId,
      started_at: new Date().toISOString(),
      duration_seconds: 0,
      words_read: 0,
    })
    .select()
    .single()

  if (error || !session) {
    return errorResponse(
      'CREATE_FAILED',
      'Failed to create reading session',
      requestId,
      500,
      error
    ) as NextResponse<ApiResponse<ReadingSession>>
  }

  // Update reading progress
  await supabase
    .from('reading_progress')
    .upsert({
      child_id: childId,
      story_id: storyId,
      current_position: currentPage || 1,
      last_read_at: new Date().toISOString(),
    }, {
      onConflict: 'child_id,story_id',
    })

  const readingSession: ReadingSession = {
    id: session.id,
    childId: session.child_id,
    storyId: session.story_id,
    startedAt: session.started_at,
    endedAt: session.ended_at,
    durationSeconds: session.duration_seconds,
    wordsRead: session.words_read,
    currentPage,
    isCompleted: false,
  }

  return successResponse(readingSession, requestId, 201)
}

async function handleGetSessions(
  req: NextRequest,
  context: ApiContext
): Promise<NextResponse<ApiResponse<ReadingSessionSummary>>> {
  const { requestId, user } = context

  if (!user) {
    return errorResponse(
      'UNAUTHORIZED',
      'Authentication required',
      requestId,
      401
    ) as NextResponse<ApiResponse<ReadingSessionSummary>>
  }

  const url = new URL(req.url)
  const childId = url.searchParams.get('childId')
  const page = parseInt(url.searchParams.get('page') || '1')
  const limit = parseInt(url.searchParams.get('limit') || '20')

  if (!childId) {
    return errorResponse(
      'VALIDATION_ERROR',
      'childId query parameter is required',
      requestId,
      400
    ) as NextResponse<ApiResponse<ReadingSessionSummary>>
  }

  const supabase = await createClient()

  // Verify user owns this child profile
  const { data: childProfile } = await supabase
    .from('child_profiles')
    .select('parent_id')
    .eq('id', childId)
    .single()

  if (!childProfile) {
    return errorResponse(
      'NOT_FOUND',
      'Child profile not found',
      requestId,
      404
    ) as NextResponse<ApiResponse<ReadingSessionSummary>>
  }

  const { data: parentAccount } = await supabase
    .from('parent_accounts')
    .select('user_id')
    .eq('id', childProfile.parent_id)
    .single()

  if (parentAccount?.user_id !== user.id) {
    return errorResponse(
      'FORBIDDEN',
      'Access denied to this child profile',
      requestId,
      403
    ) as NextResponse<ApiResponse<ReadingSessionSummary>>
  }

  // Fetch sessions with pagination
  const offset = (page - 1) * limit

  const { data: sessions, error, count } = await supabase
    .from('reading_sessions')
    .select('*', { count: 'exact' })
    .eq('child_id', childId)
    .order('started_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    return errorResponse(
      'FETCH_FAILED',
      'Failed to fetch reading sessions',
      requestId,
      500,
      error
    ) as NextResponse<ApiResponse<ReadingSessionSummary>>
  }

  // Calculate totals
  const { data: totals } = await supabase
    .from('reading_sessions')
    .select('duration_seconds, words_read')
    .eq('child_id', childId)

  const totalReadingSeconds = totals?.reduce((sum, s) => sum + (s.duration_seconds || 0), 0) || 0
  const totalWordsRead = totals?.reduce((sum, s) => sum + (s.words_read || 0), 0) || 0

  const summary: ReadingSessionSummary = {
    sessions: (sessions || []).map(s => ({
      id: s.id,
      childId: s.child_id,
      storyId: s.story_id,
      startedAt: s.started_at,
      endedAt: s.ended_at,
      durationSeconds: s.duration_seconds || 0,
      wordsRead: s.words_read || 0,
      isCompleted: !!s.ended_at,
    })),
    totalSessions: count || 0,
    totalReadingSeconds,
    totalWordsRead,
  }

  return successResponse(summary, requestId)
}

// =====================================================
// UPDATE SESSION (PATCH)
// =====================================================

async function handleUpdateSession(
  req: NextRequest,
  context: ApiContext
): Promise<NextResponse<ApiResponse<ReadingSession>>> {
  const { requestId, user } = context

  if (!user) {
    return errorResponse(
      'UNAUTHORIZED',
      'Authentication required',
      requestId,
      401
    ) as NextResponse<ApiResponse<ReadingSession>>
  }

  const validation = await validateRequestBody(req, updateSessionSchema)
  if (!validation.success) {
    return errorResponse(
      'VALIDATION_ERROR',
      formatZodError(validation.error),
      requestId,
      400
    ) as NextResponse<ApiResponse<ReadingSession>>
  }

  const { sessionId, endedAt, durationSeconds, wordsRead, currentPage, isCompleted } = validation.data
  const supabase = await createClient()

  // Verify ownership
  const { data: session } = await supabase
    .from('reading_sessions')
    .select('*, child_profiles!inner(parent_id)')
    .eq('id', sessionId)
    .single()

  if (!session) {
    return errorResponse(
      'NOT_FOUND',
      'Reading session not found',
      requestId,
      404
    ) as NextResponse<ApiResponse<ReadingSession>>
  }

  // Build update object
  const updates: Record<string, unknown> = {}
  if (endedAt) updates.ended_at = endedAt
  if (durationSeconds !== undefined) updates.duration_seconds = durationSeconds
  if (wordsRead !== undefined) updates.words_read = wordsRead

  // Update session
  const { data: updated, error } = await supabase
    .from('reading_sessions')
    .update(updates)
    .eq('id', sessionId)
    .select()
    .single()

  if (error || !updated) {
    return errorResponse(
      'UPDATE_FAILED',
      'Failed to update reading session',
      requestId,
      500,
      error
    ) as NextResponse<ApiResponse<ReadingSession>>
  }

  // Update reading progress if completed
  if (isCompleted) {
    await supabase
      .from('reading_progress')
      .upsert({
        child_id: session.child_id,
        story_id: session.story_id,
        is_completed: true,
        completed_at: new Date().toISOString(),
        total_time_seconds: durationSeconds || 0,
        current_position: currentPage,
        last_read_at: new Date().toISOString(),
      }, {
        onConflict: 'child_id,story_id',
      })
  }

  const readingSession: ReadingSession = {
    id: updated.id,
    childId: updated.child_id,
    storyId: updated.story_id,
    startedAt: updated.started_at,
    endedAt: updated.ended_at,
    durationSeconds: updated.duration_seconds || 0,
    wordsRead: updated.words_read || 0,
    currentPage,
    isCompleted: isCompleted || false,
  }

  return successResponse(readingSession, requestId)
}

// =====================================================
// EXPORTS
// =====================================================

export const POST = withMiddleware(handleCreateSession, { requireAuth: true })
export const GET = withMiddleware(handleGetSessions, { requireAuth: true })
export const PATCH = withMiddleware(handleUpdateSession, { requireAuth: true })
