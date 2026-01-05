/**
 * StorySprout Reading Performance Analytics
 *
 * Calculates and tracks reading performance metrics including:
 * - Words per minute (WPM) and reading fluency
 * - Reading speed progression over time
 * - Age-band benchmarking
 * - Struggling reader identification
 */

import { AgeBand, SchoolLevel, AGE_BANDS, getSchoolLevel } from '../storysprout/types'

// =====================================================
// TYPES
// =====================================================

export interface ReadingSessionData {
  sessionId: string
  childId: string
  storyId: string
  startedAt: Date
  endedAt?: Date
  totalDurationSeconds: number
  activeReadingSeconds: number
  wordsRead: number
  pagesViewed: number
  pagesCompleted: number
  pauseCount: number
  totalPauseDurationSeconds: number
  wordTaps: number
  audioPlays: number
  completionPercentage: number
  isCompleted: boolean
  abandonedAtPage?: number
  readingMode: string
}

export interface ReadingPerformanceMetrics {
  // Speed metrics
  wordsPerMinute: number
  adjustedWpm: number  // Excluding pauses
  readingSpeedLevel: 'emerging' | 'developing' | 'proficient' | 'advanced'
  speedPercentile: number

  // Fluency metrics
  fluencyScore: number  // 0-100
  consistencyScore: number  // How consistent is reading speed

  // Engagement metrics
  engagementScore: number  // 0-100
  attentionSpan: number  // Average time before pause
  interactionRate: number  // Word taps per 100 words

  // Progress indicators
  improvementTrend: 'improving' | 'stable' | 'declining'
  streakDays: number
  totalReadingMinutes: number
}

export interface AgeGroupBenchmarks {
  ageBand: AgeBand
  schoolLevel: SchoolLevel
  expectedWpmRange: [number, number]
  expectedCompletionRate: number
  expectedSessionLength: number  // minutes
  fluencyBenchmarks: {
    emerging: [number, number]
    developing: [number, number]
    proficient: [number, number]
    advanced: [number, number]
  }
}

export interface StrugglingReaderIndicators {
  isAtRisk: boolean
  riskLevel: 'none' | 'low' | 'moderate' | 'high'
  indicators: string[]
  recommendations: string[]
}

// =====================================================
// BENCHMARKS BY AGE BAND
// =====================================================

