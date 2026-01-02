/**
 * StorySprout Content Safety Validation
 *
 * Enforces Child Life & Content Neutrality Guardrails
 * All child-focused content must remain strictly age-appropriate,
 * non-romantic, and non-sexualized in nature.
 */

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
