/**
 * StorySprout Analytics Events Service
 *
 * Lightweight event tracking service for user behavior analytics.
 * Supports real-time event streaming and batch processing.
 */

import { AgeBand, StoryCategory, ReadingMode } from '../storysprout/types'

// =====================================================
// EVENT TYPES
// =====================================================

export type EventCategory =
  | 'reading'
  | 'engagement'
  | 'learning'
  | 'navigation'
  | 'interaction'
  | 'achievement'
  | 'error'
  | 'performance'

export type ReadingEventType =
  | 'story_started'
  | 'story_completed'
  | 'story_abandoned'
  | 'page_viewed'
  | 'page_turned'
  | 'reading_paused'
  | 'reading_resumed'
  | 'audio_played'
  | 'audio_paused'
  | 'word_tapped'
  | 'bookmark_added'
  | 'bookmark_removed'

export type EngagementEventType =
  | 'session_started'
  | 'session_ended'
  | 'app_opened'
  | 'app_backgrounded'
  | 'app_foregrounded'
  | 'feature_used'
  | 'button_clicked'
  | 'menu_opened'
  | 'search_performed'
  | 'filter_applied'
  | 'share_clicked'

export type LearningEventType =
  | 'sight_word_exposed'
  | 'sight_word_mastered'
  | 'vocabulary_exposed'
  | 'vocabulary_learned'
  | 'value_lesson_completed'
  | 'skill_practiced'
  | 'quiz_started'
  | 'quiz_completed'
  | 'discussion_started'
  | 'achievement_unlocked'

export type NavigationEventType =
  | 'screen_viewed'
  | 'story_selected'
  | 'category_browsed'
  | 'profile_switched'
  | 'settings_opened'
  | 'dashboard_viewed'
  | 'library_browsed'

export type EventType = ReadingEventType | EngagementEventType | LearningEventType | NavigationEventType

// =====================================================
// EVENT INTERFACES
// =====================================================

export interface BaseEvent {
  event_id: string
  event_type: EventType
  category: EventCategory
  timestamp: string
  user_id?: string
  child_profile_id?: string
  session_id: string
  device_info?: DeviceInfo
  metadata?: Record<string, unknown>
}

export interface DeviceInfo {
  platform: 'web' | 'ios' | 'android'
  browser?: string
  browser_version?: string
  os?: string
  os_version?: string
  device_type: 'desktop' | 'tablet' | 'mobile'
  screen_width?: number
  screen_height?: number
}

export interface ReadingEvent extends BaseEvent {
  category: 'reading'
  event_type: ReadingEventType
  story_id: string
  page_number?: number
  reading_mode?: ReadingMode
  duration_seconds?: number
  words_read?: number
  word_tapped?: string
}

export interface EngagementEvent extends BaseEvent {
  category: 'engagement'
  event_type: EngagementEventType
  feature_name?: string
  button_name?: string
  search_query?: string
  filter_type?: string
  filter_value?: string
}

export interface LearningEvent extends BaseEvent {
  category: 'learning'
  event_type: LearningEventType
  story_id?: string
  word?: string
  value?: string
  skill?: string
  quiz_score?: number
  questions_correct?: number
  questions_total?: number
}

export interface NavigationEvent extends BaseEvent {
  category: 'navigation'
  event_type: NavigationEventType
  screen_name: string
  previous_screen?: string
  story_id?: string
  category_id?: string
}

export type AnalyticsEvent = ReadingEvent | EngagementEvent | LearningEvent | NavigationEvent

// =====================================================
// EVENT QUEUE AND BATCH PROCESSING
// =====================================================

interface EventQueueConfig {
  maxQueueSize: number
  flushInterval: number  // milliseconds
  maxRetries: number
  retryDelay: number     // milliseconds
}

const DEFAULT_CONFIG: EventQueueConfig = {
  maxQueueSize: 100,
  flushInterval: 30000,  // 30 seconds
  maxRetries: 3,
  retryDelay: 1000,
}

class EventQueue {
  private queue: AnalyticsEvent[] = []
  private config: EventQueueConfig
  private flushTimer: NodeJS.Timeout | null = null
  private isProcessing = false
  private onFlush: (events: AnalyticsEvent[]) => Promise<void>

