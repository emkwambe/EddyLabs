/**
 * StorySprout Analytics Export & Reporting
 *
 * Generates exportable reports in various formats:
 * - PDF progress reports for parents
 * - CSV exports for teachers
 * - Scheduled report delivery
 */

import { AgeBand, CoreValue, SocialSkill } from '../storysprout/types'
import { ReadingPerformanceMetrics } from './reading-performance'
import { ChildLearningProgress } from '../storysprout/learning-outcomes'

// =====================================================
// TYPES
// =====================================================

export type ReportFormat = 'pdf' | 'csv' | 'json' | 'html'

export type ReportType =
  | 'child_progress'
  | 'classroom_summary'
  | 'school_summary'
  | 'content_performance'
  | 'learning_outcomes'

export interface ReportOptions {
  format: ReportFormat
  type: ReportType
  period: {
    start: Date
    end: Date
  }
  includeCharts?: boolean
  includeRecommendations?: boolean
  language?: string
}

export interface ChildProgressReportData {
  child: {
    id: string
    name: string
    ageBand: AgeBand
    avatarUrl?: string
  }
  period: {
    start: Date
    end: Date
    label: string
  }
  readingStats: {
    storiesCompleted: number
    totalReadingMinutes: number
    totalWordsRead: number
    avgWordsPerMinute: number
    readingStreak: number
    longestSession: number
  }
  performance: {
    readingLevel: string
    fluencyScore: number
    engagementScore: number
    improvementTrend: 'improving' | 'stable' | 'declining'
    wpmChange: number
  }
  learningProgress: {
    sightWordsMastered: number
    sightWordsTotal: number
    vocabularyLearned: number
    valuesExplored: CoreValue[]
    socialSkillsPracticed: SocialSkill[]
  }
  achievements: Array<{
    name: string
    earnedAt: Date
    icon: string
  }>
  favoriteStories: Array<{
    title: string
    category: string
    timesRead: number
  }>
  recommendations: string[]
  parentNotes: string[]
}

export interface ClassroomReportData {
  classroom: {
    id: string
    name: string
    teacherName: string
    gradeLevel: string
    studentCount: number
  }
  period: {
    start: Date
    end: Date
    label: string
  }
  classStats: {
    totalReadingMinutes: number
    avgMinutesPerStudent: number
    storiesCompleted: number
    studentsMetGoal: number
    goalAchievementRate: number
  }
  performanceDistribution: {
    advanced: number
    proficient: number
    developing: number
    emerging: number
  }
  learningOutcomes: {
    totalSightWordsMastered: number
    avgVocabularyPerStudent: number
    valuesExplored: string[]
    curriculumStandardsMet: number
  }
  studentBreakdown: Array<{
    name: string
    readingMinutes: number
    storiesCompleted: number
    wpm: number
    trend: 'improving' | 'stable' | 'declining'
    needsSupport: boolean
  }>
  strugglingStudents: Array<{
    name: string
    issues: string[]
    recommendations: string[]
  }>
}

// =====================================================
// REPORT GENERATORS
// =====================================================

/**
 * Generate child progress report content
 */
