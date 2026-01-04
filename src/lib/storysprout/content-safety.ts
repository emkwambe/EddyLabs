/**
 * StorySprout Content Safety Validation
 *
 * Enforces Age-Appropriate Content Guardrails for all grade levels (Pre-K to Grade 12)
 * Content restrictions are tiered by school level:
 * - Elementary & Younger (Pre-K to Grade 5): Strict content neutrality
 * - Middle School (Grades 6-8): Age-appropriate themes with guidance
 * - High School (Grades 9-12): Mature themes handled appropriately
 */

import { AgeBand, SchoolLevel, AGE_BANDS } from './types'

// Helper to get school level
function getSchoolLevel(ageBand: AgeBand): SchoolLevel {
  return AGE_BANDS[ageBand].schoolLevel
}

// =====================================================
// PROHIBITED CONTENT PATTERNS
// =====================================================

/**
 * Words and phrases that are prohibited in story content
 * These trigger automatic rejection of content
 */
export const PROHIBITED_TERMS = [
  // Romantic relationship terms
  'boyfriend',
  'girlfriend',
  'dating',
  'date night',
  'crush',
  'in love with',
  'fell in love',
  'love interest',
  'romantic',
  'romance',
  'kiss on the lips',
  'passionate',
  'attracted to',
  'attraction',
  'flirt',
  'flirting',
  'marry me',
  'proposal',
  'engaged',
  'engagement',
  'wedding',
  'bride',
  'groom',
  'honeymoon',
  'lover',
  'sweetheart',
  'darling', // when used romantically
  'soulmate',
  'true love',
  'love of my life',
  'couple',
  'couples',

  // Sexualized terms (should never appear)
  'sexy',
  'seductive',
  'sensual',
  'intimate',
  'intimacy',
  'naked',
  'nude',
  'undress',
  'strip',
  'body',

  // Identity/relationship exploration (beyond age-appropriate)
  'gender identity',
  'sexual orientation',
  'coming out',
  'lgbtq',
  'heterosexual',
  'homosexual',
  'bisexual',
  'pansexual',
  'asexual',
  'queer',
  'transgender',
  'non-binary',
  'cisgender',
  'polyamory',
  'polyamorous',
]

/**
 * Phrases that suggest romantic context even if individual words are okay
 */
export const PROHIBITED_PHRASES = [
  'holding hands romantically',
  'looked into each other\'s eyes',
  'gazed lovingly',
  'heart skipped a beat',
  'butterflies in stomach',
  'blushed when',
  'couldn\'t stop thinking about',
  'dreamed about him',
  'dreamed about her',
  'special feelings for',
  'more than friends',
  'just friends', // often implies romantic possibility
  'meant to be together',
  'perfect for each other',
  'chemistry between',
  'spark between',
]

/**
 * Themes that are explicitly prohibited
 */
export const PROHIBITED_THEMES = [
  'romance',
  'dating',
  'relationships',
  'love stories',
  'marriage',
  'weddings',
  'crushes',
  'attraction',
  'beauty standards',
  'physical appearance focus',
  'body image',
  'popularity contests',
  'cliques',
  'exclusion based on appearance',
]

// =====================================================
// PERMITTED CONTENT GUIDELINES
// =====================================================

/**
 * Explicitly permitted relationship contexts
 */
export const PERMITTED_RELATIONSHIPS = [
  'family',
  'parents',
  'mom',
  'dad',
  'mother',
  'father',
  'siblings',
  'brother',
  'sister',
  'grandparents',
  'grandma',
  'grandpa',
  'grandmother',
  'grandfather',
  'aunt',
  'uncle',
  'cousin',
  'guardian',
  'caregiver',
  'friends',
  'best friend',
  'classmates',
  'teammates',
  'neighbors',
  'teacher',
  'coach',
  'mentor',
  'librarian',
  'doctor',
  'nurse',
  'firefighter',
  'police officer',
  'community helper',
  'pet',
  'animal friend',
]

/**
 * Permitted emotional themes
 */
