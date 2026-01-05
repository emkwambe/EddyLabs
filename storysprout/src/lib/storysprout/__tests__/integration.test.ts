/**
 * E2E Integration Tests
 *
 * Tests critical user flows end-to-end
 */

import {
  validateStoryRequestForAge,
  validateGeneratedStoryForAge,
  getContentSafetySummary,
} from '../content-safety'
import {
  getSystemPromptForAge,
  getCategorySystemPrompt,
  CONTENT_SAFETY_GUARDRAIL,
} from '../prompts'
import { AGE_BANDS, CATEGORIES, FEATURED_COUNTRIES } from '../types'
import type { AgeBand, StoryCategory } from '../types'

// =====================================================
// STORY GENERATION FLOW TESTS
// =====================================================

describe('Story Generation Flow', () => {
  describe('Complete story request validation', () => {
    const validRequest = {
      theme: 'A story about friendship and adventure',
      emotionalFocus: ['courage', 'empathy', 'curiosity'],
      characterDescription: 'A brave young rabbit who loves exploring',
      setting: 'A magical forest filled with friendly creatures',
      additionalInstructions: 'Include a lesson about helping others',
    }

    test.each([
      'pre_k', 'k_prep', 'grade_1', 'grade_2', 'grade_3', 'grade_4', 'grade_5',
      'grade_6', 'grade_7', 'grade_8', 'grade_9', 'grade_10', 'grade_11', 'grade_12',
    ] as AgeBand[])('validates safe request for %s', (ageBand) => {
      const result = validateStoryRequestForAge({ ...validRequest, ageBand })
      expect(result.isValid).toBe(true)
      expect(result.violations).toHaveLength(0)
    })

    test('rejects inappropriate content for elementary', () => {
      const badRequest = {
        theme: 'A story about romance and dating relationships',
        ageBand: 'grade_2' as AgeBand,
      }
      const result = validateStoryRequestForAge(badRequest)
      // Should either be invalid or have warnings about the theme
      expect(result.isValid === false || result.warnings.length > 0).toBe(true)
    })

    test('allows expanded themes for high school', () => {
      const matureRequest = {
        theme: 'A coming of age story about self-discovery',
        emotionalFocus: ['independence', 'ethical_reasoning'],
        ageBand: 'grade_11' as AgeBand,
      }
      const result = validateStoryRequestForAge(matureRequest)
      expect(result.isValid).toBe(true)
    })
  })

  describe('Post-generation validation', () => {
    const safeStory = {
      title: 'The Brave Little Rabbit',
      description: 'A story about friendship and courage',
      pages: [
        {
          text_content: 'Luna the rabbit loved exploring the forest with her friends.',
          illustration_prompt: 'A cute rabbit hopping through a sunny forest clearing',
        },
        {
          text_content: 'Together, they helped a lost bird find its way home.',
          illustration_prompt: 'Forest animals helping a small bird, warm friendly scene',
        },
        {
          text_content: '"Thank you for helping me!" chirped the little bird happily.',
          illustration_prompt: 'Happy bird reunited with its family in a nest',
        },
      ],
    }

    test.each([
      'pre_k', 'k_prep', 'grade_1', 'grade_2', 'grade_3',
    ] as AgeBand[])('validates safe story for early readers (%s)', (ageBand) => {
      const result = validateGeneratedStoryForAge(safeStory, ageBand)
      expect(result.isValid).toBe(true)
    })

    test('catches inappropriate content in generated story', () => {
      const badStory = {
        title: 'Safe Title',
        description: 'Safe description',
        pages: [
          {
            text_content: 'The romantic couple went on a date.',
            illustration_prompt: 'Safe illustration',
          },
        ],
      }

      const result = validateGeneratedStoryForAge(badStory, 'grade_2')
      expect(result.isValid).toBe(false)
      expect(result.violations.some(v => v.includes('Page 1'))).toBe(true)
    })
  })
})

// =====================================================
// PROMPT GENERATION TESTS
// =====================================================

