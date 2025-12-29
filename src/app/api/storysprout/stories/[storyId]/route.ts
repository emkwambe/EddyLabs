import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/storysprout/stories/[storyId] - Get a single story with pages
export async function GET(
  request: NextRequest,
  { params }: { params: { storyId: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { storyId } = params

    // Get story
    const { data: story, error: storyError } = await supabase
      .from('stories')
      .select('*')
      .eq('id', storyId)
      .single()

    if (storyError || !story) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 })
    }

    // Get story pages
    const { data: pages, error: pagesError } = await supabase
      .from('story_pages')
      .select('*')
      .eq('story_id', storyId)
      .order('page_number')

    if (pagesError) {
      console.error('Error fetching pages:', pagesError)
      return NextResponse.json({ error: 'Failed to fetch story pages' }, { status: 500 })
    }

    return NextResponse.json({
      story,
      pages: pages || [],
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
