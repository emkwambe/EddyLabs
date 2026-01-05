/**
 * Child Profiles Repository
 *
 * Data access layer for child profiles with reading progress tracking
 */

import { BaseRepository, QueryOptions, RepositoryResult, PaginatedResult } from './base'
import { AgeBand } from '@/lib/storysprout/types'

// =====================================================
// TYPES
// =====================================================

export interface ChildProfile {
  id: string
  parent_id: string
  organization_id?: string
  school_id?: string
  classroom_id?: string
  name: string
  age_band: AgeBand
  birth_date?: string
  avatar_url?: string
  reading_level: string
  interests: string[]
  accessibility_needs: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface ChildWithStats extends ChildProfile {
  stories_completed: number
  total_reading_minutes: number
  current_streak: number
}

export interface ReadingProgress {
  id: string
  child_id: string
  story_id: string
  current_position: number
  total_time_seconds: number
  is_completed: boolean
  completed_at?: string
  last_read_at: string
  created_at: string
}

// =====================================================
// REPOSITORY
// =====================================================

export class ChildProfilesRepository extends BaseRepository<ChildProfile> {
  constructor() {
    super('child_profiles')
  }

  /**
   * Find children by parent
   */
  async findByParent(
    parentId: string,
    options: QueryOptions = {}
  ): Promise<RepositoryResult<PaginatedResult<ChildProfile>>> {
    return this.findAll({
      ...options,
      filters: { parent_id: parentId },
      orderBy: options.orderBy || 'created_at',
    })
  }

  /**
   * Find children by organization
   */
  async findByOrganization(
    organizationId: string,
    options: QueryOptions = {}
  ): Promise<RepositoryResult<PaginatedResult<ChildProfile>>> {
    return this.findAll({
      ...options,
      filters: { organization_id: organizationId },
    })
  }

  /**
   * Find children by classroom
   */
  async findByClassroom(
    classroomId: string,
    options: QueryOptions = {}
  ): Promise<RepositoryResult<PaginatedResult<ChildProfile>>> {
    return this.findAll({
      ...options,
      filters: { classroom_id: classroomId },
    })
  }

  /**
   * Get child with reading statistics
   */
  async findWithStats(childId: string): Promise<RepositoryResult<ChildWithStats>> {
    try {
      const client = await this.getClient()

      // Get child profile
      const { data: child, error: childError } = await client
        .from(this.tableName)
        .select('*')
        .eq('id', childId)
        .single()

      if (childError || !child) {
        return {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Child profile not found' },
        }
      }

      // Get reading stats
      const { data: progressData } = await client
        .from('reading_progress')
        .select('is_completed')
        .eq('child_id', childId)

      const { data: sessionsData } = await client
        .from('reading_sessions')
        .select('duration_seconds, started_at')
        .eq('child_id', childId)

      const storiesCompleted = progressData?.filter(p => p.is_completed).length || 0
      const totalReadingSeconds = sessionsData?.reduce((sum, s) => sum + (s.duration_seconds || 0), 0) || 0

      // Calculate streak (simplified)
      const currentStreak = this.calculateStreak(sessionsData || [])

      return {
        success: true,
        data: {
          ...child,
          stories_completed: storiesCompleted,
          total_reading_minutes: Math.round(totalReadingSeconds / 60),
          current_streak: currentStreak,
        } as ChildWithStats,
      }
    } catch (error) {
      return {
        success: false,
        error: { code: 'UNKNOWN_ERROR', message: String(error) },
      }
    }
  }

  /**
   * Update child's reading level
   */
  async updateReadingLevel(
    childId: string,
    readingLevel: string
  ): Promise<RepositoryResult<ChildProfile>> {
    return this.update(childId, { reading_level: readingLevel } as Partial<ChildProfile>)
  }

  /**
   * Update child's interests
   */
  async updateInterests(
    childId: string,
    interests: string[]
  ): Promise<RepositoryResult<ChildProfile>> {
    return this.update(childId, { interests } as Partial<ChildProfile>)
  }