  constructor(
    onFlush: (events: AnalyticsEvent[]) => Promise<void>,
    config: Partial<EventQueueConfig> = {}
  ) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.onFlush = onFlush
    this.startFlushTimer()
  }

  enqueue(event: AnalyticsEvent): void {
    this.queue.push(event)

    if (this.queue.length >= this.config.maxQueueSize) {
      this.flush()
    }
  }

  async flush(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) return

    this.isProcessing = true
    const eventsToFlush = [...this.queue]
    this.queue = []

    try {
      await this.onFlush(eventsToFlush)
    } catch (error) {
      // Re-add failed events to queue for retry
      console.error('Failed to flush events:', error)
      this.queue = [...eventsToFlush, ...this.queue].slice(0, this.config.maxQueueSize)
    } finally {
      this.isProcessing = false
    }
  }

  private startFlushTimer(): void {
    this.flushTimer = setInterval(() => {
      this.flush()
    }, this.config.flushInterval)
  }

  stop(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer)
      this.flushTimer = null
    }
    this.flush() // Flush remaining events
  }

  getQueueSize(): number {
    return this.queue.length
  }
}

// =====================================================
// ANALYTICS SERVICE
// =====================================================

interface AnalyticsServiceConfig {
  enabled: boolean
  debug: boolean
  endpoint?: string
  batchConfig?: Partial<EventQueueConfig>
}

class AnalyticsService {
  private static instance: AnalyticsService
  private config: AnalyticsServiceConfig
  private eventQueue: EventQueue
  private sessionId: string
  private userId?: string
  private childProfileId?: string
  private deviceInfo?: DeviceInfo
  private listeners: Map<EventCategory, Set<(event: AnalyticsEvent) => void>> = new Map()

  private constructor(config: AnalyticsServiceConfig) {
    this.config = config
    this.sessionId = this.generateSessionId()
    this.eventQueue = new EventQueue(
      this.sendEvents.bind(this),
      config.batchConfig
    )
  }

