/**
 * StorySprout Content Performance Analytics
 *
 * Analyzes story and content performance metrics including:
 * - Story popularity scoring
 * - Completion rate analysis
 * - Engagement heatmaps
 * - Content recommendations
 */

import { AgeBand, StoryCategory } from '../storysprout/types'

// =====================================================
// TYPES
// =====================================================

export interface StoryPerformanceMetrics {
  storyId: string
  title: string
  category: StoryCategory
  ageBand: AgeBand

  // Engagement metrics
  totalViews: number
  uniqueReaders: number
  totalStarts: number
  totalCompletions: number
  completionRate: number

  // Reading metrics
  avgReadingTimeSeconds: number
  avgPagesPerSession: number
  totalReadingTimeSeconds: number

  // Popularity indicators
  favoritesCount: number
  reReads: number
  shareCount: number

  // Quality scores
  engagementScore: number
  bounceRate: number
  retentionScore: number

  // Page-level insights
  mostAbandonedPage: number
  avgTimePerPageSeconds: number
  difficultPages: number[]

  // Demographics
  ageBandDistribution: Record<AgeBand, number>
  regionDistribution: Record<string, number>
}

export interface ContentPerformanceSummary {
  period: {
    start: Date
    end: Date
    type: 'daily' | 'weekly' | 'monthly'
  }

  // Overall metrics
  totalStoriesViewed: number
  totalReadingMinutes: number
  avgCompletionRate: number

  // Top performers
  topByViews: StoryPerformanceMetrics[]
  topByCompletion: StoryPerformanceMetrics[]
  topByEngagement: StoryPerformanceMetrics[]

  // Category analysis
  categoryPerformance: Array<{
    category: StoryCategory
    views: number
    completionRate: number
    avgEngagement: number
  }>

  // Age band analysis
  ageBandPerformance: Array<{
    ageBand: AgeBand
    views: number
    completionRate: number
    avgReadingMinutes: number
  }>

  // Trends
  viewsTrend: Array<{ date: string; views: number }>
  completionTrend: Array<{ date: string; rate: number }>

  // Underperformers
  lowPerformingStories: Array<{
    storyId: string
    title: string
    issue: string
    recommendation: string
  }>
}

export interface PageEngagementData {
  pageNumber: number
  avgTimeSeconds: number
  dropOffRate: number
  wordTaps: number
  audioPlays: number
  isProblematic: boolean
  insights: string[]
}

// =====================================================
// PERFORMANCE CALCULATIONS
// =====================================================

/**
 * Calculate story engagement score (0-100)
 */
export function calculateEngagementScore(metrics: {
  completionRate: number
  avgReadingTimeSeconds: number
  expectedReadingTimeSeconds: number
  favoritesCount: number
  reReads: number
  bounceRate: number
}): number {
  let score = 0

  // Completion rate contributes 35%
  score += Math.min(metrics.completionRate, 100) * 0.35

  // Time spent contributes 25% (optimal is around expected time)
  if (metrics.expectedReadingTimeSeconds > 0) {
    const timeRatio = metrics.avgReadingTimeSeconds / metrics.expectedReadingTimeSeconds
    // Optimal is between 0.8 and 1.3 of expected time
    let timeScore = 0
    if (timeRatio >= 0.8 && timeRatio <= 1.3) {
      timeScore = 100
    } else if (timeRatio < 0.8) {
      timeScore = (timeRatio / 0.8) * 100
    } else {
      timeScore = Math.max(0, 100 - (timeRatio - 1.3) * 50)
    }
    score += timeScore * 0.25
  } else {
    score += 50 * 0.25
  }

  // Re-reads and favorites contribute 25%
  const loyaltyScore = Math.min((metrics.favoritesCount * 5 + metrics.reReads * 10), 100)
  score += loyaltyScore * 0.25

  // Low bounce rate contributes 15%
  const bounceScore = Math.max(0, 100 - metrics.bounceRate)
  score += bounceScore * 0.15

  return Math.round(score)
}

/**
 * Calculate story retention score
 */
export function calculateRetentionScore(
  pageDropOffs: number[],
  totalPages: number
): number {
  if (totalPages === 0 || pageDropOffs.length === 0) return 50

  // Calculate average retention per page
  const retentionPerPage = pageDropOffs.map((dropOff, i) => {
    const expectedRetention = 1 - (i / totalPages) * 0.3 // Expected 30% drop by end
    const actualRetention = 1 - dropOff
    return actualRetention / expectedRetention
  })

  const avgRetention = retentionPerPage.reduce((a, b) => a + b, 0) / retentionPerPage.length

  return Math.round(Math.min(avgRetention * 100, 100))
}