export const PERMITTED_THEMES = [
  'friendship',
  'kindness',
  'empathy',
  'courage',
  'bravery',
  'curiosity',
  'wonder',
  'gratitude',
  'thankfulness',
  'resilience',
  'perseverance',
  'growth',
  'learning',
  'helping others',
  'teamwork',
  'cooperation',
  'sharing',
  'patience',
  'self-confidence',
  'self-worth',
  'belonging',
  'inclusion',
  'diversity',
  'respect',
  'responsibility',
  'honesty',
  'integrity',
  'creativity',
  'imagination',
  'adventure',
  'exploration',
  'nature',
  'animals',
  'family love',
  'sibling bonds',
  'making friends',
  'overcoming fears',
  'trying new things',
  'managing emotions',
  'feeling sad',
  'feeling angry',
  'feeling worried',
  'feeling happy',
  'feeling proud',
  'feeling scared',
  'bedtime',
  'school',
  'playground',
  'community',
  'seasons',
  'holidays',
  'celebrations',
  'traditions',
]

// =====================================================
// AGE-TIERED CONTENT CONFIGURATION
// =====================================================

/**
 * Middle School permitted themes (in addition to elementary)
 */
export const MIDDLE_SCHOOL_PERMITTED_THEMES = [
  ...PERMITTED_THEMES,
  // Identity and growth themes
  'self-discovery',
  'identity formation',
  'finding your voice',
  'peer pressure',
  'academic challenges',
  // Social themes
  'social dynamics',
  'navigating friendships',
  'dealing with conflict',
  'standing up for others',
  // Broader themes
  'social justice basics',
  'historical events',
  'cultural identity',
  'global awareness',
  'environmental activism',
  // Age-appropriate relationship awareness
  'friendship changes',
  'feeling nervous around peers',
]

/**
 * High School permitted themes (in addition to middle school)
 */
export const HIGH_SCHOOL_PERMITTED_THEMES = [
  ...MIDDLE_SCHOOL_PERMITTED_THEMES,
  // Deeper identity themes
  'coming of age',
  'life transitions',
  'career exploration',
  'future planning',
  'independence',
  // Social and political themes
  'social movements',
  'civic engagement',
  'political awareness',
  'economic concepts',
  'ethical dilemmas',
  // Age-appropriate relationship themes
  'healthy relationships',
  'dating awareness',
  'peer relationships',
  // Complex themes handled appropriately
  'mental health awareness',
  'grief and loss',
  'family challenges',
  'discrimination',
  'inequality',
]

/**
 * Terms that are prohibited only for elementary and younger
 * (May be permitted with appropriate handling for older students)
 */
export const ELEMENTARY_ONLY_PROHIBITED = [
  // These are always prohibited for elementary but may be handled
  // appropriately for older students
  'dating',
  'crush',
  'attracted to',
  'attraction',
]

/**
 * Terms that remain prohibited regardless of age
 * (Content that is never appropriate for K-12 education)
 */
export const UNIVERSALLY_PROHIBITED = [
  // Sexualized content
  'sexy',
  'seductive',
  'sensual',
  'intimate',
  'intimacy',
  'naked',
  'nude',
  'undress',
  'strip',
  // Violence
  'gore',
  'brutal',
  'torture',
  // Substance abuse promotion
  'drugs are cool',
  'get drunk',
  'get high',
  // Hate speech patterns
  'hate all',
  'kill all',
  'destroy all',
]

/**
 * Get prohibited terms based on age band
 */
export function getProhibitedTermsForAge(ageBand: AgeBand): string[] {
  const schoolLevel = getSchoolLevel(ageBand)

  switch (schoolLevel) {
    case 'early_childhood':
    case 'elementary':
      // Most restrictive - use all prohibited terms
      return PROHIBITED_TERMS

    case 'middle_school':
      // Remove some terms but keep core restrictions
      return PROHIBITED_TERMS.filter(
        term => !['crush', 'attraction'].includes(term.toLowerCase())
      )

    case 'high_school':
      // Most permissive but still filtered
      return UNIVERSALLY_PROHIBITED
  }
}

/**
 * Get permitted themes based on age band
 */
export function getPermittedThemesForAge(ageBand: AgeBand): string[] {
  const schoolLevel = getSchoolLevel(ageBand)

  switch (schoolLevel) {
    case 'early_childhood':
    case 'elementary':
      return PERMITTED_THEMES

    case 'middle_school':
      return MIDDLE_SCHOOL_PERMITTED_THEMES

    case 'high_school':
      return HIGH_SCHOOL_PERMITTED_THEMES
  }
}