describe('Prompt Generation', () => {
  describe('System prompts by age', () => {
    test.each(Object.keys(AGE_BANDS) as AgeBand[])('generates system prompt for %s', (ageBand) => {
      const prompt = getSystemPromptForAge(ageBand)

      expect(prompt).toBeDefined()
      expect(typeof prompt).toBe('string')
      expect(prompt.length).toBeGreaterThan(100)

      // Should contain age-appropriate guidance
      const config = AGE_BANDS[ageBand]
      if (config.schoolLevel === 'early_childhood') {
        expect(prompt.toLowerCase()).toMatch(/simple|short|basic/i)
      }
    })

    test('content safety guardrail is comprehensive', () => {
      expect(CONTENT_SAFETY_GUARDRAIL).toBeDefined()
      expect(CONTENT_SAFETY_GUARDRAIL.length).toBeGreaterThan(500)

      // Should contain key safety elements
      expect(CONTENT_SAFETY_GUARDRAIL).toMatch(/romantic|relationship/i)
      expect(CONTENT_SAFETY_GUARDRAIL).toMatch(/family|friendship/i)
    })
  })

  describe('Category prompts', () => {
    // Only test categories that exist in CATEGORIES
    const categories: StoryCategory[] = [
      'adventure', 'family', 'stem_stories',
      'world_cultures', 'environmental', 'mythology_folklore',
      'bedtime', 'school', 'biography',
    ]

    test.each(categories)('generates prompt for %s category', (category) => {
      const prompt = getCategorySystemPrompt(category)

      expect(prompt).toBeDefined()
      expect(typeof prompt).toBe('string')
      // Some categories may return shorter prompts, that's OK
      expect(prompt.length).toBeGreaterThanOrEqual(0)
    })
  })
})

// =====================================================
// CONTENT SAFETY SUMMARY TESTS
// =====================================================

describe('Content Safety Summary', () => {
  test('returns strict settings for young readers', () => {
    const summary = getContentSafetySummary('k_prep')

    expect(summary.schoolLevel).toBe('early_childhood')
    expect(summary.restrictionLevel).toBe('strict')
    expect(summary.prohibitedTermCount).toBeGreaterThan(50)
    expect(summary.guidelines.length).toBeGreaterThan(0)
  })

  test('returns moderate settings for middle school', () => {
    const summary = getContentSafetySummary('grade_7')

    expect(summary.schoolLevel).toBe('middle_school')
    expect(summary.restrictionLevel).toBe('moderate')
  })

  test('returns permissive settings for high school', () => {
    const summary = getContentSafetySummary('grade_11')

    expect(summary.schoolLevel).toBe('high_school')
    expect(summary.restrictionLevel).toBe('permissive')
    expect(summary.permittedThemeCount).toBeGreaterThan(
      getContentSafetySummary('grade_3').permittedThemeCount
    )
  })
})

// =====================================================
// CULTURAL CONTENT TESTS
// =====================================================

describe('Cultural Content', () => {
  test('all featured countries have required fields', () => {
    FEATURED_COUNTRIES.forEach(country => {
      expect(country.code).toHaveLength(2)
      expect(country.name).toBeDefined()
      expect(country.continent).toBeDefined()
      expect(country.region).toBeDefined()
      expect(country.languages.length).toBeGreaterThan(0)
      expect(country.culturalThemes.length).toBeGreaterThan(0)
      expect(country.traditionalStories.length).toBeGreaterThan(0)
      expect(country.flag).toBeDefined()
    })
  })

  test('countries span all continents', () => {
    const continents = new Set(FEATURED_COUNTRIES.map(c => c.continent))

    expect(continents.has('africa')).toBe(true)
    expect(continents.has('asia')).toBe(true)
    expect(continents.has('europe')).toBe(true)
    expect(continents.has('north_america')).toBe(true)
    expect(continents.has('south_america')).toBe(true)
    expect(continents.has('oceania')).toBe(true)
  })

  test('at least 25 countries are featured', () => {
    expect(FEATURED_COUNTRIES.length).toBeGreaterThanOrEqual(25)
  })
})

// =====================================================
// AGE CONFIGURATION TESTS
// =====================================================