export function generateChildProgressReport(
  data: ChildProgressReportData
): string {
  const lines: string[] = []

  // Header
  lines.push(`# Reading Progress Report`)
  lines.push(`## ${data.child.name}`)
  lines.push(`**${data.period.label}** (${formatDate(data.period.start)} - ${formatDate(data.period.end)})`)
  lines.push('')

  // Reading Summary
  lines.push(`### 📚 Reading Summary`)
  lines.push('')
  lines.push(`| Metric | Value |`)
  lines.push(`|--------|-------|`)
  lines.push(`| Stories Completed | ${data.readingStats.storiesCompleted} |`)
  lines.push(`| Total Reading Time | ${formatMinutes(data.readingStats.totalReadingMinutes)} |`)
  lines.push(`| Words Read | ${data.readingStats.totalWordsRead.toLocaleString()} |`)
  lines.push(`| Reading Streak | ${data.readingStats.readingStreak} days |`)
  lines.push('')

  // Performance
  lines.push(`### 📈 Reading Performance`)
  lines.push('')
  lines.push(`**Reading Level:** ${data.performance.readingLevel}`)
  lines.push('')
  lines.push(`| Metric | Score | Trend |`)
  lines.push(`|--------|-------|-------|`)
  lines.push(`| Reading Speed | ${data.readingStats.avgWordsPerMinute} WPM | ${formatTrend(data.performance.improvementTrend)} |`)
  lines.push(`| Fluency | ${data.performance.fluencyScore}/100 | - |`)
  lines.push(`| Engagement | ${data.performance.engagementScore}/100 | - |`)
  lines.push('')

  // Learning Progress
  lines.push(`### 🎓 Learning Progress`)
  lines.push('')
  lines.push(`**Sight Words:** ${data.learningProgress.sightWordsMastered}/${data.learningProgress.sightWordsTotal} mastered`)
  lines.push('')
  lines.push(`**New Vocabulary:** ${data.learningProgress.vocabularyLearned} words learned`)
  lines.push('')
  if (data.learningProgress.valuesExplored.length > 0) {
    lines.push(`**Values Explored:**`)
    data.learningProgress.valuesExplored.forEach(v => {
      lines.push(`- ${formatValue(v)}`)
    })
    lines.push('')
  }

  // Achievements
  if (data.achievements.length > 0) {
    lines.push(`### 🏆 Achievements`)
    lines.push('')
    data.achievements.forEach(a => {
      lines.push(`- ${a.icon} **${a.name}** (${formatDate(a.earnedAt)})`)
    })
    lines.push('')
  }

  // Favorite Stories
  if (data.favoriteStories.length > 0) {
    lines.push(`### ❤️ Favorite Stories`)
    lines.push('')
    data.favoriteStories.forEach(s => {
      lines.push(`- **${s.title}** (${s.category}) - Read ${s.timesRead} time(s)`)
    })
    lines.push('')
  }

  // Recommendations
  if (data.recommendations.length > 0) {
    lines.push(`### 💡 Recommendations`)
    lines.push('')
    data.recommendations.forEach(r => {
      lines.push(`- ${r}`)
    })
    lines.push('')
  }

  // Parent Notes
  if (data.parentNotes.length > 0) {
    lines.push(`### 📝 Notes for Parents`)
    lines.push('')
    data.parentNotes.forEach(n => {
      lines.push(`> ${n}`)
    })
  }

  return lines.join('\n')
}

/**
 * Generate classroom report CSV
 */
export function generateClassroomCSV(data: ClassroomReportData): string {
  const lines: string[] = []

  // Header
  lines.push('Student Name,Reading Minutes,Stories Completed,Words Per Minute,Trend,Needs Support')

  // Data rows
  data.studentBreakdown.forEach(student => {
    lines.push([
      `"${student.name}"`,
      student.readingMinutes.toString(),
      student.storiesCompleted.toString(),
      student.wpm.toString(),
      student.trend,
      student.needsSupport ? 'Yes' : 'No',
    ].join(','))
  })

  return lines.join('\n')
}

/**
 * Generate classroom summary report
 */
export function generateClassroomReport(data: ClassroomReportData): string {
  const lines: string[] = []

  // Header
  lines.push(`# Classroom Reading Report`)
  lines.push(`## ${data.classroom.name}`)
  lines.push(`**Teacher:** ${data.classroom.teacherName}`)
  lines.push(`**Grade Level:** ${data.classroom.gradeLevel}`)
  lines.push(`**Period:** ${formatDate(data.period.start)} - ${formatDate(data.period.end)}`)
  lines.push('')

  // Class Summary
  lines.push(`### 📊 Class Summary`)
  lines.push('')
  lines.push(`| Metric | Value |`)
  lines.push(`|--------|-------|`)
  lines.push(`| Total Students | ${data.classroom.studentCount} |`)
  lines.push(`| Total Reading Time | ${formatMinutes(data.classStats.totalReadingMinutes)} |`)
  lines.push(`| Avg per Student | ${formatMinutes(data.classStats.avgMinutesPerStudent)} |`)
  lines.push(`| Stories Completed | ${data.classStats.storiesCompleted} |`)
  lines.push(`| Goal Achievement | ${data.classStats.goalAchievementRate}% |`)
  lines.push('')

  // Performance Distribution
  lines.push(`### 📈 Performance Distribution`)
  lines.push('')
  lines.push(`| Level | Students |`)
  lines.push(`|-------|----------|`)
  lines.push(`| Advanced | ${data.performanceDistribution.advanced} |`)
  lines.push(`| Proficient | ${data.performanceDistribution.proficient} |`)
  lines.push(`| Developing | ${data.performanceDistribution.developing} |`)
  lines.push(`| Emerging | ${data.performanceDistribution.emerging} |`)
  lines.push('')

  // Learning Outcomes
  lines.push(`### 🎓 Learning Outcomes`)
  lines.push('')
  lines.push(`- **Sight Words Mastered:** ${data.learningOutcomes.totalSightWordsMastered}`)
  lines.push(`- **Avg Vocabulary/Student:** ${data.learningOutcomes.avgVocabularyPerStudent}`)
  lines.push(`- **Curriculum Standards Met:** ${data.learningOutcomes.curriculumStandardsMet}`)
  lines.push('')

  // Struggling Students
  if (data.strugglingStudents.length > 0) {
    lines.push(`### ⚠️ Students Needing Support`)
    lines.push('')
    data.strugglingStudents.forEach(student => {
      lines.push(`**${student.name}**`)
      lines.push(`Issues: ${student.issues.join(', ')}`)
      lines.push(`Recommendations: ${student.recommendations.join('; ')}`)
      lines.push('')
    })
  }

  return lines.join('\n')
}

