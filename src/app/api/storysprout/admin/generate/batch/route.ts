import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// POST /api/storysprout/admin/generate/batch - Queue multiple stories at once
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { stories, use_template_id } = body

    // Option 1: Generate from a list of story configs
    if (stories && Array.isArray(stories)) {
      const queueEntries = stories.map((story: any, index: number) => ({
        category: story.category,
        age_band: story.age_band,
        theme: story.theme,
        emotional_focus: story.emotional_focus || [],
        sight_words: story.sight_words || [],
        page_count: story.page_count || 8,
        character_name: story.character_name,
        character_description: story.character_description,
        illustration_style: story.illustration_style || 'soft_flat',
        color_palette: story.color_palette,
        setting: story.setting,
        priority: story.priority || 5 + index, // Stagger priority
        created_by: user.id,
      }))

      const { data, error } = await supabase
        .from('story_generation_queue')
        .insert(queueEntries)
        .select()

      if (error) {
        console.error('Error creating batch entries:', error)
        return NextResponse.json({ error: 'Failed to queue stories' }, { status: 500 })
      }

      return NextResponse.json({
        data,
        message: `Queued ${data.length} stories for generation`,
      }, { status: 201 })
    }

    // Option 2: Generate multiple stories from a template
    if (use_template_id) {
      const { count = 5, theme_variations = [] } = body

      // Get template
      const { data: template, error: templateError } = await supabase
        .from('story_generation_templates')
        .select('*')
        .eq('id', use_template_id)
        .single()

      if (templateError || !template) {
        return NextResponse.json({ error: 'Template not found' }, { status: 404 })
      }

      // Generate variations
      const queueEntries = []
      const characters = template.character_options || []

      for (let i = 0; i < count; i++) {
        const theme = theme_variations[i] || template.theme_template.replace(
          /\{[^}]+\}/g,
          (match: string) => {
            // Simple placeholder replacement
            const placeholders: Record<string, string[]> = {
              '{action}': ['finds a special toy', 'makes a new friend', 'learns to be brave', 'helps a friend'],
              '{lesson}': ['sharing', 'kindness', 'patience', 'trying new things'],
              '{emotion}': ['worry', 'anger', 'sadness', 'excitement'],
              '{nature_element}': ['the forest', 'the ocean', 'a garden', 'the mountains'],
              '{science_topic}': ['how plants grow', 'animal homes', 'weather patterns', 'the seasons'],
            }
            const options = placeholders[match] || ['something special']
            return options[i % options.length]
          }
        )

        const character = characters[i % characters.length] || {}

        queueEntries.push({
          category: template.category,
          age_band: template.age_band,
          theme,
          emotional_focus: template.emotional_focus,
          sight_words: template.sight_words,
          page_count: template.page_count,
          character_name: character.name,
          character_description: character.description,
          illustration_style: template.illustration_style,
          color_palette: template.color_palette,
          priority: 5 + i,
          created_by: user.id,
        })
      }

      const { data, error } = await supabase
        .from('story_generation_queue')
        .insert(queueEntries)
        .select()

      if (error) {
        console.error('Error creating batch entries:', error)
        return NextResponse.json({ error: 'Failed to queue stories' }, { status: 500 })
      }

      // Update template usage count
      await supabase
        .from('story_generation_templates')
        .update({ times_used: template.times_used + count })
        .eq('id', use_template_id)

      return NextResponse.json({
        data,
        message: `Queued ${data.length} stories from template "${template.name}"`,
      }, { status: 201 })
    }

    return NextResponse.json(
      { error: 'Provide either "stories" array or "use_template_id"' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
