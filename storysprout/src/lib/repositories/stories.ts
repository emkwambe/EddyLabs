/**
 * Stories Repository
 *
 * Data access layer for stories with specialized queries
 */

import { BaseRepository, QueryOptions, RepositoryResult, PaginatedResult } from './base'
import { AgeBand, StoryCategory, Continent, GlobalRegion } from '@/lib/storysprout/types'

// =====================================================
// TYPES
// =====================================================

export interface Story {
  id: string
  title: string
  content: string
  summary?: string
  age_band: AgeBand
  category: StoryCategory
  word_count: number
  estimated_reading_time_seconds: number
  reading_level_score?: number
  generation_status: 'pending' | 'generating' | 'completed' | 'failed'
  generation_prompt?: string
  ai_model?: string
  safety_status: 'pending' | 'approved' | 'flagged' | 'rejected'
  safety_review_notes?: string
  cover_image_url?: string
  audio_url?: string
  audio_duration_seconds?: number
  tags: string[]
  is_featured: boolean
  is_published: boolean
  child_id?: string
  custom_character_name?: string
  organization_id?: string
  is_org_private: boolean
  continent?: Continent
  region?: GlobalRegion
  country_code?: string
  cultural_elements?: string[]
  created_at: string
  updated_at: string
  published_at?: string
}

export interface StoryFilters {
  ageBand?: AgeBand
  category?: StoryCategory
  isPublished?: boolean
  isFeatured?: boolean
  childId?: string
  organizationId?: string
  continent?: Continent
  countryCode?: string
  safetyStatus?: Story['safety_status']
  searchQuery?: string
}

export interface StoryWithReadingProgress extends Story {
  reading_progress?: {
    current_position: number
    is_completed: boolean
    last_read_at: string
  }
}

// =====================================================
// REPOSITORY
// =====================================================

export class StoriesRepository extends BaseRepository<Story> {
  constructor() {
    super('stories')
  }

  /**
   * Find stories with filters
   */
  async findWithFilters(
    filters: StoryFilters,
    options: QueryOptions = {}
  ): Promise<RepositoryResult<PaginatedResult<Story>>> {
    try {
      const client = await this.getClient()
      const page = options.page || 1
      const limit = options.limit || 20
      const offset = (page - 1) * limit

      let query = client
        .from(this.tableName)
        .select('*', { count: 'exact' })

      // Apply filters
      if (filters.ageBand) query = query.eq('age_band', filters.ageBand)
      if (filters.category) query = query.eq('category', filters.category)
      if (filters.isPublished !== undefined) query = query.eq('is_published', filters.isPublished)
      if (filters.isFeatured !== undefined) query = query.eq('is_featured', filters.isFeatured)
      if (filters.childId) query = query.eq('child_id', filters.childId)
      if (filters.organizationId) query = query.eq('organization_id', filters.organizationId)
      if (filters.continent) query = query.eq('continent', filters.continent)
      if (filters.countryCode) query = query.eq('country_code', filters.countryCode)
      if (filters.safetyStatus) query = query.eq('safety_status', filters.safetyStatus)

      // Text search
      if (filters.searchQuery) {
        query = query.or(`title.ilike.%${filters.searchQuery}%,summary.ilike.%${filters.searchQuery}%`)
      }

      // Ordering
      const orderBy = options.orderBy || 'created_at'
      const orderDirection = options.orderDirection || 'desc'
      query = query.order(orderBy, { ascending: orderDirection === 'asc' })

      // Pagination
      query = query.range(offset, offset + limit - 1)

      const { data, error, count } = await query

      if (error) {
        return {
          success: false,
          error: { code: 'QUERY_ERROR', message: error.message, details: error },
        }
      }

      const total = count || 0
      return {
        success: true,
        data: {
          data: (data || []) as Story[],
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
          hasMore: page < Math.ceil(total / limit),
        },
      }
    } catch (error) {
      return {
        success: false,
        error: { code: 'UNKNOWN_ERROR', message: String(error) },
      }
    }
  }