export const READING_BENCHMARKS: Record<AgeBand, AgeGroupBenchmarks> = {
  pre_k: {
    ageBand: 'pre_k',
    schoolLevel: 'early_childhood',
    expectedWpmRange: [10, 30],
    expectedCompletionRate: 0.7,
    expectedSessionLength: 5,
    fluencyBenchmarks: {
      emerging: [0, 15],
      developing: [15, 25],
      proficient: [25, 35],
      advanced: [35, 100],
    },
  },
  k_prep: {
    ageBand: 'k_prep',
    schoolLevel: 'early_childhood',
    expectedWpmRange: [20, 50],
    expectedCompletionRate: 0.75,
    expectedSessionLength: 8,
    fluencyBenchmarks: {
      emerging: [0, 25],
      developing: [25, 40],
      proficient: [40, 55],
      advanced: [55, 100],
    },
  },
  grade_1: {
    ageBand: 'grade_1',
    schoolLevel: 'elementary',
    expectedWpmRange: [30, 70],
    expectedCompletionRate: 0.8,
    expectedSessionLength: 10,
    fluencyBenchmarks: {
      emerging: [0, 40],
      developing: [40, 60],
      proficient: [60, 80],
      advanced: [80, 150],
    },
  },
  grade_2: {
    ageBand: 'grade_2',
    schoolLevel: 'elementary',
    expectedWpmRange: [50, 100],
    expectedCompletionRate: 0.82,
    expectedSessionLength: 12,
    fluencyBenchmarks: {
      emerging: [0, 60],
      developing: [60, 85],
      proficient: [85, 110],
      advanced: [110, 180],
    },
  },
  grade_3: {
    ageBand: 'grade_3',
    schoolLevel: 'elementary',
    expectedWpmRange: [70, 120],
    expectedCompletionRate: 0.85,
    expectedSessionLength: 15,
    fluencyBenchmarks: {
      emerging: [0, 80],
      developing: [80, 105],
      proficient: [105, 130],
      advanced: [130, 200],
    },
  },
  grade_4: {
    ageBand: 'grade_4',
    schoolLevel: 'elementary',
    expectedWpmRange: [90, 140],
    expectedCompletionRate: 0.85,
    expectedSessionLength: 18,
    fluencyBenchmarks: {
      emerging: [0, 100],
      developing: [100, 125],
      proficient: [125, 150],
      advanced: [150, 220],
    },
  },
  grade_5: {
    ageBand: 'grade_5',
    schoolLevel: 'elementary',
    expectedWpmRange: [100, 160],
    expectedCompletionRate: 0.87,
    expectedSessionLength: 20,
    fluencyBenchmarks: {
      emerging: [0, 115],
      developing: [115, 140],
      proficient: [140, 170],
      advanced: [170, 250],
    },
  },
  grade_6: {
    ageBand: 'grade_6',
    schoolLevel: 'middle_school',
    expectedWpmRange: [120, 180],
    expectedCompletionRate: 0.88,
    expectedSessionLength: 25,
    fluencyBenchmarks: {
      emerging: [0, 130],
      developing: [130, 160],
      proficient: [160, 190],
      advanced: [190, 280],
    },
  },
  grade_7: {
    ageBand: 'grade_7',
    schoolLevel: 'middle_school',
    expectedWpmRange: [140, 200],
    expectedCompletionRate: 0.88,
    expectedSessionLength: 28,
    fluencyBenchmarks: {
      emerging: [0, 150],
      developing: [150, 180],
      proficient: [180, 210],
      advanced: [210, 300],
    },
  },
  grade_8: {
    ageBand: 'grade_8',
    schoolLevel: 'middle_school',
    expectedWpmRange: [160, 220],
    expectedCompletionRate: 0.9,
    expectedSessionLength: 30,
    fluencyBenchmarks: {
      emerging: [0, 170],
      developing: [170, 200],
      proficient: [200, 230],
      advanced: [230, 320],
    },
  },
  grade_9: {
    ageBand: 'grade_9',
    schoolLevel: 'high_school',
    expectedWpmRange: [180, 250],
    expectedCompletionRate: 0.9,
    expectedSessionLength: 35,
    fluencyBenchmarks: {
      emerging: [0, 190],
      developing: [190, 220],
      proficient: [220, 260],
      advanced: [260, 350],
    },
  },
  grade_10: {
    ageBand: 'grade_10',
    schoolLevel: 'high_school',
    expectedWpmRange: [200, 280],
    expectedCompletionRate: 0.9,
    expectedSessionLength: 40,
    fluencyBenchmarks: {
      emerging: [0, 210],
      developing: [210, 250],
      proficient: [250, 290],
      advanced: [290, 380],
    },
  },
  grade_11: {
    ageBand: 'grade_11',
    schoolLevel: 'high_school',
    expectedWpmRange: [220, 300],
    expectedCompletionRate: 0.92,
    expectedSessionLength: 45,
    fluencyBenchmarks: {
      emerging: [0, 230],
      developing: [230, 270],
      proficient: [270, 310],
      advanced: [310, 400],
    },
  },
  grade_12: {
    ageBand: 'grade_12',
    schoolLevel: 'high_school',
    expectedWpmRange: [240, 320],
    expectedCompletionRate: 0.92,
    expectedSessionLength: 50,
    fluencyBenchmarks: {
      emerging: [0, 250],
      developing: [250, 290],
      proficient: [290, 330],
      advanced: [330, 420],
    },
  },
}

// =====================================================
// PERFORMANCE CALCULATIONS
// =====================================================

/**
 * Calculate reading performance metrics from a session
 */
