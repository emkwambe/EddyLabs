'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { StoryReader, StoryCompleteModal } from '@/components/storysprout/StoryReader'
import { ReadingModeSelector } from '@/components/storysprout/ReadingModeSelector'
import type { Story, StoryPage, ChildProfile, ReadingMode, ReadingProgress } from '@/lib/storysprout/types'
import { AGE_BANDS } from '@/lib/storysprout/types'

export default function StoryReaderPage() {
  const router = useRouter()
  const params = useParams()
  const childId = params.childId as string
  const storyId = params.storyId as string

  const [story, setStory] = useState<Story | null>(null)
  const [pages, setPages] = useState<StoryPage[]>([])
  const [profile, setProfile] = useState<ChildProfile | null>(null)
  const [progress, setProgress] = useState<ReadingProgress | null>(null)
  const [loading, setLoading] = useState(true)
  const [showModeSelector, setShowModeSelector] = useState(true)
  const [selectedMode, setSelectedMode] = useState<ReadingMode>('read_with_me')
  const [showCompleteModal, setShowCompleteModal] = useState(false)
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null)

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()

      // Load child profile
      const { data: profileData, error: profileError } = await supabase
        .from('child_profiles')
        .select('*')
        .eq('id', childId)
        .single()

      if (profileError || !profileData) {
        router.push('/storysprout/read')
        return
      }

      setProfile(profileData)
      setSelectedMode(profileData.preferred_reading_mode || 'read_with_me')

      // Load story
      const { data: storyData, error: storyError } = await supabase
        .from('stories')
        .select('*')
        .eq('id', storyId)
        .single()

      if (storyError || !storyData) {
        router.push(`/storysprout/read/${childId}`)
        return
      }

      setStory(storyData)

      // Load story pages
      const { data: pagesData } = await supabase
        .from('story_pages')
        .select('*')
        .eq('story_id', storyId)
        .order('page_number')

      setPages(pagesData || [])

      // Load or create reading progress
      const { data: progressData } = await supabase
        .from('reading_progress')
        .select('*')
        .eq('child_profile_id', childId)
        .eq('story_id', storyId)
        .single()

      if (progressData) {
        setProgress(progressData)
      }

      setLoading(false)
    }

    loadData()
  }, [childId, storyId, router])

  // Start reading session
  const startReading = async (mode: ReadingMode) => {
    setSelectedMode(mode)
    setShowModeSelector(false)
    setSessionStartTime(new Date())

    const supabase = createClient()

    // Create reading session
    await supabase.from('reading_sessions').insert({
      child_profile_id: childId,
      story_id: storyId,
      reading_mode: mode,
      start_page: progress?.current_page || 1,
    })

    // Create or update progress
    if (!progress) {
      const { data: newProgress } = await supabase
        .from('reading_progress')
        .insert({
          child_profile_id: childId,
          story_id: storyId,
          total_pages: story?.page_count || pages.length,
          current_page: 1,
          reading_mode_used: mode,
        })
        .select()
        .single()

      if (newProgress) {
        setProgress(newProgress)
      }
    }
  }

  // Handle page change
  const handlePageChange = useCallback(async (page: number) => {
    if (!progress) return

    const supabase = createClient()

    await supabase
      .from('reading_progress')
      .update({
        current_page: page,
        last_read_at: new Date().toISOString(),
      })
      .eq('id', progress.id)

    setProgress(prev => prev ? { ...prev, current_page: page } : null)
  }, [progress])

  // Handle story completion
  const handleComplete = useCallback(async () => {
    if (!progress || !story || !sessionStartTime) return

    const supabase = createClient()
    const sessionDuration = Math.round((new Date().getTime() - sessionStartTime.getTime()) / 1000)

    // Update progress as completed
    await supabase
      .from('reading_progress')
      .update({
        is_completed: true,
        completed_at: new Date().toISOString(),
        read_count: (progress.read_count || 1) + 1,
        total_reading_time_seconds: (progress.total_reading_time_seconds || 0) + sessionDuration,
        last_read_at: new Date().toISOString(),
      })
      .eq('id', progress.id)

    // Update sight word exposures
    for (const word of story.sight_words) {
      const normalizedWord = word.toLowerCase()

      // Check if exposure exists
      const { data: existing } = await supabase
        .from('sight_word_exposures')
        .select('id, exposure_count')
        .eq('child_profile_id', childId)
        .eq('word', normalizedWord)
        .single()

      if (existing) {
        // Update existing exposure
        await supabase
          .from('sight_word_exposures')
          .update({
            exposure_count: existing.exposure_count + 1,
            last_seen_at: new Date().toISOString(),
          })
          .eq('id', existing.id)
      } else {
        // Create new exposure
        await supabase
          .from('sight_word_exposures')
          .insert({
            child_profile_id: childId,
            word: normalizedWord,
            exposure_count: 1,
            first_seen_at: new Date().toISOString(),
            last_seen_at: new Date().toISOString(),
          })
      }
    }

    // End reading session
    await supabase
      .from('reading_sessions')
      .update({
        ended_at: new Date().toISOString(),
        duration_seconds: sessionDuration,
        end_page: story.page_count,
        pages_read: story.page_count - (progress.current_page || 1) + 1,
        story_completed: true,
      })
      .eq('child_profile_id', childId)
      .eq('story_id', storyId)
      .is('ended_at', null)

    setProgress(prev => prev ? {
      ...prev,
      is_completed: true,
      read_count: (prev.read_count || 1) + 1,
    } : null)

    setShowCompleteModal(true)
  }, [progress, story, sessionStartTime, childId, storyId])

  // Handle close
  const handleClose = useCallback(async () => {
    if (sessionStartTime) {
      const supabase = createClient()
      const sessionDuration = Math.round((new Date().getTime() - sessionStartTime.getTime()) / 1000)

      // Update progress with reading time
      if (progress) {
        await supabase
          .from('reading_progress')
          .update({
            total_reading_time_seconds: (progress.total_reading_time_seconds || 0) + sessionDuration,
            last_read_at: new Date().toISOString(),
          })
          .eq('id', progress.id)
      }

      // End reading session
      await supabase
        .from('reading_sessions')
        .update({
          ended_at: new Date().toISOString(),
          duration_seconds: sessionDuration,
          end_page: progress?.current_page || 1,
          pages_read: (progress?.current_page || 1) - 1,
        })
        .eq('child_profile_id', childId)
        .eq('story_id', storyId)
        .is('ended_at', null)
    }

    router.push(`/storysprout/read/${childId}`)
  }, [sessionStartTime, progress, childId, storyId, router])

  // Handle sight word tap
  const handleSightWordTap = (word: string) => {
    // Could play pronunciation audio or show definition
    console.log('Sight word tapped:', word)
  }

  // Handle read again
  const handleReadAgain = () => {
    setShowCompleteModal(false)
    setShowModeSelector(true)
  }

  if (loading || !story || !profile) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading story...</p>
        </div>
      </div>
    )
  }

  const ageBand = AGE_BANDS[profile.age_band]

  // Show mode selector before reading
  if (showModeSelector) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white flex flex-col">
        {/* Header */}
        <header className="p-4">
          <button
            onClick={() => router.push(`/storysprout/read/${childId}`)}
            className="p-2 -ml-2 rounded-full hover:bg-white/50 transition-colors"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </header>

        {/* Story Info */}
        <main className="flex-1 flex flex-col items-center justify-center px-6 py-8">
          <div className="max-w-md w-full text-center">
            {/* Cover */}
            {story.cover_image_url ? (
              <div className="w-48 h-64 mx-auto mb-6 rounded-2xl overflow-hidden shadow-xl">
                <img
                  src={story.cover_image_url}
                  alt={story.title}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div
                className="w-48 h-64 mx-auto mb-6 rounded-2xl flex items-center justify-center text-6xl shadow-xl"
                style={{ backgroundColor: ageBand.color + '30' }}
              >
                📖
              </div>
            )}

            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {story.title}
            </h1>

            {story.subtitle && (
              <p className="text-gray-500 mb-4">{story.subtitle}</p>
            )}

            <div className="flex items-center justify-center gap-3 mb-8">
              <span
                className="px-3 py-1 rounded-full text-sm font-medium"
                style={{ backgroundColor: ageBand.color + '30', color: ageBand.color }}
              >
                {ageBand.label}
              </span>
              <span className="text-sm text-gray-500">
                {story.estimated_read_time_minutes} min
              </span>
              <span className="text-sm text-gray-500">
                {pages.length} pages
              </span>
            </div>

            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              How do you want to read?
            </h2>

            <ReadingModeSelector
              value={selectedMode}
              onChange={setSelectedMode}
              supportedModes={story.modes_supported}
              className="mb-6"
            />

            <button
              onClick={() => startReading(selectedMode)}
              className="w-full py-4 bg-primary-500 text-white rounded-2xl font-semibold text-lg hover:bg-primary-600 transition-colors shadow-lg"
            >
              Start Reading
            </button>

            {progress && progress.current_page > 1 && !progress.is_completed && (
              <p className="mt-4 text-sm text-gray-500">
                Continue from page {progress.current_page}
              </p>
            )}

            {progress?.is_completed && (
              <p className="mt-4 text-sm text-green-600">
                Completed! Read again to practice.
              </p>
            )}
          </div>
        </main>
      </div>
    )
  }

  return (
    <>
      <StoryReader
        story={story}
        pages={pages}
        initialPage={progress?.current_page || 1}
        initialMode={selectedMode}
        onPageChange={handlePageChange}
        onModeChange={(mode) => setSelectedMode(mode)}
        onComplete={handleComplete}
        onClose={handleClose}
        onSightWordTap={handleSightWordTap}
      />

      {showCompleteModal && (
        <StoryCompleteModal
          story={story}
          readCount={progress?.read_count || 1}
          onReadAgain={handleReadAgain}
          onClose={handleClose}
        />
      )}
    </>
  )
}