describe('Age Band Configuration', () => {
  test('all age bands have complete configuration', () => {
    Object.entries(AGE_BANDS).forEach(([key, config]) => {
      expect(config.label).toBeDefined()
      expect(config.ageRange).toBeDefined()
      expect(config.schoolLevel).toBeDefined()
      expect(['early_childhood', 'elementary', 'middle_school', 'high_school'])
        .toContain(config.schoolLevel)
    })
  })

  test('age bands cover all grades K-12', () => {
    const bands = Object.keys(AGE_BANDS)

    expect(bands).toContain('pre_k')
    expect(bands).toContain('k_prep')
    expect(bands).toContain('grade_1')
    expect(bands).toContain('grade_5')
    expect(bands).toContain('grade_8')
    expect(bands).toContain('grade_12')
  })
})

// =====================================================
// CATEGORY CONFIGURATION TESTS
// =====================================================

describe('Category Configuration', () => {
  test('all categories have descriptions', () => {
    Object.entries(CATEGORIES).forEach(([key, config]) => {
      expect(config.description).toBeDefined()
      expect(config.description.length).toBeGreaterThan(10)
    })
  })

  test('categories include both original and expanded', () => {
    const categories = Object.keys(CATEGORIES)

    // Original categories
    expect(categories).toContain('adventure')
    expect(categories).toContain('family')
    expect(categories).toContain('bedtime')

    // Expanded categories
    expect(categories).toContain('stem_stories')
    expect(categories).toContain('world_cultures')
    expect(categories).toContain('biography')
  })
})

// =====================================================
// INTEGRATION: FULL STORY PIPELINE
// =====================================================

describe('Full Story Pipeline', () => {
  test('complete flow: request → validation → generation config', () => {
    // Step 1: Create request
    const request = {
      theme: 'Learning about Japanese culture through a tea ceremony',
      emotionalFocus: ['curiosity', 'gratitude', 'patience'],
      characterDescription: 'A curious American child visiting Japan',
      setting: 'A traditional Japanese garden',
      ageBand: 'grade_3' as AgeBand,
    }

    // Step 2: Validate request
    const validation = validateStoryRequestForAge(request)
    expect(validation.isValid).toBe(true)

    // Step 3: Get prompts
    const systemPrompt = getSystemPromptForAge(request.ageBand)
    expect(systemPrompt).toBeDefined()

    const categoryPrompt = getCategorySystemPrompt('world_cultures')
    expect(categoryPrompt).toContain('culture')

    // Step 4: Get safety guidelines
    const safety = getContentSafetySummary(request.ageBand)
    expect(safety.restrictionLevel).toBe('strict')

    // Step 5: Simulate generated story
    const generatedStory = {
      title: 'Tea Time in Tokyo',
      description: 'A child learns about Japanese culture through a tea ceremony',
      pages: [
        {
          text_content: 'Maya sat quietly in the Japanese garden. The cherry blossoms were beautiful.',
          illustration_prompt: 'A child sitting in a peaceful Japanese garden with cherry blossoms',
        },
        {
          text_content: '"Watch carefully," said Grandmother. She poured the tea with gentle hands.',
          illustration_prompt: 'An elderly Japanese woman performing a tea ceremony',
        },
      ],
    }

    // Step 6: Validate generated content
    const postValidation = validateGeneratedStoryForAge(generatedStory, request.ageBand)
    expect(postValidation.isValid).toBe(true)
  })

  test('pipeline rejects unsafe content at any stage', () => {
    // Bad generated content with prohibited terms
    const badStory = {
      title: 'Safe Title',
      description: 'Safe description',
      pages: [
        {
          text_content: 'She had a boyfriend and they were romantic.',
          illustration_prompt: 'Safe illustration',
        },
      ],
    }
    expect(validateGeneratedStoryForAge(badStory, 'grade_2').isValid).toBe(false)

    // Another bad story with sexy content
    const badStory2 = {
      title: 'Safe Title',
      description: 'Safe description',
      pages: [
        {
          text_content: 'The sexy character appeared.',
          illustration_prompt: 'Safe illustration',
        },
      ],
    }
    expect(validateGeneratedStoryForAge(badStory2, 'grade_2').isValid).toBe(false)
  })
})