export function calculateReadingPerformance(
  session: ReadingSessionData,
  ageBand: AgeBand,
  historicalSessions: ReadingSessionData[] = []
): ReadingPerformanceMetrics {
  const benchmarks = READING_BENCHMARKS[ageBand]

  // Calculate WPM
  const readingMinutes = session.activeReadingSeconds / 60
  const wpm = readingMinutes > 0 ? session.wordsRead / readingMinutes : 0

  // Adjusted WPM (excluding pauses)
  const activeMinutes = (session.totalDurationSeconds - session.totalPauseDurationSeconds) / 60
  const adjustedWpm = activeMinutes > 0 ? session.wordsRead / activeMinutes : wpm

  // Determine reading speed level
  const speedLevel = determineSpeedLevel(adjustedWpm, benchmarks)

  // Calculate percentile (simplified - would need peer data in production)
  const speedPercentile = calculateSpeedPercentile(adjustedWpm, benchmarks)

  // Fluency score
  const fluencyScore = calculateFluencyScore(session, benchmarks)

  // Consistency score (based on historical data)
  const consistencyScore = calculateConsistencyScore(historicalSessions)

  // Engagement score
  const engagementScore = calculateEngagementScore(session, benchmarks)

  // Attention span (average time between pauses)
  const attentionSpan = session.pauseCount > 0
    ? (session.activeReadingSeconds / session.pauseCount) / 60
    : session.activeReadingSeconds / 60

  // Interaction rate
  const interactionRate = session.wordsRead > 0
    ? (session.wordTaps / session.wordsRead) * 100
    : 0

  // Improvement trend
  const improvementTrend = calculateImprovementTrend(historicalSessions, wpm)

  // Streak and total minutes
  const { streakDays, totalMinutes } = calculateStreakAndTotal(historicalSessions)

  return {
    wordsPerMinute: Math.round(wpm * 10) / 10,
    adjustedWpm: Math.round(adjustedWpm * 10) / 10,
    readingSpeedLevel: speedLevel,
    speedPercentile,
    fluencyScore,
    consistencyScore,
    engagementScore,
    attentionSpan: Math.round(attentionSpan * 10) / 10,
    interactionRate: Math.round(interactionRate * 10) / 10,
    improvementTrend,
    streakDays,
    totalReadingMinutes: totalMinutes,
  }
}

/**
 * Determine reading speed level based on benchmarks
 */
function determineSpeedLevel(
  wpm: number,
  benchmarks: AgeGroupBenchmarks
): 'emerging' | 'developing' | 'proficient' | 'advanced' {
  const { fluencyBenchmarks } = benchmarks

  if (wpm >= fluencyBenchmarks.advanced[0]) return 'advanced'
  if (wpm >= fluencyBenchmarks.proficient[0]) return 'proficient'
  if (wpm >= fluencyBenchmarks.developing[0]) return 'developing'
  return 'emerging'
}

/**
 * Calculate speed percentile within age band
 */
function calculateSpeedPercentile(wpm: number, benchmarks: AgeGroupBenchmarks): number {
  const [min, max] = benchmarks.expectedWpmRange
  const range = max - min

  if (wpm <= min) return 10
  if (wpm >= max) return 90

  // Linear interpolation for simplicity
  const position = (wpm - min) / range
  return Math.round(10 + position * 80)
}

/**
 * Calculate fluency score (0-100)
 */
function calculateFluencyScore(
  session: ReadingSessionData,
  benchmarks: AgeGroupBenchmarks
): number {
  let score = 0

  // Completion contributes 30 points
  score += session.completionPercentage * 0.3

  // Reading speed contributes 40 points
  const wpmScore = calculateWpmScore(
    session.wordsRead / (session.activeReadingSeconds / 60),
    benchmarks
  )
  score += wpmScore * 0.4

  // Consistency (low pause rate) contributes 30 points
  const pauseRate = session.pauseCount / Math.max(session.pagesViewed, 1)
  const pauseScore = Math.max(0, 100 - pauseRate * 20)
  score += pauseScore * 0.3

  return Math.round(score)
}