/**
 * Identify problematic pages
 */
export function identifyProblematicPages(
  pageEngagement: PageEngagementData[],
  avgTimePerPage: number
): PageEngagementData[] {
  return pageEngagement.map(page => {
    const issues: string[] = []

    // High drop-off rate
    if (page.dropOffRate > 0.15) {
      issues.push('High reader abandonment')
    }

    // Very short time (might be too easy or confusing)
    if (page.avgTimeSeconds < avgTimePerPage * 0.5) {
      issues.push('Readers moving through too quickly')
    }

    // Very long time (might be too difficult)
    if (page.avgTimeSeconds > avgTimePerPage * 2) {
      issues.push('Readers spending excessive time')
    }

    // Low interaction on pages that should have it
    if (page.audioPlays === 0 && page.wordTaps === 0 && page.avgTimeSeconds < avgTimePerPage) {
      issues.push('Low engagement indicators')
    }

    return {
      ...page,
      isProblematic: issues.length > 0,
      insights: issues,
    }
  })
}

/**
 * Generate content recommendations based on performance
 */
export function generateContentRecommendations(
  metrics: StoryPerformanceMetrics
): string[] {
  const recommendations: string[] = []

  // Completion rate issues
  if (metrics.completionRate < 50) {
    recommendations.push('Consider shortening the story or adding more engaging elements')

    if (metrics.mostAbandonedPage > 0 && metrics.mostAbandonedPage < 5) {
      recommendations.push(`Opening pages need improvement - high drop-off at page ${metrics.mostAbandonedPage}`)
    }
  }

  // Bounce rate issues
  if (metrics.bounceRate > 40) {
    recommendations.push('Cover image or title may not match reader expectations')
    recommendations.push('Consider A/B testing different thumbnails')
  }

  // Low engagement
  if (metrics.engagementScore < 40) {
    recommendations.push('Add more interactive elements or vocabulary highlights')
    recommendations.push('Consider adding audio narration if not present')
  }

  // Low re-reads
  if (metrics.reReads < metrics.totalCompletions * 0.1) {
    recommendations.push('Story may lack replay value - consider adding alternative endings or Easter eggs')
  }

  // Time issues
  if (metrics.avgTimePerPageSeconds < 10) {
    recommendations.push('Pages may be too short - consider adding more content')
  } else if (metrics.avgTimePerPageSeconds > 120) {
    recommendations.push('Pages may be too long - consider breaking into smaller chunks')
  }

  return recommendations
}

// =====================================================
// ANALYTICS AGGREGATION
// =====================================================

/**
 * Aggregate content performance for a period
 */