// =====================================================
// VALIDATION FUNCTIONS
// =====================================================

export interface ContentValidationResult {
  isValid: boolean
  violations: string[]
  warnings: string[]
  suggestions: string[]
}

/**
 * Validates text content against prohibited terms and phrases
 */
export function validateTextContent(text: string): ContentValidationResult {
  const result: ContentValidationResult = {
    isValid: true,
    violations: [],
    warnings: [],
    suggestions: [],
  }

  const lowerText = text.toLowerCase()

  // Check for prohibited terms
  for (const term of PROHIBITED_TERMS) {
    if (lowerText.includes(term.toLowerCase())) {
      result.isValid = false
      result.violations.push(`Prohibited term detected: "${term}"`)
    }
  }

  // Check for prohibited phrases
  for (const phrase of PROHIBITED_PHRASES) {
    if (lowerText.includes(phrase.toLowerCase())) {
      result.isValid = false
      result.violations.push(`Prohibited phrase detected: "${phrase}"`)
    }
  }

  // Check for potentially problematic patterns
  if (/\bheart\b.*\b(flutter|skip|race|pound)/i.test(text)) {
    result.warnings.push('Heart-related emotional language detected - ensure context is family/friendship')
  }

  if (/\bbeautiful\b|\bhandsome\b|\bpretty\b|\bcute\b/i.test(text)) {
    result.warnings.push('Appearance-focused language detected - ensure not emphasizing physical attraction')
  }

  if (/\bspecial friend\b|\bvery close\b/i.test(text)) {
    result.warnings.push('Ambiguous relationship language - clarify as friendship or family')
  }

  return result
}

/**
 * Validates a story theme against guidelines
 */
export function validateTheme(theme: string): ContentValidationResult {
  const result: ContentValidationResult = {
    isValid: true,
    violations: [],
    warnings: [],
    suggestions: [],
  }

  const lowerTheme = theme.toLowerCase()

  // Check for prohibited themes
  for (const prohibited of PROHIBITED_THEMES) {
    if (lowerTheme.includes(prohibited.toLowerCase())) {
      result.isValid = false
      result.violations.push(`Prohibited theme: "${prohibited}"`)
    }
  }

  // Check if theme aligns with permitted themes
  const hasPermittedTheme = PERMITTED_THEMES.some(
    permitted => lowerTheme.includes(permitted.toLowerCase())
  )

  if (!hasPermittedTheme && result.isValid) {
    result.warnings.push('Theme does not clearly match permitted themes - manual review recommended')
    result.suggestions.push(`Consider themes like: ${PERMITTED_THEMES.slice(0, 5).join(', ')}`)
  }

  return result
}

/**
 * Validates emotional focus tags
 */
export function validateEmotionalFocus(emotionalFocus: string[]): ContentValidationResult {
  const result: ContentValidationResult = {
    isValid: true,
    violations: [],
    warnings: [],
    suggestions: [],
  }

  const permittedEmotions = [
    'calm',
    'patience',
    'self_regulation',
    'joy',
    'gratitude',
    'confidence',
    'empathy',
    'kindness',
    'belonging',
    'curiosity',
    'resilience',
    'courage',
    'worry',
    'anger',
    'sadness',
    'loneliness',
  ]

  for (const emotion of emotionalFocus) {
    if (!permittedEmotions.includes(emotion.toLowerCase())) {
      result.warnings.push(`Unknown emotional focus: "${emotion}" - verify it's age-appropriate`)
    }
  }

  // Check for potentially romantic-coded emotions
  const romanticCoded = ['love', 'attraction', 'desire', 'passion', 'longing']
  for (const emotion of emotionalFocus) {
    if (romanticCoded.includes(emotion.toLowerCase())) {
      result.isValid = false
      result.violations.push(`Prohibited emotional focus: "${emotion}" (romantic-coded)`)
    }
  }

  return result
}

/**
 * Validates illustration prompts
 */