/**
 * Calculate WPM score relative to benchmarks
 */
function calculateWpmScore(wpm: number, benchmarks: AgeGroupBenchmarks): number {
  const [min, max] = benchmarks.expectedWpmRange
  const target = (min + max) / 2

  if (wpm >= max) return 100
  if (wpm <= 0) return 0

  // Score based on proximity to target
  const ratio = wpm / target
  return Math.min(100, Math.round(ratio * 80))
}

/**
 * Calculate consistency score based on historical sessions
 */
function calculateConsistencyScore(sessions: ReadingSessionData[]): number {
  if (sessions.length < 3) return 70 // Default for insufficient data

  const wpms = sessions.map(s => {
    const minutes = s.activeReadingSeconds / 60
    return minutes > 0 ? s.wordsRead / minutes : 0
  }).filter(wpm => wpm > 0)

  if (wpms.length < 2) return 70

  // Calculate coefficient of variation
  const mean = wpms.reduce((a, b) => a + b, 0) / wpms.length
  const variance = wpms.reduce((sum, wpm) => sum + Math.pow(wpm - mean, 2), 0) / wpms.length
  const stdDev = Math.sqrt(variance)
  const cv = stdDev / mean

  // Lower CV = higher consistency
  return Math.max(0, Math.round(100 - cv * 100))
}

/**
 * Calculate engagement score
 */
function calculateEngagementScore(
  session: ReadingSessionData,
  benchmarks: AgeGroupBenchmarks
): number {
  let score = 0

  // Completion (40 points)
  score += session.completionPercentage * 0.4

  // Session length appropriateness (30 points)
  const expectedMinutes = benchmarks.expectedSessionLength
  const actualMinutes = session.totalDurationSeconds / 60
  const lengthRatio = actualMinutes / expectedMinutes
  const lengthScore = lengthRatio >= 0.8 && lengthRatio <= 1.5 ? 100 : Math.max(0, 100 - Math.abs(1 - lengthRatio) * 50)
  score += lengthScore * 0.3

  // Interaction (30 points)
  const hasInteraction = session.wordTaps > 0 || session.audioPlays > 0
  score += hasInteraction ? 30 : 15

  return Math.round(score)
}

/**
 * Calculate improvement trend
 */
function calculateImprovementTrend(
  sessions: ReadingSessionData[],
  currentWpm: number
): 'improving' | 'stable' | 'declining' {
  if (sessions.length < 5) return 'stable'

  // Get WPM from last 5 sessions
  const recentSessions = sessions.slice(-5)
  const recentWpms = recentSessions.map(s => {
    const minutes = s.activeReadingSeconds / 60
    return minutes > 0 ? s.wordsRead / minutes : 0
  })

  const avgRecentWpm = recentWpms.reduce((a, b) => a + b, 0) / recentWpms.length

  // Get WPM from previous 5 sessions
  const previousSessions = sessions.slice(-10, -5)
  if (previousSessions.length < 3) return 'stable'

  const previousWpms = previousSessions.map(s => {
    const minutes = s.activeReadingSeconds / 60
    return minutes > 0 ? s.wordsRead / minutes : 0
  })
  const avgPreviousWpm = previousWpms.reduce((a, b) => a + b, 0) / previousWpms.length

  const change = ((avgRecentWpm - avgPreviousWpm) / avgPreviousWpm) * 100

  if (change > 5) return 'improving'
  if (change < -5) return 'declining'
  return 'stable'
}

/**
 * Calculate streak and total reading minutes
 */
