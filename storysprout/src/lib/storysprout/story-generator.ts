/**
 * StorySprout Story Generation Service
 *
 * Core service for generating age-appropriate educational stories using Anthropic Claude.
 * Includes content safety validation, retry logic, rate limiting, and audit logging.
 */

import Anthropic from '@anthropic-ai/sdk'
import {
  AgeBand,
  StoryCategory,
  SchoolLevel,
  AGE_BANDS,
  Continent,
  GlobalRegion,
  IllustrationStyle,
  CATEGORIES,
  FEATURED_COUNTRIES,
  CountryConfig,
} from './types'
import {
  validateStoryRequestForAge,
  validateGeneratedStoryForAge,
  createReviewLog,
  getContentSafetySummary,
  ContentValidationResult,
  AgeAwareStoryRequest,
} from './content-safety'
import {
  getSystemPromptForAge,
  CONTENT_SAFETY_GUARDRAIL,
  getCategorySystemPrompt,
  generateCulturalStoryPrompt,
} from './prompts'

// =====================================================
// CONFIGURATION
// =====================================================

const DEFAULT_MODEL = 'claude-sonnet-4-5-20250929'
const MAX_RETRIES = 3
const RETRY_DELAYS = [1000, 2000, 4000] // Exponential backoff in ms

export interface StoryGeneratorConfig {
  apiKey?: string
  model?: string
  maxRetries?: number
  enableContentSafety?: boolean
  enableAuditLogging?: boolean
}

// =====================================================
// TYPES
// =====================================================

export interface StoryGenerationInput {
  // Required
  ageBand: AgeBand
  category: StoryCategory

  // Optional customization
  theme?: string
  childName?: string
  customCharacterName?: string
  customCharacterDescription?: string
  setting?: string
  emotionalFocus?: string[]

  // Cultural/Geographic
  continent?: Continent
  region?: GlobalRegion
  countryCode?: string

  // Style
  illustrationStyle?: IllustrationStyle
  storyLength?: 'short' | 'medium' | 'long'

  // Additional instructions
  additionalInstructions?: string

  // For personalization
  childInterests?: string[]
  readingLevel?: string
}

export interface StoryPage {
  pageNumber: number
  textContent: string
  illustrationPrompt: string
  vocabularyWords?: string[]
  readingTimeSeconds?: number
}

export interface GeneratedStory {
  id: string
  title: string
  description: string
  summary: string
  pages: StoryPage[]

  // Metadata
  ageBand: AgeBand
  category: StoryCategory
  schoolLevel: SchoolLevel
  wordCount: number
  estimatedReadingTimeSeconds: number
  readingLevelScore: number

  // Cultural
  continent?: Continent
  region?: GlobalRegion
  countryCode?: string
  culturalElements?: string[]

  // Generation metadata
  generatedAt: Date
  model: string
  promptTokens: number
  completionTokens: number

  // Safety
  safetyValidation: ContentValidationResult
}

export interface StoryGenerationResult {
  success: boolean
  story?: GeneratedStory
  error?: StoryGenerationError
  auditLog?: AuditLogEntry
}

export interface StoryGenerationError {
  code: 'VALIDATION_FAILED' | 'GENERATION_FAILED' | 'SAFETY_REJECTED' | 'RATE_LIMITED' | 'API_ERROR'
  message: string
  details?: unknown
  retryable: boolean
}

export interface AuditLogEntry {
  id: string
  timestamp: Date
  action: 'generation_requested' | 'generation_completed' | 'generation_failed' | 'safety_rejected'
  input: Partial<StoryGenerationInput>
  result?: {
    storyId?: string
    wordCount?: number
    safetyStatus: 'approved' | 'rejected' | 'flagged'
  }
  error?: StoryGenerationError
  durationMs: number
}

// =====================================================
// RATE LIMITER
// =====================================================

interface RateLimitEntry {
  count: number
  windowStart: number
}

class RateLimiter {
  private limits: Map<string, RateLimitEntry> = new Map()
  private readonly windowMs: number
  private readonly maxRequests: number

  constructor(windowMs: number = 60000, maxRequests: number = 10) {
    this.windowMs = windowMs
    this.maxRequests = maxRequests
  }

  check(key: string): { allowed: boolean; retryAfterMs?: number } {
    const now = Date.now()
    const entry = this.limits.get(key)

    if (!entry || now - entry.windowStart > this.windowMs) {
      // New window
      this.limits.set(key, { count: 1, windowStart: now })
      return { allowed: true }
    }

    if (entry.count >= this.maxRequests) {
      const retryAfterMs = this.windowMs - (now - entry.windowStart)
      return { allowed: false, retryAfterMs }
    }

    entry.count++
    return { allowed: true }
  }

