import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/storysprout/children - Get all children for the current user
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('child_profiles')
      .select('*')
      .eq('parent_user_id', user.id)
      .order('created_at')

    if (error) {
      console.error('Error fetching children:', error)
      return NextResponse.json({ error: 'Failed to fetch children' }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/storysprout/children - Create a new child profile
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      avatar_url,
      birth_date,
      age_band,
      reading_level,
      preferred_reading_mode,
    } = body

    if (!name || !age_band) {
      return NextResponse.json({ error: 'name and age_band are required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('child_profiles')
      .insert({
        parent_user_id: user.id,
        name,
        avatar_url,
        birth_date,
        age_band,
        reading_level,
        preferred_reading_mode: preferred_reading_mode || 'read_with_me',
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating child:', error)
      return NextResponse.json({ error: 'Failed to create child profile' }, { status: 500 })
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