function calculateStreakAndTotal(sessions: ReadingSessionData[]): {
  streakDays: number
  totalMinutes: number
} {
  const totalMinutes = Math.round(
    sessions.reduce((sum, s) => sum + s.totalDurationSeconds, 0) / 60
  )

  // Calculate streak
  const dates = sessions
    .map(s => s.startedAt.toDateString())
    .filter((d, i, arr) => arr.indexOf(d) === i)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

  let streakDays = 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (let i = 0; i < dates.length; i++) {
    const sessionDate = new Date(dates[i])
    sessionDate.setHours(0, 0, 0, 0)

    const expectedDate = new Date(today)
    expectedDate.setDate(expectedDate.getDate() - i)

    if (sessionDate.getTime() === expectedDate.getTime()) {
      streakDays++
    } else if (i === 0 && sessionDate.getTime() === expectedDate.getTime() - 86400000) {
      // Allow for yesterday to count as start
      streakDays++
    } else {
      break
    }
  }

  return { streakDays, totalMinutes }
}

// =====================================================
// STRUGGLING READER IDENTIFICATION
// =====================================================

/**
 * Identify if a child is a struggling reader
 */
export function identifyStrugglingReader(
  metrics: ReadingPerformanceMetrics,
  ageBand: AgeBand,
  recentSessions: ReadingSessionData[]
): StrugglingReaderIndicators {
  const benchmarks = READING_BENCHMARKS[ageBand]
  const indicators: string[] = []
  const recommendations: string[] = []

  // Check reading speed
  const [minWpm] = benchmarks.expectedWpmRange
  if (metrics.wordsPerMinute < minWpm * 0.7) {
    indicators.push('Reading speed significantly below grade level')
    recommendations.push('Practice with easier texts at comfortable pace')
  } else if (metrics.wordsPerMinute < minWpm) {
    indicators.push('Reading speed slightly below grade level')
    recommendations.push('Increase reading practice time gradually')
  }

  // Check fluency
  if (metrics.fluencyScore < 50) {
    indicators.push('Low fluency score indicates choppy reading')
    recommendations.push('Try read-aloud practice with an adult')
  }

  // Check completion rate
  const avgCompletion = recentSessions.length > 0
    ? recentSessions.reduce((sum, s) => sum + s.completionPercentage, 0) / recentSessions.length
    : 0

  if (avgCompletion < 50) {
    indicators.push('Frequently abandons stories before completion')
    recommendations.push('Start with shorter stories to build confidence')
  }

  // Check engagement
  if (metrics.engagementScore < 40) {
    indicators.push('Low engagement during reading sessions')
    recommendations.push('Try interactive "Read With Me" mode')
  }

  // Check attention span
  const expectedAttention = benchmarks.expectedSessionLength / 3  // At least 3 pauses expected
  if (metrics.attentionSpan < expectedAttention * 0.5) {
    indicators.push('Frequent pauses suggest attention difficulties')
    recommendations.push('Take short breaks between pages')
  }

  // Check trend
  if (metrics.improvementTrend === 'declining') {
    indicators.push('Reading performance declining over time')
    recommendations.push('Consider consulting with a reading specialist')
  }

  // Determine risk level
  let riskLevel: 'none' | 'low' | 'moderate' | 'high' = 'none'
  if (indicators.length >= 4) {
    riskLevel = 'high'
  } else if (indicators.length >= 2) {
    riskLevel = 'moderate'
  } else if (indicators.length === 1) {
    riskLevel = 'low'
  }

  return {
    isAtRisk: indicators.length > 0,
    riskLevel,
    indicators,
    recommendations,
  }
}

// =====================================================
// PROGRESS TRACKING
// =====================================================

export interface ReadingProgressReport {
  period: 'daily' | 'weekly' | 'monthly'
  startDate: Date
  endDate: Date

  // Volume metrics
  storiesStarted: number
  storiesCompleted: number
  totalReadingMinutes: number
  totalWordsRead: number
  totalPagesRead: number

  // Performance metrics
  averageWpm: number
  averageCompletionRate: number
  averageEngagementScore: number

  // Progress
  wpmChangeFromPrevious: number
  completionRateChange: number

  // Achievements
  newSightWordsMastered: number
  newVocabularyLearned: number
  valuesEncountered: number

  // Highlights
  longestSession: number  // minutes
  fastestWpm: number
  mostReadCategory: string
}

/**
 * Generate a reading progress report
 */