// =====================================================
// CSV EXPORT HELPERS
// =====================================================

interface CSVExportOptions {
  headers: string[]
  rows: Array<Record<string, string | number | boolean>>
  filename: string
}

/**
 * Convert data to CSV format
 */
export function toCSV(options: CSVExportOptions): string {
  const lines: string[] = []

  // Header row
  lines.push(options.headers.join(','))

  // Data rows
  options.rows.forEach(row => {
    const values = options.headers.map(header => {
      const value = row[header]
      if (typeof value === 'string') {
        // Escape quotes and wrap in quotes if contains comma
        const escaped = value.replace(/"/g, '""')
        return value.includes(',') ? `"${escaped}"` : escaped
      }
      return String(value ?? '')
    })
    lines.push(values.join(','))
  })

  return lines.join('\n')
}

/**
 * Export reading sessions to CSV
 */
export function exportReadingSessionsCSV(
  sessions: Array<{
    date: Date
    childName: string
    storyTitle: string
    duration: number
    wordsRead: number
    completed: boolean
  }>
): string {
  return toCSV({
    headers: ['Date', 'Child', 'Story', 'Duration (min)', 'Words Read', 'Completed'],
    rows: sessions.map(s => ({
      'Date': formatDate(s.date),
      'Child': s.childName,
      'Story': s.storyTitle,
      'Duration (min)': Math.round(s.duration / 60),
      'Words Read': s.wordsRead,
      'Completed': s.completed,
    })),
    filename: 'reading_sessions.csv',
  })
}

/**
 * Export student progress to CSV
 */
export function exportStudentProgressCSV(
  students: Array<{
    name: string
    grade: string
    readingMinutes: number
    storiesCompleted: number
    wpm: number
    sightWordsMastered: number
    readingLevel: string
  }>
): string {
  return toCSV({
    headers: ['Student Name', 'Grade', 'Reading Minutes', 'Stories Completed', 'WPM', 'Sight Words Mastered', 'Reading Level'],
    rows: students.map(s => ({
      'Student Name': s.name,
      'Grade': s.grade,
      'Reading Minutes': s.readingMinutes,
      'Stories Completed': s.storiesCompleted,
      'WPM': s.wpm,
      'Sight Words Mastered': s.sightWordsMastered,
      'Reading Level': s.readingLevel,
    })),
    filename: 'student_progress.csv',
  })
}

// =====================================================
// SCHEDULED REPORTS
// =====================================================

export interface ScheduledReportConfig {
  id: string
  name: string
  type: ReportType
  format: ReportFormat
  schedule: 'daily' | 'weekly' | 'monthly'
  recipients: string[]
  enabled: boolean
  lastSentAt?: Date
  nextScheduledAt: Date
  filters?: {
    classroomIds?: string[]
    childIds?: string[]
  }
}

/**
 * Calculate next scheduled date for a report
 */
export function calculateNextScheduledDate(
  schedule: 'daily' | 'weekly' | 'monthly',
  lastSentAt?: Date
): Date {
  const now = new Date()
  const next = new Date(lastSentAt || now)

  switch (schedule) {
    case 'daily':
      next.setDate(next.getDate() + 1)
      next.setHours(6, 0, 0, 0) // 6 AM
      break
    case 'weekly':
      next.setDate(next.getDate() + 7)
      next.setHours(6, 0, 0, 0)
      // Set to Monday
      const day = next.getDay()
      const diff = day === 0 ? 1 : 8 - day
      next.setDate(next.getDate() + diff)
      break
    case 'monthly':
      next.setMonth(next.getMonth() + 1)
      next.setDate(1)
      next.setHours(6, 0, 0, 0)
      break
  }

  return next
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function formatMinutes(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60

  if (hours === 0) return `${mins} min`
  if (mins === 0) return `${hours} hr`
  return `${hours} hr ${mins} min`
}

function formatTrend(trend: 'improving' | 'stable' | 'declining'): string {
  switch (trend) {
    case 'improving': return '📈 Improving'
    case 'stable': return '➡️ Stable'
    case 'declining': return '📉 Needs attention'
  }
}

function formatValue(value: CoreValue): string {
  return value.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

// =====================================================
// EXPORTS
// =====================================================

export {
  generateChildProgressReport,
  generateClassroomCSV,
  generateClassroomReport,
  toCSV,
  exportReadingSessionsCSV,
  exportStudentProgressCSV,
  calculateNextScheduledDate,
}
