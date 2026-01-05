/**
 * POST /api/stories/generate
 *
 * Generate a new story using AI
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import {
  withMiddleware,
  validateRequestBody,
  successResponse,
  errorResponse,
  formatZodError,
  ApiContext,
  ApiResponse,
} from '@/lib/api/middleware'
import { generateStory, StoryGenerationInput, GeneratedStory } from '@/lib/storysprout/story-generator'
import { createClient } from '@/lib/supabase/server'
import { AgeBand, StoryCategory, Continent, GlobalRegion, IllustrationStyle } from '@/lib/storysprout/types'

// =====================================================
// REQUEST VALIDATION SCHEMA
// =====================================================

const generateStorySchema = z.object({
  // Required fields
  ageBand: z.enum([
    'pre_k', 'k_prep', 'grade_1', 'grade_2', 'grade_3', 'grade_4', 'grade_5',
    'grade_6', 'grade_7', 'grade_8', 'grade_9', 'grade_10', 'grade_11', 'grade_12',
  ] as const),
  category: z.enum([
    'bedtime', 'seasonal', 'cultural', 'curriculum', 'emotional_social',
    'school', 'family', 'adventure', 'world_cultures', 'geography_adventures',
    'historical_fiction', 'mythology_folklore', 'global_citizenship',
    'environmental', 'stem_stories', 'biography', 'coming_of_age', 'social_issues',
  ] as const),

  // Optional customization
  theme: z.string().max(500).optional(),
  childName: z.string().max(100).optional(),
  customCharacterName: z.string().max(100).optional(),
  customCharacterDescription: z.string().max(500).optional(),
  setting: z.string().max(500).optional(),
  emotionalFocus: z.array(z.string()).max(5).optional(),

  // Cultural/Geographic
  continent: z.enum([
    'africa', 'asia', 'europe', 'north_america', 'south_america', 'oceania', 'antarctica',
  ] as const).optional(),
  region: z.string().optional(),
  countryCode: z.string().length(2).optional(),

  // Style
  illustrationStyle: z.enum([
    'soft_flat', 'watercolor', 'line_art', 'collage', 'photographic',
    'realistic', 'manga_anime', 'graphic_novel', 'digital_art',
  ] as const).optional(),
  storyLength: z.enum(['short', 'medium', 'long']).optional(),

  // Additional
  additionalInstructions: z.string().max(1000).optional(),
  childInterests: z.array(z.string()).max(10).optional(),
  readingLevel: z.string().optional(),

  // For saving
  childId: z.string().uuid().optional(),
  saveToLibrary: z.boolean().default(true),
})

type GenerateStoryRequest = z.infer<typeof generateStorySchema>

// =====================================================
// RATE LIMIT CONFIG FOR STORY GENERATION
// =====================================================

const STORY_GENERATION_RATE_LIMIT = {
  windowMs: 3600000, // 1 hour
  maxRequests: 10, // 10 stories per hour
}

// =====================================================
// HANDLER
// =====================================================

async function handleGenerateStory(
  req: NextRequest,
  context: ApiContext
): Promise<NextResponse<ApiResponse<GeneratedStory>>> {
  const { requestId, user } = context

  // Validate request body
  const validation = await validateRequestBody(req, generateStorySchema)
  if (!validation.success) {
    return errorResponse(
      'VALIDATION_ERROR',
      formatZodError(validation.error),
      requestId,
      400
    ) as NextResponse<ApiResponse<GeneratedStory>>
  }

  const input = validation.data

  // Build story generation input
  const generationInput: StoryGenerationInput = {
    ageBand: input.ageBand as AgeBand,
    category: input.category as StoryCategory,
    theme: input.theme,
    childName: input.childName,
    customCharacterName: input.customCharacterName,
    customCharacterDescription: input.customCharacterDescription,
    setting: input.setting,
    emotionalFocus: input.emotionalFocus,
    continent: input.continent as Continent | undefined,
    region: input.region as GlobalRegion | undefined,
    countryCode: input.countryCode,
    illustrationStyle: input.illustrationStyle as IllustrationStyle | undefined,
    storyLength: input.storyLength,
    additionalInstructions: input.additionalInstructions,
    childInterests: input.childInterests,
    readingLevel: input.readingLevel,
  }

  // Generate story
  const result = await generateStory(generationInput, user?.id)

  if (!result.success || !result.story) {
    const errorCode = result.error?.code || 'GENERATION_FAILED'
    const errorMessage = result.error?.message || 'Failed to generate story'

    return errorResponse(
      errorCode,
      errorMessage,
      requestId,
      result.error?.code === 'RATE_LIMITED' ? 429 : 500,
      result.error?.details
    ) as NextResponse<ApiResponse<GeneratedStory>>
  }

  // Save to database if requested
  if (input.saveToLibrary && user) {
    try {
      const supabase = await createClient()

      const { error: saveError } = await supabase.from('stories').insert({
        id: result.story.id,
        title: result.story.title,
        content: JSON.stringify(result.story.pages),
        summary: result.story.summary,
        age_band: result.story.ageBand,
        category: result.story.category,
        word_count: result.story.wordCount,
        estimated_reading_time_seconds: result.story.estimatedReadingTimeSeconds,
        reading_level_score: result.story.readingLevelScore,
        generation_status: 'completed',
        generation_prompt: JSON.stringify(generationInput),
        ai_model: result.story.model,
        safety_status: result.story.safetyValidation.warnings.length > 0 ? 'flagged' : 'approved',
        is_published: false,
        child_id: input.childId || null,
        custom_character_name: input.customCharacterName || null,
        continent: result.story.continent || null,
        region: result.story.region || null,
        country_code: result.story.countryCode || null,
        cultural_elements: result.story.culturalElements || [],
      })

      if (saveError) {
        console.error('Failed to save story:', saveError)
        // Don't fail the request, story was generated successfully
      }
    } catch (error) {
      console.error('Error saving story:', error)
    }
  }

  return successResponse(result.story, requestId, 201)
}

// =====================================================
// EXPORT
// =====================================================

export const POST = withMiddleware(handleGenerateStory, {
  requireAuth: true,
  rateLimit: STORY_GENERATION_RATE_LIMIT,
})