  reset(key: string): void {
    this.limits.delete(key)
  }
}

// =====================================================
// STORY GENERATOR SERVICE
// =====================================================

export class StoryGenerator {
  private client: Anthropic
  private model: string
  private maxRetries: number
  private enableContentSafety: boolean
  private enableAuditLogging: boolean
  private rateLimiter: RateLimiter
  private auditLogs: AuditLogEntry[] = []

  constructor(config: StoryGeneratorConfig = {}) {
    this.client = new Anthropic({
      apiKey: config.apiKey || process.env.ANTHROPIC_API_KEY,
    })
    this.model = config.model || DEFAULT_MODEL
    this.maxRetries = config.maxRetries || MAX_RETRIES
    this.enableContentSafety = config.enableContentSafety ?? true
    this.enableAuditLogging = config.enableAuditLogging ?? true
    this.rateLimiter = new RateLimiter(60000, 10) // 10 requests per minute
  }

  /**
   * Generate a story based on the provided input
   */
  async generateStory(
    input: StoryGenerationInput,
    userId?: string
  ): Promise<StoryGenerationResult> {
    const startTime = Date.now()
    const auditId = this.generateId()

    try {
      // Rate limiting check
      const rateLimitKey = userId || 'anonymous'
      const rateCheck = this.rateLimiter.check(rateLimitKey)
      if (!rateCheck.allowed) {
        const error: StoryGenerationError = {
          code: 'RATE_LIMITED',
          message: `Rate limit exceeded. Retry after ${Math.ceil(rateCheck.retryAfterMs! / 1000)} seconds.`,
          retryable: true,
        }
        return this.handleError(error, input, startTime, auditId)
      }

      // Pre-generation content safety validation
      if (this.enableContentSafety) {
        const preValidation = this.validateInput(input)
        if (!preValidation.isValid) {
          const error: StoryGenerationError = {
            code: 'VALIDATION_FAILED',
            message: 'Input validation failed: ' + preValidation.violations.join('; '),
            details: preValidation,
            retryable: false,
          }
          return this.handleError(error, input, startTime, auditId)
        }
      }

      // Generate story with retries
      const story = await this.generateWithRetry(input)

      // Post-generation content safety validation
      if (this.enableContentSafety) {
        const postValidation = validateGeneratedStoryForAge(
          {
            title: story.title,
            description: story.description,
            pages: story.pages.map(p => ({
              text_content: p.textContent,
              illustration_prompt: p.illustrationPrompt,
            })),
          },
          input.ageBand
        )

        story.safetyValidation = postValidation

        if (!postValidation.isValid) {
          const error: StoryGenerationError = {
            code: 'SAFETY_REJECTED',
            message: 'Generated story failed safety validation: ' + postValidation.violations.join('; '),
            details: postValidation,
            retryable: true, // Can retry with different generation
          }
          return this.handleError(error, input, startTime, auditId)
        }
      }

      // Success
      const result: StoryGenerationResult = {
        success: true,
        story,
      }

      if (this.enableAuditLogging) {
        result.auditLog = this.createAuditLog(
          auditId,
          'generation_completed',
          input,
          {
            storyId: story.id,
            wordCount: story.wordCount,
            safetyStatus: story.safetyValidation.warnings.length > 0 ? 'flagged' : 'approved',
          },
          undefined,
          Date.now() - startTime
        )
      }

      return result
    } catch (error) {
      const genError: StoryGenerationError = {
        code: 'API_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        details: error,
        retryable: true,
      }
      return this.handleError(genError, input, startTime, auditId)
    }
  }

  /**
   * Validate input before generation
   */
  private validateInput(input: StoryGenerationInput): ContentValidationResult {
    const request: AgeAwareStoryRequest = {
      theme: input.theme || CATEGORIES[input.category]?.description || input.category,
      emotionalFocus: input.emotionalFocus,
      characterDescription: input.customCharacterDescription,
      setting: input.setting,
      additionalInstructions: input.additionalInstructions,
      ageBand: input.ageBand,
    }

    return validateStoryRequestForAge(request)
  }