export function validateIllustrationPrompt(prompt: string): ContentValidationResult {
  const result: ContentValidationResult = {
    isValid: true,
    violations: [],
    warnings: [],
    suggestions: [],
  }

  const lowerPrompt = prompt.toLowerCase()

  // Check for romantic imagery
  const romanticImagery = [
    'holding hands romantically',
    'gazing into eyes',
    'romantic pose',
    'couple pose',
    'wedding',
    'kissing',
    'embracing romantically',
    'love hearts',
    'romantic hearts',
    'blushing at each other',
  ]

  for (const imagery of romanticImagery) {
    if (lowerPrompt.includes(imagery)) {
      result.isValid = false
      result.violations.push(`Prohibited illustration imagery: "${imagery}"`)
    }
  }

  // Check for suggestive elements
  const suggestiveElements = [
    'revealing',
    'suggestive',
    'seductive',
    'sexy',
    'provocative',
    'alluring',
    'bedroom',
    'intimate setting',
  ]

  for (const element of suggestiveElements) {
    if (lowerPrompt.includes(element)) {
      result.isValid = false
      result.violations.push(`Prohibited illustration element: "${element}"`)
    }
  }

  // Warnings for ambiguous content
  if (lowerPrompt.includes('heart') && !lowerPrompt.includes('family')) {
    result.warnings.push('Heart imagery detected - ensure it represents family love, not romantic')
  }

  return result
}

/**
 * Comprehensive validation of a story generation request
 */
export interface StoryGenerationRequest {
  theme: string
  emotionalFocus?: string[]
  characterName?: string
  characterDescription?: string
  setting?: string
  additionalInstructions?: string
}

export function validateStoryRequest(request: StoryGenerationRequest): ContentValidationResult {
  const result: ContentValidationResult = {
    isValid: true,
    violations: [],
    warnings: [],
    suggestions: [],
  }

  // Validate theme
  const themeResult = validateTheme(request.theme)
  result.violations.push(...themeResult.violations)
  result.warnings.push(...themeResult.warnings)
  result.suggestions.push(...themeResult.suggestions)

  // Validate emotional focus
  if (request.emotionalFocus) {
    const emotionResult = validateEmotionalFocus(request.emotionalFocus)
    result.violations.push(...emotionResult.violations)
    result.warnings.push(...emotionResult.warnings)
  }

  // Validate character description
  if (request.characterDescription) {
    const charResult = validateTextContent(request.characterDescription)
    result.violations.push(...charResult.violations)
    result.warnings.push(...charResult.warnings)
  }

  // Validate additional instructions
  if (request.additionalInstructions) {
    const instrResult = validateTextContent(request.additionalInstructions)
    result.violations.push(...instrResult.violations)
    result.warnings.push(...instrResult.warnings)
  }

  // Set overall validity
  result.isValid = result.violations.length === 0

  return result
}

/**
 * Post-generation validation of story content
 * Use this to validate AI-generated content before saving
 */
export function validateGeneratedStory(story: {
  title: string
  description: string
  pages: Array<{ text_content: string; illustration_prompt: string }>
}): ContentValidationResult {
  const result: ContentValidationResult = {
    isValid: true,
    violations: [],
    warnings: [],
    suggestions: [],
  }

  // Validate title
  const titleResult = validateTextContent(story.title)
  if (!titleResult.isValid) {
    result.violations.push(`Title: ${titleResult.violations.join(', ')}`)
  }
  result.warnings.push(...titleResult.warnings.map(w => `Title: ${w}`))

  // Validate description
  const descResult = validateTextContent(story.description)
  if (!descResult.isValid) {
    result.violations.push(`Description: ${descResult.violations.join(', ')}`)
  }
  result.warnings.push(...descResult.warnings.map(w => `Description: ${w}`))

  // Validate each page
  for (let i = 0; i < story.pages.length; i++) {
    const page = story.pages[i]
    const pageNum = i + 1

    // Validate text content
    const textResult = validateTextContent(page.text_content)
    if (!textResult.isValid) {
      result.violations.push(`Page ${pageNum} text: ${textResult.violations.join(', ')}`)
    }
    result.warnings.push(...textResult.warnings.map(w => `Page ${pageNum}: ${w}`))

    // Validate illustration prompt
    const illustrationResult = validateIllustrationPrompt(page.illustration_prompt)
    if (!illustrationResult.isValid) {
      result.violations.push(`Page ${pageNum} illustration: ${illustrationResult.violations.join(', ')}`)
    }
    result.warnings.push(...illustrationResult.warnings.map(w => `Page ${pageNum} illustration: ${w}`))
  }

  result.isValid = result.violations.length === 0

  return result
}

