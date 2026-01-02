'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ChildReadingStats, SightWordProgress, SightWordList, StoryCardGrid } from '@/components/storysprout'
import type {
  ChildProfile,
  ChildReadingSummary,
  StoryWithProgress,
  SightWordExposure,
} from '@/lib/storysprout/types'
import { AGE_BANDS, SIGHT_WORDS_BY_GRADE, CHILD_AVATARS } from '@/lib/storysprout/types'

export default function ChildDetailPage() {
  const router = useRouter()
  const params = useParams()
  const childId = params.childId as string

  const [profile, setProfile] = useState<ChildProfile | null>(null)
  const [summary, setSummary] = useState<ChildReadingSummary | null>(null)
  const [recentStories, setRecentStories] = useState<StoryWithProgress[]>([])
  const [sightWords, setSightWords] = useState<SightWordExposure[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'stories' | 'words'>('overview')

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
        router.push('/storysprout/dashboard')
        return
      }

      setProfile(profileData)

      // Load reading stats
      const { count: completedCount } = await supabase
        .from('reading_progress')
        .select('*', { count: 'exact', head: true })
        .eq('child_profile_id', childId)
        .eq('is_completed', true)

      const { count: startedCount } = await supabase
        .from('reading_progress')
        .select('*', { count: 'exact', head: true })
        .eq('child_profile_id', childId)

      const { data: timeData } = await supabase
        .from('reading_progress')
        .select('total_reading_time_seconds')
        .eq('child_profile_id', childId)

      const totalSeconds = timeData?.reduce((sum, p) => sum + (p.total_reading_time_seconds || 0), 0) || 0

      const { count: sightWordsCount } = await supabase
        .from('sight_word_exposures')
        .select('*', { count: 'exact', head: true })
        .eq('child_profile_id', childId)

      const { data: lastRead } = await supabase
        .from('reading_progress')
        .select('last_read_at')
        .eq('child_profile_id', childId)
        .order('last_read_at', { ascending: false })
        .limit(1)

      setSummary({
        child_id: childId,
        child_name: profileData.name,
        parent_user_id: profileData.parent_user_id,
        stories_completed: completedCount || 0,
        stories_started: startedCount || 0,
        total_reading_minutes: Math.round(totalSeconds / 60),
        sight_words_encountered: sightWordsCount || 0,
        last_reading_date: lastRead?.[0]?.last_read_at || null,
      })

      // Load recent stories with progress
      const { data: progressData } = await supabase
        .from('reading_progress')
        .select('*, stories(*)')
        .eq('child_profile_id', childId)
        .order('last_read_at', { ascending: false })
        .limit(10)

      if (progressData) {
        const storiesWithProgress: StoryWithProgress[] = progressData
          .filter(p => p.stories)
          .map(p => ({
            ...(p.stories as any),
            child_profile_id: childId,
            current_page: p.current_page,
            is_completed: p.is_completed,
            read_count: p.read_count,
            total_reading_time_seconds: p.total_reading_time_seconds,
            last_read_at: p.last_read_at,
          }))
        setRecentStories(storiesWithProgress)
      }

      // Load sight word exposures
      const { data: wordsData } = await supabase
        .from('sight_word_exposures')
        .select('*')
        .eq('child_profile_id', childId)
        .order('exposure_count', { ascending: false })

      setSightWords(wordsData || [])

      setLoading(false)
    }

    loadData()
  }, [childId, router])

  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  const ageBand = AGE_BANDS[profile.age_band]
  const avatar = CHILD_AVATARS.find(a => a.id === profile.avatar_url) || CHILD_AVATARS[0]
  const gradeWords = SIGHT_WORDS_BY_GRADE[profile.age_band]
  const exposureMap = new Map(sightWords.map(w => [w.word, w]))
  const masteredCount = sightWords.filter(w => w.is_mastered).length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/storysprout/dashboard"
              className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div className="flex items-center gap-3 flex-1">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                style={{ backgroundColor: avatar.color }}
              >
                {avatar.emoji}
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{profile.name}</h1>
                <p className="text-sm text-gray-500">
                  {ageBand.label} • Ages {ageBand.ageRange[0]}-{ageBand.ageRange[1]}
                </p>
              </div>
            </div>
            <Link
              href={`/storysprout/read/${childId}`}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors text-sm"
            >
              Start Reading
            </Link>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex gap-6">
            {(['overview', 'stories', 'words'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-3 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab === 'overview' && 'Overview'}
                {tab === 'stories' && 'Stories'}
                {tab === 'words' && 'Sight Words'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && summary && (
          <div className="space-y-6">
            <ChildReadingStats summary={summary} />

            {/* Reading streak / goals could go here */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-3">Reading Level</h3>
              <div className="flex items-center gap-4">
                <div
                  className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl"
                  style={{ backgroundColor: ageBand.color + '30' }}
                >
                  {ageBand.icon}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{ageBand.label}</p>
                  <p className="text-sm text-gray-500">{ageBand.readingFocus}</p>
                  <p className="text-xs text-gray-400 mt-1">{ageBand.cognitiveGoals}</p>
                </div>
              </div>
            </div>

            {/* Sight Word Summary */}
            <SightWordProgress
              ageBand={ageBand.label}
              totalWords={gradeWords.length}
              masteredWords={masteredCount}
              encounteredWords={sightWords.length}
            />

            {/* Recent Stories */}
            {recentStories.length > 0 && (
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-4">Recent Stories</h3>
                <div className="space-y-3">
                  {recentStories.slice(0, 5).map((story) => (
                    <div
                      key={story.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-gray-50"
                    >
                      <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                        {story.is_completed ? '✅' : '📖'}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{story.title}</p>
                        <p className="text-xs text-gray-500">
                          {story.is_completed ? 'Completed' : `Page ${story.current_page}/${story.page_count}`}
                          {story.read_count && story.read_count > 1 && ` • Read ${story.read_count}x`}
                        </p>
                      </div>
                      <span className="text-xs text-gray-400">
                        {story.last_read_at && new Date(story.last_read_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Stories Tab */}
        {activeTab === 'stories' && (
          <div>
            {recentStories.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">📚</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">No stories yet</h3>
                <p className="text-gray-500 mb-4">Start reading to see progress here.</p>
                <Link
                  href={`/storysprout/read/${childId}`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors"
                >
                  Browse Stories
                </Link>
              </div>
            ) : (
              <StoryCardGrid
                stories={recentStories}
                showProgress
                onStoryClick={(story) => router.push(`/storysprout/read/${childId}/story/${story.id}`)}
              />
            )}
          </div>
        )}

        {/* Sight Words Tab */}
        {activeTab === 'words' && (
          <div className="space-y-6">
            <SightWordProgress
              ageBand={ageBand.label}
              totalWords={gradeWords.length}
              masteredWords={masteredCount}
              encounteredWords={sightWords.length}
            />

            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4">
                {ageBand.label} Sight Words
              </h3>
              <SightWordList
                words={gradeWords}
                exposures={exposureMap}
              />
            </div>

            {sightWords.length > 0 && (
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-4">
                  Word Exposure Details
                </h3>
                <div className="space-y-2">
                  {sightWords.slice(0, 20).map((word) => (
                    <div
                      key={word.word}
                      className="flex items-center justify-between p-2 rounded-lg bg-gray-50"
                    >
                      <span className="font-medium text-gray-900">{word.word}</span>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-gray-500">
                          Seen {word.exposure_count}x
                        </span>
                        {word.is_mastered && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                            Mastered
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
