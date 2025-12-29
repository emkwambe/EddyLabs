'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ChildProfileGrid } from '@/components/storysprout'
import type { ChildProfile } from '@/lib/storysprout/types'

export default function ChildSelectPage() {
  const router = useRouter()
  const [profiles, setProfiles] = useState<ChildProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadProfiles() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/storysprout/login')
        return
      }

      const { data, error } = await supabase
        .from('child_profiles')
        .select('*')
        .eq('parent_user_id', user.id)
        .order('created_at', { ascending: true })

      if (error) {
        setError('Failed to load profiles')
        console.error(error)
      } else {
        setProfiles(data || [])
      }
      setLoading(false)
    }

    loadProfiles()
  }, [router])

  const handleProfileClick = (profile: ChildProfile) => {
    router.push(`/storysprout/read/${profile.id}`)
  }

  const handleAddClick = () => {
    router.push('/storysprout/dashboard/children/new')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading profiles...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-purple-50 to-blue-50">
      {/* Header */}
      <header className="pt-8 pb-4 px-4 text-center">
        <Link href="/storysprout" className="inline-flex items-center gap-2 mb-8">
          <span className="text-4xl">📚</span>
          <span className="text-2xl font-bold text-gray-900">StorySprout</span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="px-4 py-8 max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Who's Reading Today?
          </h1>
          <p className="text-gray-600">
            Tap your picture to start reading!
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-8 text-center">
            {error}
          </div>
        )}

        {profiles.length === 0 && !error ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">👶</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No Readers Yet
            </h2>
            <p className="text-gray-500 mb-6">
              Add your first child to get started!
            </p>
            <button
              onClick={handleAddClick}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-full font-medium hover:bg-primary-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Child
            </button>
          </div>
        ) : (
          <ChildProfileGrid
            profiles={profiles}
            onProfileClick={handleProfileClick}
            onAddClick={handleAddClick}
            size="lg"
          />
        )}

        {/* Parent Mode Link */}
        <div className="mt-16 text-center">
          <Link
            href="/storysprout/dashboard"
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Parent / Educator Dashboard →
          </Link>
        </div>
      </main>

      {/* Decorative Elements */}
      <div className="fixed bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent pointer-events-none" />
      <div className="fixed bottom-4 left-4 text-4xl opacity-50">🌸</div>
      <div className="fixed bottom-4 right-4 text-4xl opacity-50">🌻</div>
    </div>
  )
}