  static getInstance(config?: AnalyticsServiceConfig): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService(config || {
        enabled: true,
        debug: false,
      })
    }
    return AnalyticsService.instance
  }

  // =====================================================
  // CONFIGURATION
  // =====================================================

  setUser(userId: string): void {
    this.userId = userId
  }

  setChildProfile(childProfileId: string): void {
    this.childProfileId = childProfileId
  }

  setDeviceInfo(deviceInfo: DeviceInfo): void {
    this.deviceInfo = deviceInfo
  }

  startNewSession(): string {
    this.sessionId = this.generateSessionId()
    this.trackEngagement('session_started')
    return this.sessionId
  }

  endSession(): void {
    this.trackEngagement('session_ended')
    this.eventQueue.flush()
  }

  // =====================================================
  // EVENT TRACKING
  // =====================================================

  track(event: Omit<AnalyticsEvent, 'event_id' | 'timestamp' | 'session_id' | 'user_id' | 'child_profile_id' | 'device_info'>): void {
    if (!this.config.enabled) return

    const fullEvent: AnalyticsEvent = {
      ...event,
      event_id: this.generateEventId(),
      timestamp: new Date().toISOString(),
      session_id: this.sessionId,
      user_id: this.userId,
      child_profile_id: this.childProfileId,
      device_info: this.deviceInfo,
    } as AnalyticsEvent

    if (this.config.debug) {
      console.log('[Analytics]', fullEvent.event_type, fullEvent)
    }

    this.eventQueue.enqueue(fullEvent)
    this.notifyListeners(fullEvent)
  }

  // Convenience methods for common events
  trackReading(
    eventType: ReadingEventType,
    storyId: string,
    data?: Partial<Omit<ReadingEvent, 'event_id' | 'timestamp' | 'session_id' | 'category' | 'event_type' | 'story_id'>>
  ): void {
    this.track({
      category: 'reading',
      event_type: eventType,
      story_id: storyId,
      ...data,
    } as Omit<ReadingEvent, 'event_id' | 'timestamp' | 'session_id' | 'user_id' | 'child_profile_id' | 'device_info'>)
  }

  trackEngagement(
    eventType: EngagementEventType,
    data?: Partial<Omit<EngagementEvent, 'event_id' | 'timestamp' | 'session_id' | 'category' | 'event_type'>>
  ): void {
    this.track({
      category: 'engagement',
      event_type: eventType,
      ...data,
    } as Omit<EngagementEvent, 'event_id' | 'timestamp' | 'session_id' | 'user_id' | 'child_profile_id' | 'device_info'>)
  }

  trackLearning(
    eventType: LearningEventType,
    data?: Partial<Omit<LearningEvent, 'event_id' | 'timestamp' | 'session_id' | 'category' | 'event_type'>>
  ): void {
    this.track({
      category: 'learning',
      event_type: eventType,
      ...data,
    } as Omit<LearningEvent, 'event_id' | 'timestamp' | 'session_id' | 'user_id' | 'child_profile_id' | 'device_info'>)
  }

  trackNavigation(
    eventType: NavigationEventType,
    screenName: string,
    data?: Partial<Omit<NavigationEvent, 'event_id' | 'timestamp' | 'session_id' | 'category' | 'event_type' | 'screen_name'>>
  ): void {
    this.track({
      category: 'navigation',
      event_type: eventType,
      screen_name: screenName,
      ...data,
    } as Omit<NavigationEvent, 'event_id' | 'timestamp' | 'session_id' | 'user_id' | 'child_profile_id' | 'device_info'>)
  }

  // =====================================================
  // SPECIFIC EVENT HELPERS
  // =====================================================

  trackStoryStarted(storyId: string, readingMode: ReadingMode): void {
    this.trackReading('story_started', storyId, { reading_mode: readingMode })
  }

  trackStoryCompleted(storyId: string, durationSeconds: number, wordsRead: number): void {
    this.trackReading('story_completed', storyId, {
      duration_seconds: durationSeconds,
      words_read: wordsRead,
    })
  }

  trackStoryAbandoned(storyId: string, pageNumber: number, durationSeconds: number): void {
    this.trackReading('story_abandoned', storyId, {
      page_number: pageNumber,
      duration_seconds: durationSeconds,
    })
  }

  trackPageViewed(storyId: string, pageNumber: number, durationSeconds?: number): void {
    this.trackReading('page_viewed', storyId, {
      page_number: pageNumber,
      duration_seconds: durationSeconds,
    })
  }

  trackWordTapped(storyId: string, word: string, pageNumber: number): void {
    this.trackReading('word_tapped', storyId, {
      word_tapped: word,
      page_number: pageNumber,
    })
  }

  trackSightWordExposed(word: string, storyId?: string): void {
    this.trackLearning('sight_word_exposed', { word, story_id: storyId })
  }

  trackSightWordMastered(word: string): void {
    this.trackLearning('sight_word_mastered', { word })
  }

  trackValueLessonCompleted(value: string, storyId: string): void {
    this.trackLearning('value_lesson_completed', { value, story_id: storyId })
  }

  trackAchievementUnlocked(achievementId: string, metadata?: Record<string, unknown>): void {
    this.trackLearning('achievement_unlocked', { metadata: { achievement_id: achievementId, ...metadata } })
  }

  trackScreenViewed(screenName: string, previousScreen?: string): void {
    this.trackNavigation('screen_viewed', screenName, { previous_screen: previousScreen })
  }

  trackStorySelected(storyId: string, fromScreen: string): void {
    this.trackNavigation('story_selected', fromScreen, { story_id: storyId })
  }

  trackSearch(query: string, resultsCount: number): void {
    this.trackEngagement('search_performed', {
      search_query: query,
      metadata: { results_count: resultsCount },
    })
  }

  trackFilterApplied(filterType: string, filterValue: string): void {
    this.trackEngagement('filter_applied', {
      filter_type: filterType,
      filter_value: filterValue,
    })
  }

  // =====================================================
  // EVENT LISTENERS
  // =====================================================

  subscribe(category: EventCategory, callback: (event: AnalyticsEvent) => void): () => void {
    if (!this.listeners.has(category)) {
      this.listeners.set(category, new Set())
    }
    this.listeners.get(category)!.add(callback)

    // Return unsubscribe function
    return () => {
      this.listeners.get(category)?.delete(callback)
    }
  }

  private notifyListeners(event: AnalyticsEvent): void {
    this.listeners.get(event.category)?.forEach(callback => {
      try {
        callback(event)
      } catch (error) {
        console.error('Analytics listener error:', error)
      }
    })
  }

  // =====================================================
  // INTERNAL METHODS
  // =====================================================

  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
  }

  private generateSessionId(): string {
    return `ses_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
  }

  private async sendEvents(events: AnalyticsEvent[]): Promise<void> {
    if (!this.config.endpoint) {
      // Store locally or log in debug mode
      if (this.config.debug) {
        console.log('[Analytics] Batch send:', events.length, 'events')
      }
      return
    }

    const response = await fetch(this.config.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ events }),
    })

    if (!response.ok) {
      throw new Error(`Failed to send events: ${response.status}`)
    }
  }

  // =====================================================
  // METRICS AND STATISTICS
  // =====================================================

  getSessionId(): string {
    return this.sessionId
  }

  getQueueSize(): number {
    return this.eventQueue.getQueueSize()
  }

  async flush(): Promise<void> {
    await this.eventQueue.flush()
  }
}

// =====================================================
// EXPORTS
// =====================================================

// Singleton instance
let analyticsInstance: AnalyticsService | null = null

export function initAnalytics(config?: AnalyticsServiceConfig): AnalyticsService {
  analyticsInstance = AnalyticsService.getInstance(config)
  return analyticsInstance
}

export function getAnalytics(): AnalyticsService {
  if (!analyticsInstance) {
    analyticsInstance = AnalyticsService.getInstance()
  }
  return analyticsInstance
}

// Export types and classes
export { AnalyticsService, EventQueue }
export type { AnalyticsServiceConfig, EventQueueConfig }