  /**
   * Generate story with retry logic
   */
  private async generateWithRetry(input: StoryGenerationInput): Promise<GeneratedStory> {
    let lastError: Error | undefined

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        return await this.callAnthropicAPI(input)
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))

        // Don't retry on non-retryable errors
        if (this.isNonRetryableError(error)) {
          throw error
        }

        // Wait before retrying (exponential backoff)
        if (attempt < this.maxRetries) {
          const delay = RETRY_DELAYS[attempt] || RETRY_DELAYS[RETRY_DELAYS.length - 1]
          await this.sleep(delay)
        }
      }
    }

    throw lastError || new Error('Generation failed after retries')
  }

  /**
   * Call Anthropic API to generate story
   */
  private async callAnthropicAPI(input: StoryGenerationInput): Promise<GeneratedStory> {
    const systemPrompt = this.buildSystemPrompt(input)
    const userPrompt = this.buildUserPrompt(input)

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: this.getMaxTokensForLength(input.storyLength),
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    })

    // Parse response
    const content = response.content[0]
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from API')
    }

    const parsedStory = this.parseStoryResponse(content.text, input)

    return {
      ...parsedStory,
      id: this.generateId(),
      ageBand: input.ageBand,
      category: input.category,
      schoolLevel: AGE_BANDS[input.ageBand].schoolLevel,
      continent: input.continent,
      region: input.region,
      countryCode: input.countryCode,
      generatedAt: new Date(),
      model: this.model,
      promptTokens: response.usage.input_tokens,
      completionTokens: response.usage.output_tokens,
      safetyValidation: {
        isValid: true,
        violations: [],
        warnings: [],
        suggestions: [],
      },
    }
  }

  /**
   * Build system prompt for story generation
   */
  private buildSystemPrompt(input: StoryGenerationInput): string {
    const parts: string[] = []

    // Base age-appropriate system prompt
    parts.push(getSystemPromptForAge(input.ageBand))

    // Content safety guardrails
    parts.push('\n\n' + CONTENT_SAFETY_GUARDRAIL)

    // Category-specific guidance
    const categoryPrompt = getCategorySystemPrompt(input.category)
    if (categoryPrompt) {
      parts.push('\n\n' + categoryPrompt)
    }

    // Cultural context if specified
    if (input.continent || input.region || input.countryCode) {
      const lengthGuidance = this.getLengthGuidance(input.storyLength, input.ageBand)
      const culturalPrompt = generateCulturalStoryPrompt({
        category: input.category,
        ageBand: input.ageBand,
        theme: input.theme || CATEGORIES[input.category]?.description || 'adventure',
        emotionalFocus: input.emotionalFocus || ['curiosity', 'empathy'],
        sightWords: [],
        pageCount: lengthGuidance.pages,
        continent: input.continent,
        region: input.region,
        countryCode: input.countryCode,
        characterName: input.customCharacterName,
        characterDescription: input.customCharacterDescription,
        setting: input.setting,
      })
      parts.push('\n\n' + culturalPrompt)
    }

    // Content safety summary for this age
    const safetySummary = getContentSafetySummary(input.ageBand)
    parts.push(`\n\nCONTENT GUIDELINES FOR ${safetySummary.schoolLevel.toUpperCase()}:`)
    safetySummary.guidelines.forEach(g => parts.push(`- ${g}`))

    return parts.join('')
  }

  /**
   * Build user prompt for story generation
   */
  private buildUserPrompt(input: StoryGenerationInput): string {
    const ageBandConfig = AGE_BANDS[input.ageBand]
    const parts: string[] = []

    parts.push(`Generate an educational story with the following specifications:`)
    parts.push(``)
    parts.push(`TARGET AUDIENCE:`)
    parts.push(`- Age Band: ${input.ageBand} (${ageBandConfig.label})`)
    parts.push(`- Age Range: ${ageBandConfig.ageRange}`)
    parts.push(`- School Level: ${ageBandConfig.schoolLevel}`)
    parts.push(``)
    parts.push(`STORY REQUIREMENTS:`)
    parts.push(`- Category: ${input.category}`)

    if (input.theme) {
      parts.push(`- Theme: ${input.theme}`)
    }

    if (input.emotionalFocus && input.emotionalFocus.length > 0) {
      parts.push(`- Emotional Focus: ${input.emotionalFocus.join(', ')}`)
    }

    // Character customization
    if (input.childName || input.customCharacterName) {
      parts.push(``)
      parts.push(`MAIN CHARACTER:`)
      if (input.customCharacterName) {
        parts.push(`- Name: ${input.customCharacterName}`)
      } else if (input.childName) {
        parts.push(`- Name: ${input.childName}`)
      }
      if (input.customCharacterDescription) {
        parts.push(`- Description: ${input.customCharacterDescription}`)
      }
    }

    // Setting
    if (input.setting) {
      parts.push(``)
      parts.push(`SETTING: ${input.setting}`)
    }

    // Cultural elements
    if (input.countryCode) {
      const country = FEATURED_COUNTRIES.find(c => c.code === input.countryCode)
      if (country) {
        parts.push(``)
        parts.push(`CULTURAL CONTEXT:`)
        parts.push(`- Country: ${country.name} ${country.flag}`)
        parts.push(`- Cultural Themes: ${country.culturalThemes.join(', ')}`)
        parts.push(`- Traditional Stories to Reference: ${country.traditionalStories.join(', ')}`)
      }
    }

    // Child interests for personalization
    if (input.childInterests && input.childInterests.length > 0) {
      parts.push(``)
      parts.push(`PERSONALIZATION:`)
      parts.push(`- Incorporate these interests: ${input.childInterests.join(', ')}`)
    }

    // Story length
    const lengthGuidance = this.getLengthGuidance(input.storyLength, input.ageBand)
    parts.push(``)
    parts.push(`STORY LENGTH:`)
    parts.push(`- ${lengthGuidance.pages} pages`)
    parts.push(`- Approximately ${lengthGuidance.wordsPerPage} words per page`)
    parts.push(`- Total: ~${lengthGuidance.totalWords} words`)

    // Additional instructions
    if (input.additionalInstructions) {
      parts.push(``)
      parts.push(`ADDITIONAL INSTRUCTIONS:`)
      parts.push(input.additionalInstructions)
    }

    // Output format
    parts.push(``)
    parts.push(`OUTPUT FORMAT:`)
    parts.push(`Respond with a JSON object in exactly this format:`)
    parts.push(`{`)
    parts.push(`  "title": "Story Title",`)
    parts.push(`  "description": "Brief description for parents/teachers",`)
    parts.push(`  "summary": "One sentence summary for kids",`)
    parts.push(`  "pages": [`)
    parts.push(`    {`)
    parts.push(`      "pageNumber": 1,`)
    parts.push(`      "textContent": "Story text for this page...",`)
    parts.push(`      "illustrationPrompt": "Detailed illustration description...",`)
    parts.push(`      "vocabularyWords": ["word1", "word2"]`)
    parts.push(`    }`)
    parts.push(`  ],`)
    parts.push(`  "culturalElements": ["element1", "element2"],`)
    parts.push(`  "wordCount": 500,`)
    parts.push(`  "readingLevelScore": 3.5`)
    parts.push(`}`)

    return parts.join('\n')
  }

  /**
   * Parse story response from API
   */
  private parseStoryResponse(
    responseText: string,
    input: StoryGenerationInput
  ): Omit<GeneratedStory, 'id' | 'ageBand' | 'category' | 'schoolLevel' | 'continent' | 'region' | 'countryCode' | 'generatedAt' | 'model' | 'promptTokens' | 'completionTokens' | 'safetyValidation'> {
    // Extract JSON from response (handle markdown code blocks)
    let jsonStr = responseText
    const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (jsonMatch) {
      jsonStr = jsonMatch[1]
    }

    try {
      const parsed = JSON.parse(jsonStr.trim())

      // Calculate reading time (avg 150 words per minute for kids)
      const wordCount = parsed.wordCount || this.countWords(parsed.pages)
      const readingSpeed = this.getReadingSpeedForAge(input.ageBand)
      const estimatedReadingTimeSeconds = Math.ceil((wordCount / readingSpeed) * 60)

      return {
        title: parsed.title,
        description: parsed.description,
        summary: parsed.summary,
        pages: parsed.pages.map((p: { pageNumber: number; textContent: string; illustrationPrompt: string; vocabularyWords?: string[] }, i: number) => ({
          pageNumber: p.pageNumber || i + 1,
          textContent: p.textContent,
          illustrationPrompt: p.illustrationPrompt,
          vocabularyWords: p.vocabularyWords || [],
          readingTimeSeconds: Math.ceil((this.countWordsInText(p.textContent) / readingSpeed) * 60),
        })),
        culturalElements: parsed.culturalElements || [],
        wordCount,
        estimatedReadingTimeSeconds,
        readingLevelScore: parsed.readingLevelScore || this.estimateReadingLevel(parsed.pages),
      }
    } catch (error) {
      throw new Error(`Failed to parse story response: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get length guidance based on story length preference and age
   */
  private getLengthGuidance(
    length: StoryGenerationInput['storyLength'] = 'medium',
    ageBand: AgeBand
  ): { pages: number; wordsPerPage: number; totalWords: number } {
    const schoolLevel = AGE_BANDS[ageBand].schoolLevel

    const baseConfig = {
      early_childhood: { short: 3, medium: 5, long: 7, wordsPerPage: 30 },
      elementary: { short: 5, medium: 8, long: 12, wordsPerPage: 60 },
      middle_school: { short: 8, medium: 12, long: 18, wordsPerPage: 100 },
      high_school: { short: 10, medium: 15, long: 25, wordsPerPage: 150 },
    }

    const config = baseConfig[schoolLevel]
    const pages = config[length || 'medium']
    const wordsPerPage = config.wordsPerPage

    return {
      pages,
      wordsPerPage,
      totalWords: pages * wordsPerPage,
    }
  }

  /**
   * Get max tokens based on story length
   */
  private getMaxTokensForLength(length?: 'short' | 'medium' | 'long'): number {
    switch (length) {
      case 'short':
        return 2000
      case 'long':
        return 6000
      default:
        return 4000
    }
  }

  /**
   * Get reading speed for age band (words per minute)
   */
  private getReadingSpeedForAge(ageBand: AgeBand): number {
    const schoolLevel = AGE_BANDS[ageBand].schoolLevel
    const speeds = {
      early_childhood: 80,
      elementary: 120,
      middle_school: 180,
      high_school: 220,
    }
    return speeds[schoolLevel]
  }

  /**
   * Count words in pages
   */
  private countWords(pages: { textContent: string }[]): number {
    return pages.reduce((sum, page) => sum + this.countWordsInText(page.textContent), 0)
  }

  /**
   * Count words in text
   */
  private countWordsInText(text: string): number {
    return text.split(/\s+/).filter(word => word.length > 0).length
  }

  /**
   * Estimate reading level from pages
   */
  private estimateReadingLevel(pages: { textContent: string }[]): number {
    const allText = pages.map(p => p.textContent).join(' ')
    const words = allText.split(/\s+/).filter(w => w.length > 0)
    const avgWordLength = words.reduce((sum, w) => sum + w.length, 0) / words.length
    const longWordRatio = words.filter(w => w.length > 6).length / words.length

    // Simple estimate: combine average word length and long word ratio
    return Math.round((avgWordLength * 0.5 + longWordRatio * 10) * 10) / 10
  }

  /**
   * Check if error is non-retryable
   */
  private isNonRetryableError(error: unknown): boolean {
    if (error instanceof Anthropic.BadRequestError) return true
    if (error instanceof Anthropic.AuthenticationError) return true
    return false
  }

  /**
   * Handle error and create result
   */
  private handleError(
    error: StoryGenerationError,
    input: StoryGenerationInput,
    startTime: number,
    auditId: string
  ): StoryGenerationResult {
    const result: StoryGenerationResult = {
      success: false,
      error,
    }

    if (this.enableAuditLogging) {
      const action = error.code === 'SAFETY_REJECTED' ? 'safety_rejected' : 'generation_failed'
      result.auditLog = this.createAuditLog(
        auditId,
        action,
        input,
        { safetyStatus: error.code === 'SAFETY_REJECTED' ? 'rejected' : 'flagged' },
        error,
        Date.now() - startTime
      )
    }

    return result
  }

  /**
   * Create audit log entry
   */
  private createAuditLog(
    id: string,
    action: AuditLogEntry['action'],
    input: StoryGenerationInput,
    result: AuditLogEntry['result'],
    error: StoryGenerationError | undefined,
    durationMs: number
  ): AuditLogEntry {
    const log: AuditLogEntry = {
      id,
      timestamp: new Date(),
      action,
      input: {
        ageBand: input.ageBand,
        category: input.category,
        theme: input.theme,
        continent: input.continent,
        countryCode: input.countryCode,
      },
      result,
      error,
      durationMs,
    }

    if (this.enableAuditLogging) {
      this.auditLogs.push(log)
    }

    return log
  }

  /**
   * Get audit logs
   */
  getAuditLogs(): AuditLogEntry[] {
    return [...this.auditLogs]
  }

  /**
   * Clear audit logs
   */
  clearAuditLogs(): void {
    this.auditLogs = []
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `story_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

// =====================================================
// FACTORY FUNCTION
// =====================================================

let defaultGenerator: StoryGenerator | null = null

/**
 * Get the default story generator instance
 */
export function getStoryGenerator(config?: StoryGeneratorConfig): StoryGenerator {
  if (!defaultGenerator || config) {
    defaultGenerator = new StoryGenerator(config)
  }
  return defaultGenerator
}

/**
 * Generate a story using the default generator
 */
export async function generateStory(
  input: StoryGenerationInput,
  userId?: string
): Promise<StoryGenerationResult> {
  const generator = getStoryGenerator()
  return generator.generateStory(input, userId)
}
