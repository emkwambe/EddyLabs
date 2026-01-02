import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { AgeBand, StoryCategory } from '@/lib/storysprout/types'

// GET /api/storysprout/stories - Get stories with optional filters
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const ageBand = searchParams.get('age_band') as AgeBand | null
    const category = searchParams.get('category') as StoryCategory | null
    const featured = searchParams.get('featured')
    const storyPathId = searchParams.get('story_path_id')
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = supabase
      .from('stories')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (ageBand) {
      query = query.eq('age_band', ageBand)
    }

    if (category) {
      query = query.eq('category', category)
    }

    if (featured === 'true') {
      query = query.eq('is_featured', true)
    }

    if (storyPathId) {
      query = query.eq('story_path_id', storyPathId)
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,themes.cs.{${search}}`)
    }

    const { data, error, count } = await query

    if (error) {
      console.error('Error fetching stories:', error)
      return NextResponse.json({ error: 'Failed to fetch stories' }, { status: 500 })
    }

    return NextResponse.json({
      data,
      count,
      limit,
      offset,
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
