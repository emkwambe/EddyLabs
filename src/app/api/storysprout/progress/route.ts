import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/storysprout/progress - Get reading progress for a child
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const childId = searchParams.get('child_id')
    const storyId = searchParams.get('story_id')

    if (!childId) {
      return NextResponse.json({ error: 'child_id is required' }, { status: 400 })
    }

    // Verify child belongs to user
    const { data: child, error: childError } = await supabase
      .from('child_profiles')
      .select('id')
      .eq('id', childId)
      .eq('parent_user_id', user.id)
      .single()

    if (childError || !child) {
      return NextResponse.json({ error: 'Child not found' }, { status: 404 })
    }

    let query = supabase
      .from('reading_progress')
      .select('*, stories(*)')
      .eq('child_profile_id', childId)
      .order('last_read_at', { ascending: false })

    if (storyId) {
      query = query.eq('story_id', storyId)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching progress:', error)
      return NextResponse.json({ error: 'Failed to fetch progress' }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/storysprout/progress - Create or update reading progress
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { child_id, story_id, current_page, reading_mode, is_completed } = body

    if (!child_id || !story_id) {
      return NextResponse.json({ error: 'child_id and story_id are required' }, { status: 400 })
    }

    // Verify child belongs to user
    const { data: child, error: childError } = await supabase
      .from('child_profiles')
      .select('id')
      .eq('id', child_id)
      .eq('parent_user_id', user.id)
      .single()

    if (childError || !child) {
      return NextResponse.json({ error: 'Child not found' }, { status: 404 })
    }

    // Get story info
    const { data: story } = await supabase
      .from('stories')
      .select('page_count')
      .eq('id', story_id)
      .single()

    // Check for existing progress
    const { data: existing } = await supabase
      .from('reading_progress')
      .select('*')
      .eq('child_profile_id', child_id)
      .eq('story_id', story_id)
      .single()

    if (existing) {
      // Update existing progress
      const updates: any = {
        last_read_at: new Date().toISOString(),
      }

      if (current_page !== undefined) {
        updates.current_page = current_page
      }

      if (reading_mode !== undefined) {
        updates.reading_mode_used = reading_mode
      }

      if (is_completed !== undefined) {
        updates.is_completed = is_completed
        if (is_completed) {
          updates.completed_at = new Date().toISOString()
          updates.read_count = (existing.read_count || 1) + 1
        }
      }

      const { data, error } = await supabase
        .from('reading_progress')
        .update(updates)
        .eq('id', existing.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating progress:', error)
        return NextResponse.json({ error: 'Failed to update progress' }, { status: 500 })
      }

      return NextResponse.json({ data })
    } else {
      // Create new progress
      const { data, error } = await supabase
        .from('reading_progress')
        .insert({
          child_profile_id: child_id,
          story_id,
          current_page: current_page || 1,
          total_pages: story?.page_count || 1,
          reading_mode_used: reading_mode,
          is_completed: is_completed || false,
          completed_at: is_completed ? new Date().toISOString() : null,
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating progress:', error)
        return NextResponse.json({ error: 'Failed to create progress' }, { status: 500 })
      }

      return NextResponse.json({ data }, { status: 201 })
    }
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