export function aggregateContentPerformance(
  storyMetrics: StoryPerformanceMetrics[],
  periodStart: Date,
  periodEnd: Date,
  periodType: 'daily' | 'weekly' | 'monthly'
): ContentPerformanceSummary {
  // Sort by various metrics
  const byViews = [...storyMetrics].sort((a, b) => b.totalViews - a.totalViews)
  const byCompletion = [...storyMetrics].sort((a, b) => b.completionRate - a.completionRate)
  const byEngagement = [...storyMetrics].sort((a, b) => b.engagementScore - a.engagementScore)

  // Aggregate by category
  const categoryMap = new Map<StoryCategory, { views: number; completions: number; starts: number; engagement: number; count: number }>()
  storyMetrics.forEach(m => {
    const existing = categoryMap.get(m.category) || { views: 0, completions: 0, starts: 0, engagement: 0, count: 0 }
    existing.views += m.totalViews
    existing.completions += m.totalCompletions
    existing.starts += m.totalStarts
    existing.engagement += m.engagementScore
    existing.count++
    categoryMap.set(m.category, existing)
  })

  const categoryPerformance = Array.from(categoryMap.entries()).map(([category, data]) => ({
    category,
    views: data.views,
    completionRate: data.starts > 0 ? Math.round((data.completions / data.starts) * 100) : 0,
    avgEngagement: Math.round(data.engagement / data.count),
  })).sort((a, b) => b.views - a.views)

  // Aggregate by age band
  const ageBandMap = new Map<AgeBand, { views: number; completions: number; starts: number; minutes: number }>()
  storyMetrics.forEach(m => {
    Object.entries(m.ageBandDistribution).forEach(([band, count]) => {
      const ageBand = band as AgeBand
      const existing = ageBandMap.get(ageBand) || { views: 0, completions: 0, starts: 0, minutes: 0 }
      existing.views += count
      ageBandMap.set(ageBand, existing)
    })
  })

  const ageBandPerformance = Array.from(ageBandMap.entries()).map(([ageBand, data]) => ({
    ageBand,
    views: data.views,
    completionRate: 75, // Would need actual data
    avgReadingMinutes: 15, // Would need actual data
  }))

  // Identify underperformers
  const avgEngagement = storyMetrics.reduce((sum, m) => sum + m.engagementScore, 0) / storyMetrics.length
  const lowPerformingStories = storyMetrics
    .filter(m => m.engagementScore < avgEngagement * 0.6 || m.completionRate < 40)
    .map(m => {
      let issue = ''
      let recommendation = ''

      if (m.completionRate < 40) {
        issue = 'Low completion rate'
        recommendation = 'Review story pacing and length'
      } else if (m.bounceRate > 50) {
        issue = 'High bounce rate'
        recommendation = 'Improve cover and opening'
      } else {
        issue = 'Low engagement'
        recommendation = 'Add interactive elements'
      }

      return {
        storyId: m.storyId,
        title: m.title,
        issue,
        recommendation,
      }
    })
    .slice(0, 10)

  // Calculate totals
  const totalViews = storyMetrics.reduce((sum, m) => sum + m.totalViews, 0)
  const totalMinutes = Math.round(storyMetrics.reduce((sum, m) => sum + m.totalReadingTimeSeconds, 0) / 60)
  const totalStarts = storyMetrics.reduce((sum, m) => sum + m.totalStarts, 0)
  const totalCompletions = storyMetrics.reduce((sum, m) => sum + m.totalCompletions, 0)
  const avgCompletion = totalStarts > 0 ? Math.round((totalCompletions / totalStarts) * 100) : 0

  return {
    period: {
      start: periodStart,
      end: periodEnd,
      type: periodType,
    },
    totalStoriesViewed: totalViews,
    totalReadingMinutes: totalMinutes,
    avgCompletionRate: avgCompletion,
    topByViews: byViews.slice(0, 10),
    topByCompletion: byCompletion.slice(0, 10),
    topByEngagement: byEngagement.slice(0, 10),
    categoryPerformance,
    ageBandPerformance,
    viewsTrend: [], // Would be populated with time-series data
    completionTrend: [],
    lowPerformingStories,
  }
}

/**
 * Compare story performance to category average
 */
export function compareToCategory(
  storyMetrics: StoryPerformanceMetrics,
  categoryAverages: {
    avgViews: number
    avgCompletionRate: number
    avgEngagement: number
  }
): {
  viewsVsCategory: number  // percentage above/below
  completionVsCategory: number
  engagementVsCategory: number
  overallRanking: 'top' | 'above_average' | 'average' | 'below_average' | 'bottom'
} {
  const viewsVsCategory = categoryAverages.avgViews > 0
    ? Math.round(((storyMetrics.totalViews - categoryAverages.avgViews) / categoryAverages.avgViews) * 100)
    : 0

  const completionVsCategory = categoryAverages.avgCompletionRate > 0
    ? Math.round(((storyMetrics.completionRate - categoryAverages.avgCompletionRate) / categoryAverages.avgCompletionRate) * 100)
    : 0

  const engagementVsCategory = categoryAverages.avgEngagement > 0
    ? Math.round(((storyMetrics.engagementScore - categoryAverages.avgEngagement) / categoryAverages.avgEngagement) * 100)
    : 0

  const avgScore = (viewsVsCategory + completionVsCategory + engagementVsCategory) / 3

  let overallRanking: 'top' | 'above_average' | 'average' | 'below_average' | 'bottom'
  if (avgScore >= 50) overallRanking = 'top'
  else if (avgScore >= 10) overallRanking = 'above_average'
  else if (avgScore >= -10) overallRanking = 'average'
  else if (avgScore >= -50) overallRanking = 'below_average'
  else overallRanking = 'bottom'

  return {
    viewsVsCategory,
    completionVsCategory,
    engagementVsCategory,
    overallRanking,
  }
}

// =====================================================
// EXPORTS
// =====================================================

export {
  calculateEngagementScore,
  calculateRetentionScore,
  identifyProblematicPages,
  generateContentRecommendations,
  aggregateContentPerformance,
  compareToCategory,
}
