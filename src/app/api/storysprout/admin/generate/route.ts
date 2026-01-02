import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  validateStoryRequest,
  validateEmotionalFocus,
  suggestSafeTheme,
  createReviewLog,
} from '@/lib/storysprout/content-safety'

// POST /api/storysprout/admin/generate - Queue a new story for generation
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      category,
      age_band,
      theme,
      emotional_focus = [],
      sight_words = [],
      page_count = 8,
      character_name,
      character_description,
      illustration_style = 'soft_flat',
      color_palette,
      setting,
      priority = 5,
      webhook_callback_url,
    } = body

    // Validate required fields
    if (!category || !age_band || !theme) {
      return NextResponse.json(
        { error: 'category, age_band, and theme are required' },
        { status: 400 }
      )
    }

    // ========================================
    // CONTENT SAFETY VALIDATION
    // ========================================

    // Validate the story request against content safety guardrails
    const contentValidation = validateStoryRequest({
      theme,
      emotionalFocus: emotional_focus,
      characterDescription: character_description,
      setting,
    })

    // Also validate emotional focus specifically
    const emotionValidation = validateEmotionalFocus(emotional_focus)

    // Combine violations
    const allViolations = [
      ...contentValidation.violations,
      ...emotionValidation.violations,
    ]

    // If content violates guardrails, reject with helpful suggestions
    if (allViolations.length > 0) {
      const safeSuggestions = suggestSafeTheme(theme)

      // Create audit log
      const reviewLog = createReviewLog('story_generation', theme, contentValidation)
      console.log('Content rejected:', JSON.stringify(reviewLog))

      return NextResponse.json(
        {
          error: 'Content violates child safety guardrails',
          violations: allViolations,
          suggestions: safeSuggestions,
          message: 'Please revise your request to comply with age-appropriate content guidelines. All stories must be non-romantic and focused on friendship, family, learning, and emotional growth.',
        },
        { status: 400 }
      )
    }

    // Log warnings for manual review if any
    const allWarnings = [
      ...contentValidation.warnings,
      ...emotionValidation.warnings,
    ]

    if (allWarnings.length > 0) {
      console.log('Content warnings (approved with review flag):', {
        theme,
        warnings: allWarnings,
        user_id: user.id,
      })
    }

    // ========================================
    // CREATE QUEUE ENTRY
    // ========================================

    // Create queue entry
    const { data, error } = await supabase
      .from('story_generation_queue')
      .insert({
        category,
        age_band,
        theme,
        emotional_focus,
        sight_words,
        page_count,
        character_name,
        character_description,
        illustration_style,
        color_palette,
        setting,
        priority,
        webhook_callback_url,
        created_by: user.id,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating queue entry:', error)
      return NextResponse.json({ error: 'Failed to queue story' }, { status: 500 })
    }

    // Optionally trigger n8n webhook immediately
    const n8nWebhookUrl = process.env.N8N_STORY_GENERATOR_WEBHOOK
    if (n8nWebhookUrl) {
      try {
        await fetch(n8nWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            queue_id: data.id,
            ...body,
          }),
        })
      } catch (webhookError) {
        console.error('Failed to trigger n8n webhook:', webhookError)
        // Don't fail the request, n8n can poll for pending stories
      }
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET /api/storysprout/admin/generate - Get queue status
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '20')

    let query = supabase
      .from('story_generation_queue')
      .select('*, stories(title, story_code)')
      .eq('created_by', user.id)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching queue:', error)
      return NextResponse.json({ error: 'Failed to fetch queue' }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
