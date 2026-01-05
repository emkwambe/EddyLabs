/**
 * Base Repository
 *
 * Abstract base class for all repositories providing common CRUD operations
 * and error handling patterns.
 */

import { SupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'

// =====================================================
// TYPES
// =====================================================

export interface QueryOptions {
  page?: number
  limit?: number
  orderBy?: string
  orderDirection?: 'asc' | 'desc'
  filters?: Record<string, unknown>
}

export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
  hasMore: boolean
}

export interface RepositoryResult<T> {
  success: boolean
  data?: T
  error?: RepositoryError
}

export interface RepositoryError {
  code: string
  message: string
  details?: unknown
}

// =====================================================
// BASE REPOSITORY
// =====================================================

export abstract class BaseRepository<T extends { id: string }> {
  protected tableName: string
  protected client: SupabaseClient | null = null

  constructor(tableName: string) {
    this.tableName = tableName
  }

  /**
   * Get Supabase client (lazy initialization)
   */
  protected async getClient(): Promise<SupabaseClient> {
    if (!this.client) {
      this.client = await createClient()
    }
    return this.client
  }

  /**
   * Find by ID
   */
  async findById(id: string): Promise<RepositoryResult<T>> {
    try {
      const client = await this.getClient()
      const { data, error } = await client
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return {
            success: false,
            error: { code: 'NOT_FOUND', message: `${this.tableName} not found` },
          }
        }
        return {
          success: false,
          error: { code: 'QUERY_ERROR', message: error.message, details: error },
        }
      }

      return { success: true, data: data as T }
    } catch (error) {
      return {
        success: false,
        error: { code: 'UNKNOWN_ERROR', message: String(error) },
      }
    }
  }

  /**
   * Find all with pagination
   */
  async findAll(options: QueryOptions = {}): Promise<RepositoryResult<PaginatedResult<T>>> {
    try {
      const client = await this.getClient()
      const page = options.page || 1
      const limit = options.limit || 20
      const offset = (page - 1) * limit

      let query = client
        .from(this.tableName)
        .select('*', { count: 'exact' })

      // Apply filters
      if (options.filters) {
        for (const [key, value] of Object.entries(options.filters)) {
          if (value !== undefined && value !== null) {
            query = query.eq(key, value)
          }
        }
      }

      // Apply ordering
      if (options.orderBy) {
        query = query.order(options.orderBy, {
          ascending: options.orderDirection !== 'desc',
        })
      }

      // Apply pagination
      query = query.range(offset, offset + limit - 1)

      const { data, error, count } = await query

      if (error) {
        return {
          success: false,
          error: { code: 'QUERY_ERROR', message: error.message, details: error },
        }
      }

      const total = count || 0
      const totalPages = Math.ceil(total / limit)

      return {
        success: true,
        data: {
          data: (data || []) as T[],
          total,
          page,
          limit,
          totalPages,
          hasMore: page < totalPages,
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
   * Create new record
   */
  async create(data: Omit<T, 'id' | 'created_at' | 'updated_at'>): Promise<RepositoryResult<T>> {
    try {
      const client = await this.getClient()
      const { data: created, error } = await client
        .from(this.tableName)
        .insert(data)
        .select()
        .single()

      if (error) {
        return {
          success: false,
          error: { code: 'CREATE_ERROR', message: error.message, details: error },
        }
      }

      return { success: true, data: created as T }
    } catch (error) {
      return {
        success: false,
        error: { code: 'UNKNOWN_ERROR', message: String(error) },
      }
    }
  }

  /**
   * Update record
   */
  async update(id: string, data: Partial<T>): Promise<RepositoryResult<T>> {
    try {
      const client = await this.getClient()
      const { data: updated, error } = await client
        .from(this.tableName)
        .update(data)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        return {
          success: false,
          error: { code: 'UPDATE_ERROR', message: error.message, details: error },
        }
      }

      return { success: true, data: updated as T }
    } catch (error) {
      return {
        success: false,
        error: { code: 'UNKNOWN_ERROR', message: String(error) },
      }
    }
  }

  /**
   * Delete record
   */
  async delete(id: string): Promise<RepositoryResult<void>> {
    try {
      const client = await this.getClient()
      const { error } = await client
        .from(this.tableName)
        .delete()
        .eq('id', id)

      if (error) {
        return {
          success: false,
          error: { code: 'DELETE_ERROR', message: error.message, details: error },
        }
      }

      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: { code: 'UNKNOWN_ERROR', message: String(error) },
      }
    }
  }

  /**
   * Count records
   */
  async count(filters?: Record<string, unknown>): Promise<RepositoryResult<number>> {
    try {
      const client = await this.getClient()
      let query = client
        .from(this.tableName)
        .select('*', { count: 'exact', head: true })

      if (filters) {
        for (const [key, value] of Object.entries(filters)) {
          if (value !== undefined && value !== null) {
            query = query.eq(key, value)
          }
        }
      }

      const { count, error } = await query

      if (error) {
        return {
          success: false,
          error: { code: 'QUERY_ERROR', message: error.message, details: error },
        }
      }

      return { success: true, data: count || 0 }
    } catch (error) {
      return {
        success: false,
        error: { code: 'UNKNOWN_ERROR', message: String(error) },
      }
    }
  }

  /**
   * Check if record exists
   */
  async exists(id: string): Promise<boolean> {
    const result = await this.findById(id)
    return result.success
  }
}
