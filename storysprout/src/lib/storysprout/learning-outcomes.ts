/**
 * StorySprout Learning Outcomes Analysis
 *
 * Functions for analyzing, tracking, and reporting on learning outcomes
 * from stories and child reading progress.
 */

import {
  AgeBand,
  StoryCategory,
  SchoolLevel,
  CoreValue,
  SocialSkill,
  EmotionalSkill,
  BehaviorLesson,
  StoryLearningOutcomes,
  ValueLesson,
  SocialSkillLesson,
  EmotionalSkillLesson,
  VocabularyWord,
  SightWordEntry,
  ChildLearningProgress,
  LearningOutcomesSummary,
  AGE_BANDS,
  getSchoolLevel,
  getValuesForAgeBand,
  getSocialSkillsForSchoolLevel,
  VALUE_AGE_APPROPRIATENESS,
  calculateLearningScore,
} from './types'

// =====================================================
// LEARNING OUTCOMES ANALYSIS
// =====================================================

/**
 * Analyze learning outcomes from a generated story
 */
export function analyzeStoryLearningOutcomes(
  storyId: string,
  storyContent: {
    title: string
    pages: Array<{ text_content: string; vocabulary_on_page?: Array<{ word: string; definition: string }> }>
    discussion_questions?: string[]
    learning_outcomes?: Partial<StoryLearningOutcomes>
  },
  ageBand: AgeBand,
  sightWordsForGrade: string[]
): StoryLearningOutcomes {
  const fullText = storyContent.pages.map(p => p.text_content).join(' ')
  const words = fullText.toLowerCase().split(/\s+/)

  // Analyze sight words
  const sightWordAnalysis = analyzeSightWords(words, sightWordsForGrade, storyContent.pages)

  // Analyze vocabulary
  const vocabularyAnalysis = analyzeVocabulary(storyContent.pages, ageBand)

  // Get learning outcomes from generation or create defaults
  const generatedOutcomes = storyContent.learning_outcomes || {}

  const outcomes: StoryLearningOutcomes = {
    story_id: storyId,

    // Vocabulary
    sight_words: sightWordAnalysis.entries,
    sight_word_count: sightWordAnalysis.totalCount,
    vocabulary_words: vocabularyAnalysis.words,
    vocabulary_count: vocabularyAnalysis.words.length,
    vocabulary_difficulty_avg: vocabularyAnalysis.averageDifficulty,

    // Values
    value_lessons: generatedOutcomes.value_lessons || [],
    primary_value: generatedOutcomes.primary_value || detectPrimaryValue(fullText),
    secondary_values: generatedOutcomes.secondary_values || [],

    // Skills
    social_skills: generatedOutcomes.social_skills || [],
    emotional_skills: generatedOutcomes.emotional_skills || [],
    behavior_lessons: generatedOutcomes.behavior_lessons || [],

    // Curriculum
    curriculum_standards: generatedOutcomes.curriculum_standards || [],

    // Metrics
    estimated_learning_time_minutes: estimateLearningTime(words.length, ageBand),
    recommended_discussion_time_minutes: Math.ceil((storyContent.discussion_questions?.length || 2) * 2),
    comprehension_question_count: storyContent.discussion_questions?.length || 0,

    // Difficulty
    overall_difficulty: generatedOutcomes.overall_difficulty || calculateOverallDifficulty(ageBand, vocabularyAnalysis.averageDifficulty),
    reading_complexity: generatedOutcomes.reading_complexity || calculateReadingComplexity(words, ageBand),
    concept_complexity: generatedOutcomes.concept_complexity || 2,

    // Metadata
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    generated_by: 'ai',
  }

  return outcomes
}

/**
 * Analyze sight words in story content
 */