// =====================================================
// CONTENT SANITIZATION
// =====================================================

/**
 * Attempts to sanitize theme by suggesting alternatives
 */
export function suggestSafeTheme(unsafeTheme: string): string[] {
  const suggestions: string[] = []

  // Map problematic themes to safe alternatives
  const themeAlternatives: Record<string, string[]> = {
    'romance': ['friendship', 'family bonds', 'teamwork'],
    'love story': ['friendship story', 'family adventure', 'helping others'],
    'dating': ['making friends', 'meeting new classmates', 'playground fun'],
    'crush': ['admiring a hero', 'looking up to a mentor', 'wanting to be like a friend'],
    'wedding': ['family celebration', 'birthday party', 'community festival'],
    'boyfriend': ['best friend', 'classmate', 'teammate'],
    'girlfriend': ['best friend', 'classmate', 'teammate'],
  }

  const lowerTheme = unsafeTheme.toLowerCase()

  for (const [unsafe, safe] of Object.entries(themeAlternatives)) {
    if (lowerTheme.includes(unsafe)) {
      suggestions.push(...safe)
    }
  }

  if (suggestions.length === 0) {
    // Provide general safe themes
    suggestions.push(
      'A story about friendship and helping others',
      'An adventure about curiosity and discovery',
      'A tale about family and belonging'
    )
  }

  return [...new Set(suggestions)] // Remove duplicates
}

// =====================================================
// LOGGING FOR REVIEW
// =====================================================

export interface ContentReviewLog {
  timestamp: Date
  requestType: 'story_generation' | 'illustration' | 'theme_validation'
  input: string
  result: ContentValidationResult
  action: 'approved' | 'rejected' | 'flagged_for_review'
}

/**
 * Creates a log entry for content review audit trail
 */
export function createReviewLog(
  requestType: ContentReviewLog['requestType'],
  input: string,
  result: ContentValidationResult
): ContentReviewLog {
  let action: ContentReviewLog['action']

  if (!result.isValid) {
    action = 'rejected'
  } else if (result.warnings.length > 0) {
    action = 'flagged_for_review'
  } else {
    action = 'approved'
  }

  return {
    timestamp: new Date(),
    requestType,
    input: input.substring(0, 500), // Truncate for logging
    result,
    action,
  }
}

// =====================================================
// AGE-AWARE VALIDATION FUNCTIONS
// =====================================================

/**
 * Age-aware text content validation
 * Applies different rules based on target age group
 */
export function validateTextContentForAge(
  text: string,
  ageBand: AgeBand
): ContentValidationResult {
  const result: ContentValidationResult = {
    isValid: true,
    violations: [],
    warnings: [],
    suggestions: [],
  }

  const lowerText = text.toLowerCase()
  const prohibitedTerms = getProhibitedTermsForAge(ageBand)
  const schoolLevel = getSchoolLevel(ageBand)

  // Check for prohibited terms based on age
  for (const term of prohibitedTerms) {
    if (lowerText.includes(term.toLowerCase())) {
      result.isValid = false
      result.violations.push(`Prohibited term for ${schoolLevel}: "${term}"`)
    }
  }

  // Universal checks (apply to all ages)
  for (const term of UNIVERSALLY_PROHIBITED) {
    if (lowerText.includes(term.toLowerCase())) {
      result.isValid = false
      result.violations.push(`Universally prohibited: "${term}"`)
    }
  }

  // Age-specific warnings
  if (schoolLevel === 'early_childhood' || schoolLevel === 'elementary') {
    // Strict checks for younger readers
    if (/\bbeautiful\b|\bhandsome\b|\bpretty\b|\bcute\b/i.test(text)) {
      result.warnings.push('Appearance-focused language - ensure not emphasizing physical attraction')
    }
    if (/\bheart\b.*\b(flutter|skip|race|pound)/i.test(text)) {
      result.warnings.push('Heart-related emotional language - ensure context is family/friendship')
    }
  } else if (schoolLevel === 'middle_school') {
    // Moderate checks for middle schoolers
    if (/\bkiss\b|\bkissing\b/i.test(text) && !/family|cheek|forehead|goodbye/i.test(text)) {
      result.warnings.push('Kissing reference detected - ensure age-appropriate context')
    }
  }
  // High school has fewer content warnings, focusing on universal prohibitions

  return result
}