export function generateProgressReport(
  sessions: ReadingSessionData[],
  previousPeriodSessions: ReadingSessionData[],
  sightWordsMastered: number,
  vocabularyLearned: number,
  valuesEncountered: number,
  period: 'daily' | 'weekly' | 'monthly'
): ReadingProgressReport {
  const now = new Date()
  let startDate: Date
  let endDate = now

  switch (period) {
    case 'daily':
      startDate = new Date(now.setHours(0, 0, 0, 0))
      break
    case 'weekly':
      const dayOfWeek = now.getDay()
      startDate = new Date(now)
      startDate.setDate(startDate.getDate() - dayOfWeek)
      startDate.setHours(0, 0, 0, 0)
      break
    case 'monthly':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1)
      break
  }

  // Calculate current period metrics
  const storiesStarted = new Set(sessions.map(s => s.storyId)).size
  const storiesCompleted = sessions.filter(s => s.isCompleted).length
  const totalReadingMinutes = Math.round(sessions.reduce((sum, s) => sum + s.totalDurationSeconds, 0) / 60)
  const totalWordsRead = sessions.reduce((sum, s) => sum + s.wordsRead, 0)
  const totalPagesRead = sessions.reduce((sum, s) => sum + s.pagesCompleted, 0)

  // Calculate averages
  const wpms = sessions.map(s => {
    const minutes = s.activeReadingSeconds / 60
    return minutes > 0 ? s.wordsRead / minutes : 0
  }).filter(wpm => wpm > 0)

  const averageWpm = wpms.length > 0 ? Math.round(wpms.reduce((a, b) => a + b, 0) / wpms.length) : 0

  const completionRates = sessions.map(s => s.completionPercentage)
  const averageCompletionRate = completionRates.length > 0
    ? Math.round(completionRates.reduce((a, b) => a + b, 0) / completionRates.length)
    : 0

  // Calculate previous period for comparison
  const prevWpms = previousPeriodSessions.map(s => {
    const minutes = s.activeReadingSeconds / 60
    return minutes > 0 ? s.wordsRead / minutes : 0
  }).filter(wpm => wpm > 0)

  const prevAverageWpm = prevWpms.length > 0
    ? prevWpms.reduce((a, b) => a + b, 0) / prevWpms.length
    : averageWpm

  const prevCompletionRates = previousPeriodSessions.map(s => s.completionPercentage)
  const prevAverageCompletion = prevCompletionRates.length > 0
    ? prevCompletionRates.reduce((a, b) => a + b, 0) / prevCompletionRates.length
    : averageCompletionRate

  // Calculate engagement (simplified)
  const avgEngagement = sessions.length > 0
    ? Math.round(sessions.reduce((sum, s) => sum + s.completionPercentage, 0) / sessions.length)
    : 0

  // Find highlights
  const longestSession = sessions.length > 0
    ? Math.round(Math.max(...sessions.map(s => s.totalDurationSeconds)) / 60)
    : 0

  const fastestWpm = wpms.length > 0 ? Math.round(Math.max(...wpms)) : 0

  return {
    period,
    startDate,
    endDate,
    storiesStarted,
    storiesCompleted,
    totalReadingMinutes,
    totalWordsRead,
    totalPagesRead,
    averageWpm,
    averageCompletionRate,
    averageEngagementScore: avgEngagement,
    wpmChangeFromPrevious: Math.round((averageWpm - prevAverageWpm) * 10) / 10,
    completionRateChange: Math.round((averageCompletionRate - prevAverageCompletion) * 10) / 10,
    newSightWordsMastered: sightWordsMastered,
    newVocabularyLearned: vocabularyLearned,
    valuesEncountered,
    longestSession,
    fastestWpm,
    mostReadCategory: 'adventure', // Would need category data in real implementation
  }
}

// =====================================================
// EXPORTS
// =====================================================

export {
  READING_BENCHMARKS,
  calculateReadingPerformance,
  identifyStrugglingReader,
  generateProgressReport,
}