function analyzeSightWords(
  words: string[],
  sightWordsForGrade: string[],
  pages: Array<{ text_content: string }>
): { entries: SightWordEntry[]; totalCount: number } {
  const sightWordSet = new Set(sightWordsForGrade.map(w => w.toLowerCase()))
  const wordCounts = new Map<string, { count: number; pages: number[] }>()

  // Count occurrences across all pages
  pages.forEach((page, pageIndex) => {
    const pageWords = page.text_content.toLowerCase().split(/\s+/)
    pageWords.forEach(word => {
      const cleanWord = word.replace(/[^a-z]/g, '')
      if (sightWordSet.has(cleanWord)) {
        const existing = wordCounts.get(cleanWord) || { count: 0, pages: [] }
        existing.count++
        if (!existing.pages.includes(pageIndex + 1)) {
          existing.pages.push(pageIndex + 1)
        }
        wordCounts.set(cleanWord, existing)
      }
    })
  })

  const entries: SightWordEntry[] = Array.from(wordCounts.entries()).map(([word, data]) => ({
    word,
    frequency: data.count,
    grade_level: 'pre_k' as AgeBand, // This would be determined by looking up the word
    positions: data.pages,
  }))

  const totalCount = entries.reduce((sum, e) => sum + e.frequency, 0)

  return { entries, totalCount }
}

/**
 * Analyze vocabulary words from pages
 */
function analyzeVocabulary(
  pages: Array<{ vocabulary_on_page?: Array<{ word: string; definition: string; context?: string }> }>,
  ageBand: AgeBand
): { words: VocabularyWord[]; averageDifficulty: number } {
  const vocabularyMap = new Map<string, VocabularyWord>()

  pages.forEach(page => {
    page.vocabulary_on_page?.forEach(vocab => {
      if (!vocabularyMap.has(vocab.word.toLowerCase())) {
        vocabularyMap.set(vocab.word.toLowerCase(), {
          word: vocab.word,
          definition: vocab.definition,
          part_of_speech: 'other',
          difficulty_level: estimateWordDifficulty(vocab.word),
          grade_level: ageBand,
          context_sentence: vocab.context || '',
        })
      }
    })
  })

  const words = Array.from(vocabularyMap.values())
  const averageDifficulty = words.length > 0
    ? words.reduce((sum, w) => sum + w.difficulty_level, 0) / words.length
    : 2

  return { words, averageDifficulty }
}

/**
 * Estimate word difficulty based on length and common patterns
 */
function estimateWordDifficulty(word: string): 1 | 2 | 3 | 4 | 5 {
  const length = word.length

  if (length <= 4) return 1
  if (length <= 6) return 2
  if (length <= 8) return 3
  if (length <= 10) return 4
  return 5
}

/**
 * Detect primary value from story text using keyword analysis
 */
