import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/storysprout/sight-words - Get sight word exposures for a child
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const childId = searchParams.get('child_id')

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

    const { data, error } = await supabase
      .from('sight_word_exposures')
      .select('*')
      .eq('child_profile_id', childId)
      .order('exposure_count', { ascending: false })

    if (error) {
      console.error('Error fetching sight words:', error)
      return NextResponse.json({ error: 'Failed to fetch sight words' }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/storysprout/sight-words - Record sight word exposure
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { child_id, words } = body

    if (!child_id || !words || !Array.isArray(words)) {
      return NextResponse.json({ error: 'child_id and words array are required' }, { status: 400 })
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

    // Process each word
    const results = []
    for (const word of words) {
      const normalizedWord = word.toLowerCase().trim()

      // Check for existing exposure
      const { data: existing } = await supabase
        .from('sight_word_exposures')
        .select('*')
        .eq('child_profile_id', child_id)
        .eq('word', normalizedWord)
        .single()

      if (existing) {
        // Update existing exposure
        const { data, error } = await supabase
          .from('sight_word_exposures')
          .update({
            exposure_count: existing.exposure_count + 1,
            last_seen_at: new Date().toISOString(),
          })
          .eq('id', existing.id)
          .select()
          .single()

        if (!error && data) {
          results.push(data)
        }
      } else {
        // Create new exposure
        const { data, error } = await supabase
          .from('sight_word_exposures')
          .insert({
            child_profile_id: child_id,
            word: normalizedWord,
            exposure_count: 1,
            first_seen_at: new Date().toISOString(),
            last_seen_at: new Date().toISOString(),
          })
          .select()
          .single()

        if (!error && data) {
          results.push(data)
        }
      }
    }

    return NextResponse.json({ data: results })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/storysprout/sight-words - Mark word as mastered
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { child_id, word, is_mastered } = body

    if (!child_id || !word) {
      return NextResponse.json({ error: 'child_id and word are required' }, { status: 400 })
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

    const normalizedWord = word.toLowerCase().trim()

    const { data, error } = await supabase
      .from('sight_word_exposures')
      .update({
        is_mastered: is_mastered ?? true,
        mastered_at: is_mastered ? new Date().toISOString() : null,
      })
      .eq('child_profile_id', child_id)
      .eq('word', normalizedWord)
      .select()
      .single()

    if (error) {
      console.error('Error updating sight word:', error)
      return NextResponse.json({ error: 'Failed to update sight word' }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
