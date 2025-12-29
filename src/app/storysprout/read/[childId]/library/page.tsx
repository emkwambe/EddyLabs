'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { StoryCardGrid, AgeFilter, CategoryFilter } from '@/components/storysprout'
import type { ChildProfile, Story, StoryWithProgress, AgeBand, StoryCategory } from '@/lib/storysprout/types'
import { AGE_BANDS } from '@/lib/storysprout/types'

export default function LibraryPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const childId = params.childId as string

  const [profile, setProfile] = useState<ChildProfile | null>(null)
  const [stories, setStories] = useState<StoryWithProgress[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<StoryCategory | null>(
    (searchParams.get('category') as StoryCategory) || null
  )

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

      // Build query
      let query = supabase
        .from('stories')
        .select('*')
        .eq('age_band', profileData.age_band)
        .order('created_at', { ascending: false })

      if (selectedCategory) {
        query = query.eq('category', selectedCategory)
      }

      const { data: storiesData } = await query

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

      setStories(storiesWithProgress)
      setLoading(false)
    }

    loadData()
  }, [childId, router, selectedCategory])

  const handleStoryClick = (story: Story | StoryWithProgress) => {
    router.push(`/storysprout/read/${childId}/story/${story.id}`)
  }

  const handleCategoryChange = (category: StoryCategory | null) => {
    setSelectedCategory(category)
    if (category) {
      router.replace(`/storysprout/read/${childId}/library?category=${category}`)
    } else {
      router.replace(`/storysprout/read/${childId}/library`)
    }
  }

  // Filter stories by search query
  const filteredStories = stories.filter(story =>
    !searchQuery ||
    story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    story.themes.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading library...</p>
        </div>
      </div>
    )
  }

  const ageBand = AGE_BANDS[profile.age_band]

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3 mb-3">
            <Link
              href={`/storysprout/read/${childId}`}
              className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-xl font-bold text-gray-900 flex-1">Library</h1>
            <span
              className="px-3 py-1 rounded-full text-sm font-medium"
              style={{ backgroundColor: ageBand.color + '30', color: ageBand.color }}
            >
              {ageBand.label}
            </span>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search stories..."
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-100 border-0 focus:ring-2 focus:ring-primary-300 text-gray-900 placeholder-gray-500"
            />
          </div>

          {/* Category Filter */}
          <CategoryFilter
            value={selectedCategory}
            onChange={handleCategoryChange}
          />
        </div>
      </header>

      {/* Stories Grid */}
      <main className="px-4 py-6 max-w-4xl mx-auto">
        {filteredStories.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">📚</span>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              No Stories Found
            </h2>
            <p className="text-gray-500">
              {searchQuery
                ? `No stories match "${searchQuery}"`
                : 'No stories available in this category yet.'}
            </p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-4">
              {filteredStories.length} {filteredStories.length === 1 ? 'story' : 'stories'}
            </p>
            <StoryCardGrid
              stories={filteredStories}
              showProgress
              onStoryClick={handleStoryClick}
            />
          </>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 safe-area-inset-bottom">
        <div className="max-w-md mx-auto flex justify-around">
          <Link
            href={`/storysprout/read/${childId}`}
            className="flex flex-col items-center p-2 text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-xs mt-1">Home</span>
          </Link>
          <Link
            href={`/storysprout/read/${childId}/library`}
            className="flex flex-col items-center p-2 text-primary-600"
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