/**
 * Age-aware theme validation
 */
export function validateThemeForAge(
  theme: string,
  ageBand: AgeBand
): ContentValidationResult {
  const result: ContentValidationResult = {
    isValid: true,
    violations: [],
    warnings: [],
    suggestions: [],
  }

  const lowerTheme = theme.toLowerCase()
  const schoolLevel = getSchoolLevel(ageBand)
  const permittedThemes = getPermittedThemesForAge(ageBand)

  // Check if theme is explicitly permitted
  const hasPermittedTheme = permittedThemes.some(
    permitted => lowerTheme.includes(permitted.toLowerCase())
  )

  // Check for universally prohibited themes
  const universallyProhibitedThemes = [
    'sexual',
    'explicit',
    'violent gore',
    'substance abuse',
    'self-harm',
  ]

  for (const prohibited of universallyProhibitedThemes) {
    if (lowerTheme.includes(prohibited)) {
      result.isValid = false
      result.violations.push(`Universally prohibited theme: "${prohibited}"`)
    }
  }

  // Age-specific theme restrictions
  if (schoolLevel === 'early_childhood' || schoolLevel === 'elementary') {
    for (const prohibited of PROHIBITED_THEMES) {
      if (lowerTheme.includes(prohibited.toLowerCase())) {
        result.isValid = false
        result.violations.push(`Theme not appropriate for ${schoolLevel}: "${prohibited}"`)
      }
    }
  } else if (schoolLevel === 'middle_school') {
    // Some themes become warnings rather than violations
    const cautionThemes = ['romance', 'dating', 'relationships']
    for (const caution of cautionThemes) {
      if (lowerTheme.includes(caution)) {
        result.warnings.push(`Theme "${caution}" requires careful, age-appropriate handling for middle school`)
      }
    }
  }
  // High school themes are more permissive

  if (!hasPermittedTheme && result.isValid && result.violations.length === 0) {
    result.warnings.push('Theme does not clearly match recommended themes - manual review suggested')
    result.suggestions.push(`Recommended themes: ${permittedThemes.slice(0, 5).join(', ')}`)
  }

  return result
}

/**
 * Extended story request interface with age band
 */
export interface AgeAwareStoryRequest extends StoryGenerationRequest {
  ageBand: AgeBand
}

/**
 * Comprehensive age-aware story request validation
 */
export function validateStoryRequestForAge(
  request: AgeAwareStoryRequest
): ContentValidationResult {
  const result: ContentValidationResult = {
    isValid: true,
    violations: [],
    warnings: [],
    suggestions: [],
  }

  const { ageBand } = request

  // Validate theme with age awareness
  const themeResult = validateThemeForAge(request.theme, ageBand)
  result.violations.push(...themeResult.violations)
  result.warnings.push(...themeResult.warnings)
  result.suggestions.push(...themeResult.suggestions)

  // Validate emotional focus with age awareness
  if (request.emotionalFocus) {
    const emotionResult = validateEmotionalFocusForAge(request.emotionalFocus, ageBand)
    result.violations.push(...emotionResult.violations)
    result.warnings.push(...emotionResult.warnings)
  }

  // Validate character description
  if (request.characterDescription) {
    const charResult = validateTextContentForAge(request.characterDescription, ageBand)
    result.violations.push(...charResult.violations)
    result.warnings.push(...charResult.warnings)
  }

  // Validate setting
  if (request.setting) {
    const settingResult = validateTextContentForAge(request.setting, ageBand)
    result.violations.push(...settingResult.violations)
    result.warnings.push(...settingResult.warnings)
  }

  // Validate additional instructions
  if (request.additionalInstructions) {
    const instrResult = validateTextContentForAge(request.additionalInstructions, ageBand)
    result.violations.push(...instrResult.violations)
    result.warnings.push(...instrResult.warnings)
  }

  result.isValid = result.violations.length === 0

  return result
}