function detectPrimaryValue(text: string): CoreValue {
  const lowerText = text.toLowerCase()

  const valueKeywords: Record<CoreValue, string[]> = {
    kindness: ['kind', 'kindness', 'nice', 'gentle', 'caring'],
    honesty: ['honest', 'truth', 'truthful', 'sincere'],
    respect: ['respect', 'polite', 'manners', 'considerate'],
    responsibility: ['responsible', 'duty', 'care for', 'take care'],
    fairness: ['fair', 'equal', 'share equally', 'just'],
    caring: ['care', 'caring', 'love', 'nurture'],
    gratitude: ['thank', 'grateful', 'appreciate', 'gratitude'],
    patience: ['patient', 'wait', 'patience', 'calm'],
    courage: ['brave', 'courage', 'courageous', 'bold'],
    perseverance: ['keep trying', 'persist', 'never give up', 'determination'],
    sharing: ['share', 'sharing', 'give', 'generous'],
    cooperation: ['together', 'cooperate', 'teamwork', 'help each other'],
    empathy: ['understand', 'feel', 'empathy', 'compassion'],
    inclusion: ['include', 'everyone', 'belong', 'welcome'],
    friendship: ['friend', 'friendship', 'buddy', 'pal'],
    forgiveness: ['forgive', 'sorry', 'apologize', 'forgiveness'],
    generosity: ['generous', 'give', 'gift', 'donate'],
    helpfulness: ['help', 'helpful', 'assist', 'support'],
    integrity: ['honest', 'right thing', 'integrity', 'principle'],
    humility: ['humble', 'modest', 'humility'],
    self_discipline: ['control', 'discipline', 'focus', 'restrain'],
    curiosity: ['curious', 'wonder', 'explore', 'discover'],
    creativity: ['create', 'imagine', 'creative', 'invent'],
    optimism: ['positive', 'hope', 'optimistic', 'bright side'],
    resilience: ['bounce back', 'resilient', 'overcome', 'strong'],
    adaptability: ['adapt', 'change', 'flexible', 'adjust'],
    justice: ['justice', 'fair', 'right', 'equality'],
    citizenship: ['community', 'citizen', 'participate', 'civic'],
    environmental_stewardship: ['environment', 'nature', 'protect', 'earth'],
    cultural_appreciation: ['culture', 'tradition', 'heritage', 'celebrate'],
    leadership: ['lead', 'leader', 'guide', 'inspire'],
    service: ['serve', 'help others', 'volunteer', 'community'],
    critical_thinking: ['think', 'question', 'analyze', 'reason'],
    self_reflection: ['reflect', 'think about', 'learn from', 'understand yourself'],
  }

  let maxScore = 0
  let detectedValue: CoreValue = 'kindness'

  for (const [value, keywords] of Object.entries(valueKeywords)) {
    let score = 0
    for (const keyword of keywords) {
      const regex = new RegExp(keyword, 'gi')
      const matches = lowerText.match(regex)
      if (matches) {
        score += matches.length
      }
    }
    if (score > maxScore) {
      maxScore = score
      detectedValue = value as CoreValue
    }
  }

  return detectedValue
}

/**
 * Estimate learning time based on word count and age band
 */
function estimateLearningTime(wordCount: number, ageBand: AgeBand): number {
  const config = AGE_BANDS[ageBand]
  const schoolLevel = config.schoolLevel

  // Words per minute by school level (approximate)
  const wpmByLevel: Record<SchoolLevel, number> = {
    early_childhood: 20,
    elementary: 80,
    middle_school: 150,
    high_school: 200,
  }

  const wpm = wpmByLevel[schoolLevel]
  const readingTime = wordCount / wpm

  // Add time for comprehension activities
  const comprehensionMultiplier = schoolLevel === 'early_childhood' ? 2 : 1.5

  return Math.ceil(readingTime * comprehensionMultiplier)
}

/**
 * Calculate overall difficulty score
 */
function calculateOverallDifficulty(ageBand: AgeBand, vocabDifficulty: number): 1 | 2 | 3 | 4 | 5 {
  const config = AGE_BANDS[ageBand]
  const baseDifficulty = config.complexityLevel

  // Adjust based on vocabulary
  const adjusted = Math.round((baseDifficulty + vocabDifficulty) / 2)

  return Math.max(1, Math.min(5, adjusted)) as 1 | 2 | 3 | 4 | 5
}

/**
 * Calculate reading complexity based on sentence structure
 */
function calculateReadingComplexity(words: string[], ageBand: AgeBand): 1 | 2 | 3 | 4 | 5 {
  // Simple heuristic based on word count and average word length
  const avgWordLength = words.reduce((sum, w) => sum + w.length, 0) / words.length

  if (avgWordLength <= 3.5) return 1
  if (avgWordLength <= 4.5) return 2
  if (avgWordLength <= 5.5) return 3
  if (avgWordLength <= 6.5) return 4
  return 5
}

// =====================================================
// CHILD LEARNING PROGRESS ANALYSIS
// =====================================================

/**
 * Calculate child's learning progress across all dimensions
 */
