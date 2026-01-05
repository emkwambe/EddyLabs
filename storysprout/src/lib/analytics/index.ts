/**
 * StorySprout Analytics Module
 *
 * Comprehensive analytics for:
 * - User behavior tracking
 * - Reading performance analysis
 * - Content performance metrics
 * - Report generation and export
 */

// Event tracking
export {
  initAnalytics,
  getAnalytics,
  AnalyticsService,
  EventQueue,
  type AnalyticsEvent,
  type ReadingEvent,
  type EngagementEvent,
  type LearningEvent,
  type NavigationEvent,
  type EventCategory,
  type DeviceInfo,
} from './events'

// Reading performance
export {
  READING_BENCHMARKS,
  calculateReadingPerformance,
  identifyStrugglingReader,
  generateProgressReport,
  type ReadingSessionData,
  type ReadingPerformanceMetrics,
  type AgeGroupBenchmarks,
  type StrugglingReaderIndicators,
  type ReadingProgressReport,
} from './reading-performance'

// Content performance
export {
  calculateEngagementScore,
  calculateRetentionScore,
  identifyProblematicPages,
  generateContentRecommendations,
  aggregateContentPerformance,
  compareToCategory,
  type StoryPerformanceMetrics,
  type ContentPerformanceSummary,
  type PageEngagementData,
} from './content-performance'

// Reports and export
export {
  generateChildProgressReport,
  generateClassroomCSV,
  generateClassroomReport,
  toCSV,
  exportReadingSessionsCSV,
  exportStudentProgressCSV,
  calculateNextScheduledDate,
  type ReportFormat,
  type ReportType,
  type ReportOptions,
  type ChildProgressReportData,
  type ClassroomReportData,
  type ScheduledReportConfig,
} from './export-reports'
