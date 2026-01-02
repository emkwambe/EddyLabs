import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  validateStoryRequest,
  suggestSafeTheme,
} from '@/lib/storysprout/content-safety'

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
      // ========================================
      // CONTENT SAFETY VALIDATION FOR BATCH
      // ========================================
      const rejectedStories: Array<{
        index: number
        theme: string
        violations: string[]
        suggestions: string[]
      }> = []

      const validStories: any[] = []

      for (let i = 0; i < stories.length; i++) {
        const story = stories[i]

        // Validate each story against content safety guardrails
        const validation = validateStoryRequest({
          theme: story.theme,
          emotionalFocus: story.emotional_focus,
          characterDescription: story.character_description,
          setting: story.setting,
        })

        if (validation.violations.length > 0) {
          rejectedStories.push({
            index: i,
            theme: story.theme,
            violations: validation.violations,
            suggestions: suggestSafeTheme(story.theme),
          })
        } else {
          validStories.push(story)
        }
      }

      // If any stories violate guardrails, reject the entire batch
      if (rejectedStories.length > 0) {
        return NextResponse.json(
          {
            error: 'Some stories violate child safety guardrails',
            rejected_count: rejectedStories.length,
            rejected_stories: rejectedStories,
            message: 'Please revise rejected stories to comply with age-appropriate content guidelines. All stories must be non-romantic and focused on friendship, family, learning, and emotional growth.',
          },
          { status: 400 }
        )
      }

      // All stories validated - create queue entries
      const queueEntries = validStories.map((story: any, index: number) => ({
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

      // Generate variations with content safety validation
      const queueEntries = []
      const characters = template.character_options || []
      const rejectedVariations: Array<{ index: number; theme: string; violations: string[] }> = []

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

        // Validate each generated theme variation
        const validation = validateStoryRequest({
          theme,
          emotionalFocus: template.emotional_focus,
          characterDescription: character.description,
        })

        if (validation.violations.length > 0) {
          rejectedVariations.push({
            index: i,
            theme,
            violations: validation.violations,
          })
        } else {
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
      }

      // Reject if any variations failed validation
      if (rejectedVariations.length > 0) {
        return NextResponse.json(
          {
            error: 'Some template variations violate child safety guardrails',
            rejected_count: rejectedVariations.length,
            rejected_variations: rejectedVariations,
            message: 'Template or theme variations contain prohibited content. Please review the template settings.',
          },
          { status: 400 }
        )
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
