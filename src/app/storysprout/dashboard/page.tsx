'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ChildProfileGrid, ChildReadingStats } from '@/components/storysprout'
import type { ChildProfile, ChildReadingSummary } from '@/lib/storysprout/types'
import { AGE_BANDS } from '@/lib/storysprout/types'

export default function ParentDashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<{ id: string; email: string } | null>(null)
  const [children, setChildren] = useState<ChildProfile[]>([])
  const [summaries, setSummaries] = useState<Map<string, ChildReadingSummary>>(new Map())
  const [recentActivity, setRecentActivity] = useState<{
    childName: string
    storyTitle: string
    date: string
  }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/storysprout/login')
        return
      }

      setUser({ id: user.id, email: user.email || '' })

      // Load children
      const { data: childrenData } = await supabase
        .from('child_profiles')
        .select('*')
        .eq('parent_user_id', user.id)
        .order('created_at')

      setChildren(childrenData || [])

      // Load reading summaries for each child
      if (childrenData && childrenData.length > 0) {
        const summaryMap = new Map<string, ChildReadingSummary>()

        for (const child of childrenData) {
          // Get completed stories count
          const { count: completedCount } = await supabase
            .from('reading_progress')
            .select('*', { count: 'exact', head: true })
            .eq('child_profile_id', child.id)
            .eq('is_completed', true)

          // Get started stories count
          const { count: startedCount } = await supabase
            .from('reading_progress')
            .select('*', { count: 'exact', head: true })
            .eq('child_profile_id', child.id)

          // Get total reading time
          const { data: timeData } = await supabase
            .from('reading_progress')
            .select('total_reading_time_seconds')
            .eq('child_profile_id', child.id)

          const totalSeconds = timeData?.reduce((sum, p) => sum + (p.total_reading_time_seconds || 0), 0) || 0

          // Get sight words count
          const { count: sightWordsCount } = await supabase
            .from('sight_word_exposures')
            .select('*', { count: 'exact', head: true })
            .eq('child_profile_id', child.id)

          // Get last reading date
          const { data: lastRead } = await supabase
            .from('reading_progress')
            .select('last_read_at')
            .eq('child_profile_id', child.id)
            .order('last_read_at', { ascending: false })
            .limit(1)

          summaryMap.set(child.id, {
            child_id: child.id,
            child_name: child.name,
            parent_user_id: user.id,
            stories_completed: completedCount || 0,
            stories_started: startedCount || 0,
            total_reading_minutes: Math.round(totalSeconds / 60),
            sight_words_encountered: sightWordsCount || 0,
            last_reading_date: lastRead?.[0]?.last_read_at || null,
          })
        }

        setSummaries(summaryMap)

        // Get recent activity
        const { data: sessions } = await supabase
          .from('reading_sessions')
          .select(`
            *,
            child_profiles(name),
            stories(title)
          `)
          .in('child_profile_id', childrenData.map(c => c.id))
          .order('started_at', { ascending: false })
          .limit(5)

        if (sessions) {
          setRecentActivity(
            sessions.map(s => ({
              childName: (s.child_profiles as { name: string })?.name || 'Unknown',
              storyTitle: (s.stories as { title: string })?.title || 'Unknown Story',
              date: new Date(s.started_at).toLocaleDateString(),
            }))
          )
        }
      }

      setLoading(false)
    }

    loadData()
  }, [router])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/storysprout')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  // Calculate totals
  const totalStoriesRead = Array.from(summaries.values()).reduce((sum, s) => sum + s.stories_completed, 0)
  const totalReadingMinutes = Array.from(summaries.values()).reduce((sum, s) => sum + s.total_reading_minutes, 0)
  const totalSightWords = Array.from(summaries.values()).reduce((sum, s) => sum + s.sight_words_encountered, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/storysprout" className="flex items-center gap-2">
            <span className="text-2xl">📚</span>
            <span className="text-xl font-bold text-gray-900">StorySprout</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/storysprout/read"
              className="px-4 py-2 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors"
            >
              Start Reading
            </Link>
            <div className="relative group">
              <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <div className="p-3 border-b border-gray-100">
                  <p className="text-sm text-gray-500 truncate">{user?.email}</p>
                </div>
                <Link
                  href="/storysprout/dashboard/settings"
                  className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-gray-50"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Parent Dashboard
          </h1>
          <p className="text-gray-600">
            Track your children's reading progress and manage their profiles.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-xl">📚</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{totalStoriesRead}</p>
                <p className="text-sm text-gray-500">Stories Read</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-xl">⏱️</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{totalReadingMinutes}</p>
                <p className="text-sm text-gray-500">Minutes Read</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                <span className="text-xl">✨</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{totalSightWords}</p>
                <p className="text-sm text-gray-500">Sight Words</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <span className="text-xl">👶</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{children.length}</p>
                <p className="text-sm text-gray-500">Readers</p>
              </div>
            </div>
          </div>
        </div>

        {/* Children Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Your Readers</h2>
            <Link
              href="/storysprout/dashboard/children/new"
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors text-sm"
            >
              + Add Child
            </Link>
          </div>
          <div className="p-5">
            {children.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">👶</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">No readers yet</h3>
                <p className="text-gray-500 mb-4">Add your first child to start tracking their reading journey.</p>
                <Link
                  href="/storysprout/dashboard/children/new"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors"
                >
                  Add Your First Reader
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {children.map((child) => {
                  const summary = summaries.get(child.id)
                  const ageBand = AGE_BANDS[child.age_band]

                  return (
                    <Link
                      key={child.id}
                      href={`/storysprout/dashboard/children/${child.id}`}
                      className="block p-4 rounded-xl border border-gray-100 hover:border-gray-300 hover:shadow-sm transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className="w-14 h-14 rounded-full flex items-center justify-center text-2xl"
                          style={{ backgroundColor: ageBand.color + '30' }}
                        >
                          {ageBand.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{child.name}</h3>
                          <p className="text-sm text-gray-500">
                            {ageBand.label} • {summary?.stories_completed || 0} stories read
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-primary-600">
                            {summary?.total_reading_minutes || 0} min
                          </p>
                          <p className="text-xs text-gray-500">
                            {summary?.last_reading_date
                              ? `Last read: ${new Date(summary.last_reading_date).toLocaleDateString()}`
                              : 'No activity yet'}
                          </p>
                        </div>
                        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        {recentActivity.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-5 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
            </div>
            <div className="p-5">
              <div className="space-y-3">
                {recentActivity.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 rounded-lg bg-gray-50"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                      <span className="text-lg">📖</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-900">
                        <span className="font-medium">{activity.childName}</span>
                        {' read '}
                        <span className="font-medium">{activity.storyTitle}</span>
                      </p>
                      <p className="text-xs text-gray-500">{activity.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
