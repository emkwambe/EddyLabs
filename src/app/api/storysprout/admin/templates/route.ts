import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/storysprout/admin/templates - Get available generation templates
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('story_generation_templates')
      .select('*')
      .eq('is_active', true)
      .order('times_used', { ascending: false })

    if (error) {
      console.error('Error fetching templates:', error)
      return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/storysprout/admin/templates - Create a new template
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
      description,
      category,
      age_band,
      theme_template,
      emotional_focus = [],
      sight_words = [],
      page_count = 8,
      illustration_style = 'soft_flat',
      color_palette,
      character_options = [],
    } = body

    if (!name || !category || !age_band || !theme_template) {
      return NextResponse.json(
        { error: 'name, category, age_band, and theme_template are required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('story_generation_templates')
      .insert({
        name,
        description,
        category,
        age_band,
        theme_template,
        emotional_focus,
        sight_words,
        page_count,
        illustration_style,
        color_palette,
        character_options,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating template:', error)
      return NextResponse.json({ error: 'Failed to create template' }, { status: 500 })
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