  /**
   * Get published stories for a specific age band
   */
  async findPublishedByAgeBand(
    ageBand: AgeBand,
    options: QueryOptions = {}
  ): Promise<RepositoryResult<PaginatedResult<Story>>> {
    return this.findWithFilters({ ageBand, isPublished: true }, options)
  }

  /**
   * Get featured stories
   */
  async findFeatured(
    limit: number = 10
  ): Promise<RepositoryResult<Story[]>> {
    try {
      const client = await this.getClient()
      const { data, error } = await client
        .from(this.tableName)
        .select('*')
        .eq('is_published', true)
        .eq('is_featured', true)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        return {
          success: false,
          error: { code: 'QUERY_ERROR', message: error.message, details: error },
        }
      }

      return { success: true, data: (data || []) as Story[] }
    } catch (error) {
      return {
        success: false,
        error: { code: 'UNKNOWN_ERROR', message: String(error) },
      }
    }
  }

  /**
   * Get stories for a child with reading progress
   */
  async findForChildWithProgress(
    childId: string,
    options: QueryOptions = {}
  ): Promise<RepositoryResult<PaginatedResult<StoryWithReadingProgress>>> {
    try {
      const client = await this.getClient()
      const page = options.page || 1
      const limit = options.limit || 20
      const offset = (page - 1) * limit

      const { data, error, count } = await client
        .from(this.tableName)
        .select(`
          *,
          reading_progress!left(
            current_position,
            is_completed,
            last_read_at
          )
        `, { count: 'exact' })
        .eq('child_id', childId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) {
        return {
          success: false,
          error: { code: 'QUERY_ERROR', message: error.message, details: error },
        }
      }

      const total = count || 0
      return {
        success: true,
        data: {
          data: (data || []).map(s => ({
            ...s,
            reading_progress: s.reading_progress?.[0],
          })) as StoryWithReadingProgress[],
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
          hasMore: page < Math.ceil(total / limit),
        },
      }
    } catch (error) {
      return {
        success: false,
        error: { code: 'UNKNOWN_ERROR', message: String(error) },
      }
    }
  }

  /**
   * Get stories by country/culture
   */
  async findByCulture(
    continent?: Continent,
    countryCode?: string,
    options: QueryOptions = {}
  ): Promise<RepositoryResult<PaginatedResult<Story>>> {
    return this.findWithFilters(
      { continent, countryCode, isPublished: true },
      options
    )
  }

  /**
   * Update story safety status
   */
  async updateSafetyStatus(
    id: string,
    status: Story['safety_status'],
    reviewNotes?: string
  ): Promise<RepositoryResult<Story>> {
    return this.update(id, {
      safety_status: status,
      safety_review_notes: reviewNotes,
    } as Partial<Story>)
  }

  /**
   * Publish story
   */
  async publish(id: string): Promise<RepositoryResult<Story>> {
    return this.update(id, {
      is_published: true,
      published_at: new Date().toISOString(),
    } as Partial<Story>)
  }

  /**
   * Unpublish story
   */
  async unpublish(id: string): Promise<RepositoryResult<Story>> {
    return this.update(id, {
      is_published: false,
    } as Partial<Story>)
  }

  /**
   * Get category statistics
   */
  async getCategoryStats(): Promise<RepositoryResult<Record<StoryCategory, number>>> {
    try {
      const client = await this.getClient()
      const { data, error } = await client
        .from(this.tableName)
        .select('category')
        .eq('is_published', true)

      if (error) {
        return {
          success: false,
          error: { code: 'QUERY_ERROR', message: error.message, details: error },
        }
      }

      const stats: Record<string, number> = {}
      data?.forEach(s => {
        stats[s.category] = (stats[s.category] || 0) + 1
      })

      return { success: true, data: stats as Record<StoryCategory, number> }
    } catch (error) {
      return {
        success: false,
        error: { code: 'UNKNOWN_ERROR', message: String(error) },
      }
    }
  }
}

// Singleton instance
let storiesRepository: StoriesRepository | null = null

export function getStoriesRepository(): StoriesRepository {
  if (!storiesRepository) {
    storiesRepository = new StoriesRepository()
  }
  return storiesRepository
}