/**
 * Age-aware emotional focus validation
 */
export function validateEmotionalFocusForAge(
  emotionalFocus: string[],
  ageBand: AgeBand
): ContentValidationResult {
  const result: ContentValidationResult = {
    isValid: true,
    violations: [],
    warnings: [],
    suggestions: [],
  }

  const schoolLevel = getSchoolLevel(ageBand)

  // Permitted emotions expand with age
  const basePermittedEmotions = [
    'calm', 'patience', 'self_regulation', 'joy', 'gratitude',
    'confidence', 'empathy', 'kindness', 'belonging', 'curiosity',
    'resilience', 'courage', 'worry', 'anger', 'sadness', 'loneliness',
  ]

  const middleSchoolEmotions = [
    ...basePermittedEmotions,
    'self_discovery', 'peer_pressure', 'identity', 'academic_stress',
  ]

  const highSchoolEmotions = [
    ...middleSchoolEmotions,
    'ethical_reasoning', 'social_responsibility', 'independence',
    'future_planning', 'cultural_identity', 'global_awareness',
  ]

  let permittedEmotions: string[]
  switch (schoolLevel) {
    case 'early_childhood':
    case 'elementary':
      permittedEmotions = basePermittedEmotions
      break
    case 'middle_school':
      permittedEmotions = middleSchoolEmotions
      break
    case 'high_school':
      permittedEmotions = highSchoolEmotions
      break
    default:
      permittedEmotions = basePermittedEmotions
  }

  // Check each emotional focus
  for (const emotion of emotionalFocus) {
    const lowerEmotion = emotion.toLowerCase().replace(/-/g, '_')

    if (!permittedEmotions.includes(lowerEmotion)) {
      // Check if it's explicitly prohibited or just unknown
      const romanticCoded = ['love', 'attraction', 'desire', 'passion', 'longing', 'romantic']
      if (romanticCoded.includes(lowerEmotion)) {
        if (schoolLevel === 'early_childhood' || schoolLevel === 'elementary') {
          result.isValid = false
          result.violations.push(`Romantic-coded emotion not appropriate for ${schoolLevel}: "${emotion}"`)
        } else {
          result.warnings.push(`Emotion "${emotion}" should be handled age-appropriately`)
        }
      } else {
        result.warnings.push(`Unknown emotional focus: "${emotion}" - verify it's appropriate for ${schoolLevel}`)
      }
    }
  }

  return result
}

/**
 * Age-aware generated story validation
 */
export function validateGeneratedStoryForAge(
  story: {
    title: string
    description: string
    pages: Array<{ text_content: string; illustration_prompt: string }>
  },
  ageBand: AgeBand
): ContentValidationResult {
  const result: ContentValidationResult = {
    isValid: true,
    violations: [],
    warnings: [],
    suggestions: [],
  }

  // Validate title
  const titleResult = validateTextContentForAge(story.title, ageBand)
  if (!titleResult.isValid) {
    result.violations.push(`Title: ${titleResult.violations.join(', ')}`)
  }
  result.warnings.push(...titleResult.warnings.map(w => `Title: ${w}`))

  // Validate description
  const descResult = validateTextContentForAge(story.description, ageBand)
  if (!descResult.isValid) {
    result.violations.push(`Description: ${descResult.violations.join(', ')}`)
  }
  result.warnings.push(...descResult.warnings.map(w => `Description: ${w}`))

  // Validate each page
  for (let i = 0; i < story.pages.length; i++) {
    const page = story.pages[i]
    const pageNum = i + 1

    // Validate text content
    const textResult = validateTextContentForAge(page.text_content, ageBand)
    if (!textResult.isValid) {
      result.violations.push(`Page ${pageNum} text: ${textResult.violations.join(', ')}`)
    }
    result.warnings.push(...textResult.warnings.map(w => `Page ${pageNum}: ${w}`))

    // Validate illustration prompt
    const illustrationResult = validateIllustrationPromptForAge(page.illustration_prompt, ageBand)
    if (!illustrationResult.isValid) {
      result.violations.push(`Page ${pageNum} illustration: ${illustrationResult.violations.join(', ')}`)
    }
    result.warnings.push(...illustrationResult.warnings.map(w => `Page ${pageNum} illustration: ${w}`))
  }

  result.isValid = result.violations.length === 0

  return result
}