export function calculateChildLearningProgress(
  childId: string,
  readingHistory: Array<{
    storyId: string
    outcomes: StoryLearningOutcomes
    completedAt: string
  }>,
  sightWordExposures: Array<{ word: string; exposureCount: number; isMastered: boolean }>,
  vocabularyProgress: Array<{ word: string; exposureCount: number; isLearned: boolean }>
): ChildLearningProgress {
  // Aggregate values encountered
  const valuesMap = new Map<CoreValue, { count: number; stories: string[] }>()
  readingHistory.forEach(({ storyId, outcomes }) => {
    if (outcomes.primary_value) {
      const existing = valuesMap.get(outcomes.primary_value) || { count: 0, stories: [] }
      existing.count++
      existing.stories.push(storyId)
      valuesMap.set(outcomes.primary_value, existing)
    }
    outcomes.secondary_values?.forEach(value => {
      const existing = valuesMap.get(value) || { count: 0, stories: [] }
      existing.count++
      existing.stories.push(storyId)
      valuesMap.set(value, existing)
    })
  })

  // Aggregate social skills practiced
  const socialSkillsMap = new Map<SocialSkill, number>()
  readingHistory.forEach(({ outcomes }) => {
    outcomes.social_skills?.forEach(lesson => {
      socialSkillsMap.set(lesson.skill, (socialSkillsMap.get(lesson.skill) || 0) + 1)
    })
  })

  // Aggregate emotional skills practiced
  const emotionalSkillsMap = new Map<EmotionalSkill, number>()
  readingHistory.forEach(({ outcomes }) => {
    outcomes.emotional_skills?.forEach(lesson => {
      emotionalSkillsMap.set(lesson.skill, (emotionalSkillsMap.get(lesson.skill) || 0) + 1)
    })
  })

  // Aggregate curriculum standards
  const standardsMap = new Map<string, number>()
  readingHistory.forEach(({ outcomes }) => {
    outcomes.curriculum_standards?.forEach(standard => {
      standardsMap.set(standard.code, (standardsMap.get(standard.code) || 0) + 1)
    })
  })

  // Calculate learning streak
  const sortedHistory = [...readingHistory].sort(
    (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
  )
  const streak = calculateLearningStreak(sortedHistory.map(h => h.completedAt))

  return {
    child_id: childId,

    // Vocabulary
    sight_words_mastered: sightWordExposures.filter(s => s.isMastered).length,
    sight_words_in_progress: sightWordExposures.filter(s => !s.isMastered).length,
    vocabulary_words_learned: vocabularyProgress.filter(v => v.isLearned).length,

    // Values
    values_encountered: Array.from(valuesMap.entries()).map(([value, data]) => ({
      value,
      exposure_count: data.count,
      stories: data.stories,
    })),

    // Skills
    social_skills_practiced: Array.from(socialSkillsMap.entries()).map(([skill, count]) => ({
      skill,
      practice_count: count,
    })),
    emotional_skills_practiced: Array.from(emotionalSkillsMap.entries()).map(([skill, count]) => ({
      skill,
      practice_count: count,
    })),

    // Standards
    curriculum_standards_progress: Array.from(standardsMap.entries()).map(([code, count]) => ({
      code,
      stories_completed: count,
    })),

    // Overall
    total_stories_with_outcomes: readingHistory.length,
    learning_streak_days: streak,
    last_learning_activity: sortedHistory[0]?.completedAt || new Date().toISOString(),
  }
}

/**
 * Calculate learning streak in days
 */
function calculateLearningStreak(completedDates: string[]): number {
  if (completedDates.length === 0) return 0

  const dates = completedDates
    .map(d => new Date(d).toDateString())
    .filter((d, i, arr) => arr.indexOf(d) === i) // Unique dates
    .map(d => new Date(d))
    .sort((a, b) => b.getTime() - a.getTime())

  let streak = 1
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const lastActivity = dates[0]
  lastActivity.setHours(0, 0, 0, 0)

  // Check if last activity was today or yesterday
  const daysSinceLastActivity = Math.floor(
    (today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)
  )

  if (daysSinceLastActivity > 1) return 0

  // Count consecutive days
  for (let i = 1; i < dates.length; i++) {
    const diff = Math.floor(
      (dates[i - 1].getTime() - dates[i].getTime()) / (1000 * 60 * 60 * 24)
    )
    if (diff === 1) {
      streak++
    } else {
      break
    }
  }

  return streak
}

// =====================================================
// LEARNING GAP ANALYSIS
// =====================================================

/**
 * Identify learning gaps for a child
 */
export function identifyLearningGaps(
  progress: ChildLearningProgress,
  ageBand: AgeBand
): {
  underexposedValues: CoreValue[]
  unpracticedSocialSkills: SocialSkill[]
  unpracticedEmotionalSkills: EmotionalSkill[]
  recommendations: string[]
} {
  const schoolLevel = getSchoolLevel(ageBand)

  // Get all appropriate values and skills for this age
  const appropriateValues = getValuesForAgeBand(ageBand)
  const appropriateSocialSkills = getSocialSkillsForSchoolLevel(schoolLevel)

  // Find underexposed values (less than 2 exposures)
  const exposedValues = new Set(progress.values_encountered.map(v => v.value))
  const underexposedValues = appropriateValues.filter(v =>
    !exposedValues.has(v) ||
    (progress.values_encountered.find(ve => ve.value === v)?.exposure_count || 0) < 2
  )

  // Find unpracticed social skills
  const practicedSocialSkills = new Set(progress.social_skills_practiced.map(s => s.skill))
  const unpracticedSocialSkills = appropriateSocialSkills.filter(s => !practicedSocialSkills.has(s))

  // Find unpracticed emotional skills (basic set for each level)
  const emotionalSkillsByLevel: Record<SchoolLevel, EmotionalSkill[]> = {
    early_childhood: ['identifying_basic_emotions', 'naming_feelings', 'asking_for_comfort'],
    elementary: ['expressing_feelings_appropriately', 'calming_down_strategies', 'managing_anger'],
    middle_school: ['emotional_awareness', 'stress_management', 'growth_mindset'],
    high_school: ['emotional_intelligence', 'self_compassion', 'managing_complex_emotions'],
  }
  const appropriateEmotionalSkills = emotionalSkillsByLevel[schoolLevel]
  const practicedEmotionalSkills = new Set(progress.emotional_skills_practiced.map(s => s.skill))
  const unpracticedEmotionalSkills = appropriateEmotionalSkills.filter(s => !practicedEmotionalSkills.has(s))

  // Generate recommendations
  const recommendations: string[] = []

  if (underexposedValues.length > 0) {
    const topValues = underexposedValues.slice(0, 3)
    recommendations.push(
      `Explore stories that teach: ${topValues.map(v => VALUE_AGE_APPROPRIATENESS[v].description).join(', ')}`
    )
  }

  if (unpracticedSocialSkills.length > 0) {
    recommendations.push(
      `Try stories that demonstrate: ${unpracticedSocialSkills.slice(0, 2).map(s => s.replace(/_/g, ' ')).join(', ')}`
    )
  }

  if (progress.sight_words_in_progress > progress.sight_words_mastered) {
    recommendations.push('Continue practicing sight words - great progress!')
  }

  if (progress.learning_streak_days === 0) {
    recommendations.push('Start a reading streak today!')
  } else if (progress.learning_streak_days >= 7) {
    recommendations.push(`Amazing! ${progress.learning_streak_days}-day reading streak! Keep it up!`)
  }

  return {
    underexposedValues: underexposedValues.slice(0, 5),
    unpracticedSocialSkills: unpracticedSocialSkills.slice(0, 5),
    unpracticedEmotionalSkills,
    recommendations,
  }
}

// =====================================================
// SUMMARY GENERATION
// =====================================================

/**
 * Generate a summary of learning outcomes for reporting
 */
export function generateLearningOutcomesSummary(
  outcomes: StoryLearningOutcomes[]
): LearningOutcomesSummary {
  const allValues = new Set<CoreValue>()
  const allSocialSkills = new Set<SocialSkill>()
  const allEmotionalSkills = new Set<EmotionalSkill>()
  const allStandards = new Set<string>()

  let totalSightWords = 0
  let totalVocabulary = 0
  let totalDifficulty = 0

  outcomes.forEach(o => {
    totalSightWords += o.sight_word_count
    totalVocabulary += o.vocabulary_count
    totalDifficulty += o.overall_difficulty

    if (o.primary_value) allValues.add(o.primary_value)
    o.secondary_values?.forEach(v => allValues.add(v))

    o.social_skills?.forEach(s => allSocialSkills.add(s.skill))
    o.emotional_skills?.forEach(s => allEmotionalSkills.add(s.skill))
    o.curriculum_standards?.forEach(s => allStandards.add(s.code))
  })

  return {
    total_sight_words_introduced: totalSightWords,
    total_vocabulary_words: totalVocabulary,
    values_covered: Array.from(allValues),
    social_skills_covered: Array.from(allSocialSkills),
    emotional_skills_covered: Array.from(allEmotionalSkills),
    curriculum_standards_met: Array.from(allStandards),
    average_difficulty: outcomes.length > 0 ? totalDifficulty / outcomes.length : 2,
  }
}

/**
 * Format learning progress for parent/teacher report
 */
export function formatLearningProgressReport(
  progress: ChildLearningProgress,
  childName: string,
  ageBand: AgeBand
): {
  summary: string
  strengths: string[]
  growthAreas: string[]
  achievements: string[]
} {
  const gaps = identifyLearningGaps(progress, ageBand)

  // Identify strengths
  const strengths: string[] = []
  if (progress.sight_words_mastered > 10) {
    strengths.push(`Mastered ${progress.sight_words_mastered} sight words!`)
  }
  if (progress.values_encountered.length >= 5) {
    strengths.push(`Explored ${progress.values_encountered.length} different character values`)
  }
  if (progress.learning_streak_days >= 3) {
    strengths.push(`Maintained a ${progress.learning_streak_days}-day reading streak`)
  }

  // Most practiced value
  const topValue = progress.values_encountered
    .sort((a, b) => b.exposure_count - a.exposure_count)[0]
  if (topValue) {
    strengths.push(`Strong understanding of ${topValue.value.replace(/_/g, ' ')}`)
  }

  // Growth areas
  const growthAreas = gaps.recommendations

  // Achievements
  const achievements: string[] = []
  if (progress.total_stories_with_outcomes >= 10) {
    achievements.push('📚 Super Reader: 10+ stories completed')
  }
  if (progress.sight_words_mastered >= 20) {
    achievements.push('🌟 Word Wizard: 20+ sight words mastered')
  }
  if (progress.values_encountered.length >= 10) {
    achievements.push('💝 Value Champion: Explored 10+ character values')
  }
  if (progress.learning_streak_days >= 7) {
    achievements.push('🔥 Week Warrior: 7-day reading streak')
  }

  const summary = `${childName} has completed ${progress.total_stories_with_outcomes} stories, ` +
    `mastered ${progress.sight_words_mastered} sight words, and explored ${progress.values_encountered.length} ` +
    `character values. ${progress.learning_streak_days > 0 ? `Currently on a ${progress.learning_streak_days}-day streak!` : ''}`

  return {
    summary,
    strengths,
    growthAreas,
    achievements,
  }
}

// =====================================================
// CLASSROOM ANALYTICS
// =====================================================

/**
 * Aggregate learning progress for a classroom
 */
export function aggregateClassroomLearning(
  studentProgress: ChildLearningProgress[]
): {
  totalStudents: number
  averageSightWordsMastered: number
  averageVocabularyLearned: number
  totalStoriesCompleted: number
  mostCommonValues: Array<{ value: CoreValue; studentCount: number }>
  classStrengths: string[]
  classGrowthAreas: string[]
} {
  if (studentProgress.length === 0) {
    return {
      totalStudents: 0,
      averageSightWordsMastered: 0,
      averageVocabularyLearned: 0,
      totalStoriesCompleted: 0,
      mostCommonValues: [],
      classStrengths: [],
      classGrowthAreas: [],
    }
  }

  const totalStudents = studentProgress.length
  const avgSightWords = studentProgress.reduce((sum, p) => sum + p.sight_words_mastered, 0) / totalStudents
  const avgVocab = studentProgress.reduce((sum, p) => sum + p.vocabulary_words_learned, 0) / totalStudents
  const totalStories = studentProgress.reduce((sum, p) => sum + p.total_stories_with_outcomes, 0)

  // Count value exposure across students
  const valueStudentCount = new Map<CoreValue, number>()
  studentProgress.forEach(p => {
    const studentValues = new Set(p.values_encountered.map(v => v.value))
    studentValues.forEach(value => {
      valueStudentCount.set(value, (valueStudentCount.get(value) || 0) + 1)
    })
  })

  const mostCommonValues = Array.from(valueStudentCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([value, studentCount]) => ({ value, studentCount }))

  // Identify class strengths and growth areas
  const classStrengths: string[] = []
  const classGrowthAreas: string[] = []

  if (avgSightWords >= 15) {
    classStrengths.push('Strong sight word recognition across the class')
  } else if (avgSightWords < 8) {
    classGrowthAreas.push('Focus on sight word practice')
  }

  const avgStreak = studentProgress.reduce((sum, p) => sum + p.learning_streak_days, 0) / totalStudents
  if (avgStreak >= 3) {
    classStrengths.push('Good reading consistency')
  } else {
    classGrowthAreas.push('Encourage daily reading habits')
  }

  return {
    totalStudents,
    averageSightWordsMastered: Math.round(avgSightWords * 10) / 10,
    averageVocabularyLearned: Math.round(avgVocab * 10) / 10,
    totalStoriesCompleted: totalStories,
    mostCommonValues,
    classStrengths,
    classGrowthAreas,
  }
}

// =====================================================
// STORY RECOMMENDATIONS
// =====================================================

/**
 * Get story recommendations based on learning gaps
 */
export function getStoryRecommendations(
  progress: ChildLearningProgress,
  ageBand: AgeBand,
  availableStories: Array<{ id: string; outcomes: StoryLearningOutcomes; title: string }>
): Array<{ story: { id: string; title: string }; reason: string; priority: number }> {
  const gaps = identifyLearningGaps(progress, ageBand)
  const recommendations: Array<{ story: { id: string; title: string }; reason: string; priority: number }> = []

  // Find stories that address underexposed values
  gaps.underexposedValues.forEach((value, index) => {
    const matchingStory = availableStories.find(s =>
      s.outcomes.primary_value === value ||
      s.outcomes.secondary_values?.includes(value)
    )
    if (matchingStory) {
      recommendations.push({
        story: { id: matchingStory.id, title: matchingStory.title },
        reason: `Teaches ${value.replace(/_/g, ' ')} - a value to explore`,
        priority: index + 1,
      })
    }
  })

  // Find stories that practice unpracticed social skills
  gaps.unpracticedSocialSkills.forEach((skill, index) => {
    const matchingStory = availableStories.find(s =>
      s.outcomes.social_skills?.some(ss => ss.skill === skill)
    )
    if (matchingStory && !recommendations.find(r => r.story.id === matchingStory.id)) {
      recommendations.push({
        story: { id: matchingStory.id, title: matchingStory.title },
        reason: `Demonstrates ${skill.replace(/_/g, ' ')}`,
        priority: gaps.underexposedValues.length + index + 1,
      })
    }
  })

  return recommendations.sort((a, b) => a.priority - b.priority).slice(0, 5)
}