  /**
   * Get reading progress for a child
   */
  async getReadingProgress(
    childId: string,
    storyId?: string
  ): Promise<RepositoryResult<ReadingProgress[]>> {
    try {
      const client = await this.getClient()

      let query = client
        .from('reading_progress')
        .select('*')
        .eq('child_id', childId)

      if (storyId) {
        query = query.eq('story_id', storyId)
      }

      query = query.order('last_read_at', { ascending: false })

      const { data, error } = await query

      if (error) {
        return {
          success: false,
          error: { code: 'QUERY_ERROR', message: error.message, details: error },
        }
      }

      return { success: true, data: (data || []) as ReadingProgress[] }
    } catch (error) {
      return {
        success: false,
        error: { code: 'UNKNOWN_ERROR', message: String(error) },
      }
    }
  }

  /**
   * Update or create reading progress
   */
  async upsertReadingProgress(
    childId: string,
    storyId: string,
    progress: Partial<ReadingProgress>
  ): Promise<RepositoryResult<ReadingProgress>> {
    try {
      const client = await this.getClient()

      const { data, error } = await client
        .from('reading_progress')
        .upsert({
          child_id: childId,
          story_id: storyId,
          ...progress,
          last_read_at: new Date().toISOString(),
        }, {
          onConflict: 'child_id,story_id',
        })
        .select()
        .single()

      if (error) {
        return {
          success: false,
          error: { code: 'UPSERT_ERROR', message: error.message, details: error },
        }
      }

      return { success: true, data: data as ReadingProgress }
    } catch (error) {
      return {
        success: false,
        error: { code: 'UNKNOWN_ERROR', message: String(error) },
      }
    }
  }

  /**
   * Get children who haven't read in X days
   */
  async findInactiveChildren(
    parentId: string,
    inactiveDays: number = 7
  ): Promise<RepositoryResult<ChildProfile[]>> {
    try {
      const client = await this.getClient()

      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - inactiveDays)

      // Get all children for parent
      const { data: children, error: childError } = await client
        .from(this.tableName)
        .select('*')
        .eq('parent_id', parentId)

      if (childError) {
        return {
          success: false,
          error: { code: 'QUERY_ERROR', message: childError.message },
        }
      }

      // Get recent reading activity
      const { data: recentActivity } = await client
        .from('reading_sessions')
        .select('child_id')
        .in('child_id', children?.map(c => c.id) || [])
        .gte('started_at', cutoffDate.toISOString())

      const activeChildIds = new Set(recentActivity?.map(a => a.child_id) || [])
      const inactiveChildren = (children || []).filter(c => !activeChildIds.has(c.id))

      return { success: true, data: inactiveChildren as ChildProfile[] }
    } catch (error) {
      return {
        success: false,
        error: { code: 'UNKNOWN_ERROR', message: String(error) },
      }
    }
  }

  /**
   * Calculate reading streak
   */
  private calculateStreak(sessions: { started_at: string }[]): number {
    if (sessions.length === 0) return 0

    const readingDates = [...new Set(
      sessions.map(s => new Date(s.started_at).toISOString().split('T')[0])
    )].sort((a, b) => b.localeCompare(a))

    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

    if (readingDates[0] !== today && readingDates[0] !== yesterday) {
      return 0
    }

    let streak = 1
    for (let i = 1; i < readingDates.length; i++) {
      const prevDate = new Date(readingDates[i - 1])
      const currDate = new Date(readingDates[i])
      const dayDiff = (prevDate.getTime() - currDate.getTime()) / 86400000

      if (dayDiff === 1) {
        streak++
      } else {
        break
      }
    }

    return streak
  }
}

// Singleton instance
let childProfilesRepository: ChildProfilesRepository | null = null

export function getChildProfilesRepository(): ChildProfilesRepository {
  if (!childProfilesRepository) {
    childProfilesRepository = new ChildProfilesRepository()
  }
  return childProfilesRepository
}
