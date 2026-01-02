'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { StoryCardScroll, CategoryCard, PathProgressIndicator } from '@/components/storysprout'
import type { ChildProfile, Story, StoryPath, StoryWithProgress } from '@/lib/storysprout/types'
import { AGE_BANDS, CATEGORIES } from '@/lib/storysprout/types'

export default function ChildHomePage() {
  const router = useRouter()
  const params = useParams()
  const childId = params.childId as string

  const [profile, setProfile] = useState<ChildProfile | null>(null)
  const [featuredStories, setFeaturedStories] = useState<StoryWithProgress[]>([])
  const [continueReading, setContinueReading] = useState<StoryWithProgress[]>([])
  const [storyPaths, setStoryPaths] = useState<(StoryPath & { stories: Story[], completedCount: number })[]>([])
  const [loading, setLoading] = useState(true)

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

      // Load stories for this age band
      const { data: storiesData } = await supabase
        .from('stories')
        .select('*')
        .eq('age_band', profileData.age_band)
        .order('is_featured', { ascending: false })
        .limit(20)

      // Load reading progress
      const { data: progressData } = await supabase
        .from('reading_progress')
        .select('*')
        .eq('child_profile_id', childId)

      const progressMap = new Map(progressData?.map(p => [p.story_id, p]) || [])

      // Merge stories with progress
      const storiesWithProgress: StoryWithProgress[] = (storiesData || []).map(story => ({
        ...story,
        child_profile_id: childId,
        current_page: progressMap.get(story.id)?.current_page || null,
        is_completed: progressMap.get(story.id)?.is_completed || null,
        read_count: progressMap.get(story.id)?.read_count || null,
        total_reading_time_seconds: progressMap.get(story.id)?.total_reading_time_seconds || null,
        last_read_at: progressMap.get(story.id)?.last_read_at || null,
      }))

      // Featured stories
      setFeaturedStories(storiesWithProgress.filter(s => s.is_featured).slice(0, 6))

      // Continue reading (started but not finished)
      setContinueReading(
        storiesWithProgress
          .filter(s => s.current_page && s.current_page > 1 && !s.is_completed)
          .slice(0, 6)
      )

      // Load story paths
      const { data: pathsData } = await supabase
        .from('story_paths')
        .select('*')
        .eq('age_band', profileData.age_band)
        .eq('is_active', true)
        .order('display_order')

      if (pathsData) {
        const pathsWithStories = await Promise.all(
          pathsData.map(async (path) => {
            const { data: pathStories } = await supabase
              .from('stories')
              .select('*')
              .eq('story_path_id', path.id)
              .order('sequence_in_path')

            const completedCount = (pathStories || []).filter(
              s => progressMap.get(s.id)?.is_completed
            ).length

            return {
              ...path,
              stories: pathStories || [],
              completedCount,
            }
          })
        )
        setStoryPaths(pathsWithStories)
      }

      setLoading(false)
    }

    loadData()
  }, [childId, router])

  const handleStoryClick = (story: Story | StoryWithProgress) => {
    router.push(`/storysprout/read/${childId}/story/${story.id}`)
  }

  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading stories...</p>
        </div>
      </div>
    )
  }

  const ageBand = AGE_BANDS[profile.age_band]

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-white pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            href="/storysprout/read"
            className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-2xl">📚</span>
            <span className="font-bold text-gray-900">StorySprout</span>
          </div>
          <Link
            href={`/storysprout/read/${childId}/library`}
            className="p-2 -mr-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </Link>
        </div>
      </header>

      {/* Welcome Section */}
      <section className="px-4 py-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-3xl"
            style={{ backgroundColor: ageBand.color + '30' }}
          >
            {ageBand.icon}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Hi, {profile.name}! 👋
            </h1>
            <p className="text-gray-500">
              Ready to read? Let's go!
            </p>
          </div>
        </div>
      </section>

      {/* Continue Reading */}
      {continueReading.length > 0 && (
        <section className="py-4 max-w-4xl mx-auto">
          <StoryCardScroll
            title="📖 Continue Reading"
            stories={continueReading}
            showProgress
            onStoryClick={handleStoryClick}
          />
        </section>
      )}

      {/* Featured Stories */}
      {featuredStories.length > 0 && (
        <section className="py-4 max-w-4xl mx-auto">
          <StoryCardScroll
            title="⭐ Featured Stories"
            stories={featuredStories}
            showProgress
            onStoryClick={handleStoryClick}
          />
        </section>
      )}

      {/* Story Paths */}
      {storyPaths.length > 0 && (
        <section className="py-6 max-w-4xl mx-auto px-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            🌟 Story Paths
          </h2>
          <div className="space-y-3">
            {storyPaths.map((path) => (
              <Link
                key={path.id}
                href={`/storysprout/read/${childId}/path/${path.id}`}
                className="block bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all border border-gray-100"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl"
                    style={{ backgroundColor: path.color_theme + '20' }}
                  >
                    {path.path_type === 'bedtime_collection' ? '🌙' :
                     path.path_type === 'learning_to_read' ? '📚' :
                     path.path_type === 'big_feelings' ? '💖' :
                     path.path_type === 'school_stories' ? '🏫' : '⭐'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900">{path.name}</h3>
                    <p className="text-sm text-gray-500 line-clamp-1">
                      {path.description}
                    </p>
                    <PathProgressIndicator
                      completed={path.completedCount}
                      total={path.stories.length}
                      color={path.color_theme}
                      size="sm"
                      className="mt-2"
                    />
                  </div>
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Browse Categories */}
      <section className="py-6 max-w-4xl mx-auto px-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          📚 Browse Stories
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {Object.values(CATEGORIES).slice(0, 6).map((category) => (
            <Link
              key={category.id}
              href={`/storysprout/read/${childId}/library?category=${category.id}`}
              className="p-4 rounded-xl transition-all hover:shadow-md active:scale-98"
              style={{ backgroundColor: category.color + '20' }}
            >
              <span className="text-3xl mb-2 block">{category.icon}</span>
              <span className="font-medium text-gray-900 text-sm">{category.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 safe-area-inset-bottom">
        <div className="max-w-md mx-auto flex justify-around">
          <Link
            href={`/storysprout/read/${childId}`}
            className="flex flex-col items-center p-2 text-primary-600"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-xs mt-1">Home</span>
          </Link>
          <Link
            href={`/storysprout/read/${childId}/library`}
            className="flex flex-col items-center p-2 text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span className="text-xs mt-1">Library</span>
          </Link>
          <Link
            href={`/storysprout/read/${childId}/favorites`}
            className="flex flex-col items-center p-2 text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span className="text-xs mt-1">Favorites</span>
          </Link>
          <Link
            href="/storysprout/read"
            className="flex flex-col items-center p-2 text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="text-xs mt-1">Switch</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}
