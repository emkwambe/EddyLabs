/**
 * GET /api/children/[id]/progress
 *
 * Get reading progress and stats for a child
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

interface StoryProgress {
  storyId: string
  storyTitle: string
  category: string
  currentPosition: number
  totalPages: number
  totalTimeSeconds: number
  isCompleted: boolean
  completedAt?: string
  lastReadAt: string
}

interface ReadingStreak {
  currentStreak: number
  longestStreak: number
  lastReadDate?: string
}

interface CategoryStats {
  category: string
  storiesRead: number
  totalTimeSeconds: number
}

interface Achievement {
  id: string
  name: string
  description: string
  iconUrl?: string
  badgeColor: string
  earnedAt: string
}

interface ChildProgress {
  childId: string
  childName: string
  ageBand: string

  // Overall stats
  totalStoriesStarted: number
  totalStoriesCompleted: number
  totalReadingTimeSeconds: number
  totalWordsRead: number

  // Reading level
  currentReadingLevel: string
  readingLevelProgress: number

  // Streaks
  streak: ReadingStreak

  // Recent activity
  recentStories: StoryProgress[]

  // Categories
  categoryStats: CategoryStats[]

  // Achievements
  achievements: Achievement[]

  // Cultural exploration
  countriesExplored: string[]
  continentsExplored: string[]
}

// =====================================================
// HANDLER
// =====================================================

async function handleGetProgress(
  req: NextRequest,
  context: ApiContext
): Promise<NextResponse<ApiResponse<ChildProgress>>> {
  const { requestId, user } = context

  if (!user) {
    return errorResponse(
      'UNAUTHORIZED',
      'Authentication required',
      requestId,
      401
    ) as NextResponse<ApiResponse<ChildProgress>>
  }

  // Extract child ID from URL
  const url = new URL(req.url)
  const pathParts = url.pathname.split('/')
  const childIdIndex = pathParts.findIndex(p => p === 'children') + 1
  const childId = pathParts[childIdIndex]

  if (!childId || childId === '[id]') {
    return errorResponse(
      'INVALID_ID',
      'Child ID is required',
      requestId,
      400
    ) as NextResponse<ApiResponse<ChildProgress>>
  }

  const supabase = await createClient()

  // Fetch child profile and verify ownership
  const { data: childProfile, error: childError } = await supabase
    .from('child_profiles')
    .select('*, parent_accounts!inner(user_id)')
    .eq('id', childId)
    .single()

  if (childError || !childProfile) {
    return errorResponse(
      'NOT_FOUND',
      'Child profile not found',
      requestId,
      404
    ) as NextResponse<ApiResponse<ChildProgress>>
  }

  if (childProfile.parent_accounts.user_id !== user.id) {
    return errorResponse(
      'FORBIDDEN',
      'Access denied to this child profile',
      requestId,
      403
    ) as NextResponse<ApiResponse<ChildProgress>>
  }

  // Fetch reading progress
  const { data: progressData } = await supabase
    .from('reading_progress')
    .select('*, stories!inner(title, category, content, country_code, continent)')
    .eq('child_id', childId)
    .order('last_read_at', { ascending: false })

  // Fetch reading sessions for totals
  const { data: sessions } = await supabase
    .from('reading_sessions')
    .select('duration_seconds, words_read, started_at')
    .eq('child_id', childId)
    .order('started_at', { ascending: false })

  // Fetch achievements
  const { data: achievementsData } = await supabase
    .from('child_achievements')
    .select('*, achievements!inner(*)')
    .eq('child_id', childId)

  // Calculate stats
  const totalStoriesStarted = progressData?.length || 0
  const totalStoriesCompleted = progressData?.filter(p => p.is_completed).length || 0
  const totalReadingTimeSeconds = sessions?.reduce((sum, s) => sum + (s.duration_seconds || 0), 0) || 0
  const totalWordsRead = sessions?.reduce((sum, s) => sum + (s.words_read || 0), 0) || 0

  // Calculate streak
  const streak = calculateStreak(sessions || [])

  // Get recent stories (last 5)
  const recentStories: StoryProgress[] = (progressData || []).slice(0, 5).map(p => {
    let totalPages = 1
    try {
      const content = typeof p.stories.content === 'string'
        ? JSON.parse(p.stories.content)
        : p.stories.content
      totalPages = Array.isArray(content) ? content.length : 1
    } catch {
      totalPages = 1
    }

    return {
      storyId: p.story_id,
      storyTitle: p.stories.title,
      category: p.stories.category,
      currentPosition: p.current_position || 1,
      totalPages,
      totalTimeSeconds: p.total_time_seconds || 0,
      isCompleted: p.is_completed,
      completedAt: p.completed_at,
      lastReadAt: p.last_read_at,
    }
  })

  // Calculate category stats
  const categoryMap = new Map<string, { count: number; time: number }>()
  progressData?.forEach(p => {
    const cat = p.stories.category
    const existing = categoryMap.get(cat) || { count: 0, time: 0 }
    existing.count++
    existing.time += p.total_time_seconds || 0
    categoryMap.set(cat, existing)
  })

  const categoryStats: CategoryStats[] = Array.from(categoryMap.entries()).map(([category, stats]) => ({
    category,
    storiesRead: stats.count,
    totalTimeSeconds: stats.time,
  }))

  // Format achievements
  const achievements: Achievement[] = (achievementsData || []).map(a => ({
    id: a.achievements.id,
    name: a.achievements.name,
    description: a.achievements.description,
    iconUrl: a.achievements.icon_url,
    badgeColor: a.achievements.badge_color,
    earnedAt: a.earned_at,
  }))

  // Get countries and continents explored
  const countriesExplored = [...new Set(
    progressData?.filter(p => p.stories.country_code).map(p => p.stories.country_code) || []
  )]
  const continentsExplored = [...new Set(
    progressData?.filter(p => p.stories.continent).map(p => p.stories.continent) || []
  )]

  // Calculate reading level progress (simplified)
  const readingLevelProgress = Math.min(100, Math.round((totalStoriesCompleted / 10) * 100))

  const progress: ChildProgress = {
    childId,
    childName: childProfile.name,
    ageBand: childProfile.age_band,
    totalStoriesStarted,
    totalStoriesCompleted,
    totalReadingTimeSeconds,
    totalWordsRead,
    currentReadingLevel: childProfile.reading_level || 'beginner',
    readingLevelProgress,
    streak,
    recentStories,
    categoryStats,
    achievements,
    countriesExplored,
    continentsExplored,
  }

  return successResponse(progress, requestId)
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

function calculateStreak(sessions: { started_at: string }[]): ReadingStreak {
  if (sessions.length === 0) {
    return { currentStreak: 0, longestStreak: 0 }
  }

  // Get unique reading dates
  const readingDates = [...new Set(
    sessions.map(s => new Date(s.started_at).toISOString().split('T')[0])
  )].sort((a, b) => b.localeCompare(a)) // Sort descending

  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

  let currentStreak = 0
  let longestStreak = 0
  let tempStreak = 0
  let lastDate: string | null = null

  // Calculate streaks
  for (const date of readingDates) {
    if (!lastDate) {
      // First date - check if it's today or yesterday
      if (date === today || date === yesterday) {
        tempStreak = 1
        currentStreak = 1
      }
      lastDate = date
      continue
    }

    const dayDiff = Math.abs(
      (new Date(lastDate).getTime() - new Date(date).getTime()) / 86400000
    )

    if (dayDiff === 1) {
      tempStreak++
      if (currentStreak > 0) {
        currentStreak = tempStreak
      }
    } else {
      longestStreak = Math.max(longestStreak, tempStreak)
      tempStreak = 1
      if (currentStreak > 0 && date !== today && date !== yesterday) {
        currentStreak = 0
      }
    }

    lastDate = date
  }

  longestStreak = Math.max(longestStreak, tempStreak)

  return {
    currentStreak,
    longestStreak,
    lastReadDate: readingDates[0],
  }
}

// =====================================================
// EXPORT
// =====================================================

export const GET = withMiddleware(handleGetProgress, { requireAuth: true })