/**
 * Age-aware illustration prompt validation
 */
export function validateIllustrationPromptForAge(
  prompt: string,
  ageBand: AgeBand
): ContentValidationResult {
  const result: ContentValidationResult = {
    isValid: true,
    violations: [],
    warnings: [],
    suggestions: [],
  }

  const lowerPrompt = prompt.toLowerCase()
  const schoolLevel = getSchoolLevel(ageBand)

  // Universal prohibitions (all ages)
  const universallyProhibited = [
    'revealing',
    'suggestive',
    'seductive',
    'sexy',
    'provocative',
    'alluring',
    'intimate setting',
    'naked',
    'nude',
  ]

  for (const element of universallyProhibited) {
    if (lowerPrompt.includes(element)) {
      result.isValid = false
      result.violations.push(`Prohibited illustration element: "${element}"`)
    }
  }

  // Age-specific checks
  if (schoolLevel === 'early_childhood' || schoolLevel === 'elementary') {
    // Strict checks for romantic imagery
    const romanticImagery = [
      'holding hands romantically',
      'gazing into eyes',
      'romantic pose',
      'couple pose',
      'wedding',
      'kissing',
      'embracing romantically',
      'love hearts',
      'romantic hearts',
      'blushing at each other',
    ]

    for (const imagery of romanticImagery) {
      if (lowerPrompt.includes(imagery)) {
        result.isValid = false
        result.violations.push(`Prohibited imagery for ${schoolLevel}: "${imagery}"`)
      }
    }

    // Warnings for ambiguous content
    if (lowerPrompt.includes('heart') && !lowerPrompt.includes('family')) {
      result.warnings.push('Heart imagery detected - ensure it represents family love, not romantic')
    }
  } else if (schoolLevel === 'middle_school') {
    // Moderate checks
    const cautionImagery = ['romantic pose', 'couple pose', 'kissing on lips']
    for (const imagery of cautionImagery) {
      if (lowerPrompt.includes(imagery)) {
        result.warnings.push(`Imagery "${imagery}" should be handled age-appropriately for middle school`)
      }
    }
  }
  // High school has fewer restrictions on illustration prompts

  return result
}

/**
 * Get content safety summary for age band
 */
export function getContentSafetySummary(ageBand: AgeBand): {
  schoolLevel: SchoolLevel
  restrictionLevel: 'strict' | 'moderate' | 'permissive'
  prohibitedTermCount: number
  permittedThemeCount: number
  guidelines: string[]
} {
  const schoolLevel = getSchoolLevel(ageBand)
  const prohibitedTerms = getProhibitedTermsForAge(ageBand)
  const permittedThemes = getPermittedThemesForAge(ageBand)

  let restrictionLevel: 'strict' | 'moderate' | 'permissive'
  let guidelines: string[]

  switch (schoolLevel) {
    case 'early_childhood':
    case 'elementary':
      restrictionLevel = 'strict'
      guidelines = [
        'No romantic themes or relationships',
        'Focus on family, friendship, and learning',
        'Simple, age-appropriate emotional themes',
        'No appearance-focused content',
        'Safe, nurturing environments only',
      ]
      break

    case 'middle_school':
      restrictionLevel = 'moderate'
      guidelines = [
        'Age-appropriate identity exploration',
        'Peer relationships without romantic focus',
        'Social challenges handled thoughtfully',
        'Complex emotions with guidance',
        'No explicit romantic content',
      ]
      break

    case 'high_school':
      restrictionLevel = 'permissive'
      guidelines = [
        'Mature themes handled appropriately',
        'Age-appropriate relationship awareness',
        'Complex social and ethical themes',
        'No explicit or sexualized content',
        'Universal prohibitions still apply',
      ]
      break

    default:
      restrictionLevel = 'strict'
      guidelines = ['Default to strictest content guidelines']
  }

  return {
    schoolLevel,
    restrictionLevel,
    prohibitedTermCount: prohibitedTerms.length,
    permittedThemeCount: permittedThemes.length,
    guidelines,
  }
}
