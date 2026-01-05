/**
 * GET /api/stories/[id]
 *
 * Get a story by ID
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  withMiddleware,
  successResponse,
  errorResponse,
  ApiContext,
  ApiResponse,
} from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'

// =====================================================
// TYPES
// =====================================================

interface StoryPage {
  pageNumber: number
  textContent: string
  illustrationPrompt: string
  vocabularyWords?: string[]
  readingTimeSeconds?: number
}

interface StoryDetails {
  id: string
  title: string
  summary: string
  description?: string
  pages: StoryPage[]
  ageBand: string
  category: string
  wordCount: number
  estimatedReadingTimeSeconds: number
  readingLevelScore: number
  coverImageUrl?: string
  audioUrl?: string
  audioDurationSeconds?: number
  continent?: string
  region?: string
  countryCode?: string
  culturalElements?: string[]
  isPublished: boolean
  isFeatured: boolean
  createdAt: string
}

// =====================================================
// HANDLER
// =====================================================

async function handleGetStory(
  req: NextRequest,
  context: ApiContext
): Promise<NextResponse<ApiResponse<StoryDetails>>> {
  const { requestId, user } = context

  // Extract ID from URL
  const url = new URL(req.url)
  const pathParts = url.pathname.split('/')
  const storyId = pathParts[pathParts.length - 1]

  if (!storyId || storyId === '[id]') {
    return errorResponse(
      'INVALID_ID',
      'Story ID is required',
      requestId,
      400
    ) as NextResponse<ApiResponse<StoryDetails>>
  }

  // Fetch story from database
  const supabase = await createClient()

  const { data: story, error } = await supabase
    .from('stories')
    .select('*')
    .eq('id', storyId)
    .single()

  if (error || !story) {
    return errorResponse(
      'NOT_FOUND',
      'Story not found',
      requestId,
      404
    ) as NextResponse<ApiResponse<StoryDetails>>
  }

  // Check access permissions
  // Published stories are public, unpublished require ownership
  if (!story.is_published) {
    if (!user) {
      return errorResponse(
        'UNAUTHORIZED',
        'Authentication required to view unpublished stories',
        requestId,
        401
      ) as NextResponse<ApiResponse<StoryDetails>>
    }

    // Check if user owns the story (through child profile)
    if (story.child_id) {
      const { data: childProfile } = await supabase
        .from('child_profiles')
        .select('parent_id')
        .eq('id', story.child_id)
        .single()

      if (childProfile) {
        const { data: parentAccount } = await supabase
          .from('parent_accounts')
          .select('user_id')
          .eq('id', childProfile.parent_id)
          .single()

        if (parentAccount?.user_id !== user.id) {
          return errorResponse(
            'FORBIDDEN',
            'Access denied to this story',
            requestId,
            403
          ) as NextResponse<ApiResponse<StoryDetails>>
        }
      }
    }
  }

  // Parse content (stored as JSON)
  let pages: StoryPage[] = []
  try {
    if (typeof story.content === 'string') {
      pages = JSON.parse(story.content)
    } else if (Array.isArray(story.content)) {
      pages = story.content
    }
  } catch {
    // If parsing fails, treat content as single page
    pages = [{
      pageNumber: 1,
      textContent: String(story.content),
      illustrationPrompt: '',
    }]
  }

  const storyDetails: StoryDetails = {
    id: story.id,
    title: story.title,
    summary: story.summary || '',
    description: story.description,
    pages,
    ageBand: story.age_band,
    category: story.category,
    wordCount: story.word_count || 0,
    estimatedReadingTimeSeconds: story.estimated_reading_time_seconds || 0,
    readingLevelScore: story.reading_level_score || 0,
    coverImageUrl: story.cover_image_url,
    audioUrl: story.audio_url,
    audioDurationSeconds: story.audio_duration_seconds,
    continent: story.continent,
    region: story.region,
    countryCode: story.country_code,
    culturalElements: story.cultural_elements,
    isPublished: story.is_published,
    isFeatured: story.is_featured,
    createdAt: story.created_at,
  }

  return successResponse(storyDetails, requestId)
}

// =====================================================
// EXPORT
// =====================================================

export const GET = withMiddleware(handleGetStory, {
  requireAuth: false, // Published stories are public
})
