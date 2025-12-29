'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { AgeBandCard } from '@/components/storysprout'
import type { AgeBand, ReadingMode } from '@/lib/storysprout/types'
import { AGE_BANDS, CHILD_AVATARS, READING_MODES } from '@/lib/storysprout/types'

export default function AddChildPage() {
  const router = useRouter()
  const [step, setStep] = useState<'name' | 'age' | 'avatar' | 'mode'>('name')
  const [name, setName] = useState('')
  const [ageBand, setAgeBand] = useState<AgeBand | null>(null)
  const [avatar, setAvatar] = useState(CHILD_AVATARS[0].id)
  const [readingMode, setReadingMode] = useState<ReadingMode>('read_with_me')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!name || !ageBand) return

    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/storysprout/login')
        return
      }

      const { error: insertError } = await supabase
        .from('child_profiles')
        .insert({
          parent_user_id: user.id,
          name,
          age_band: ageBand,
          avatar_url: avatar,
          preferred_reading_mode: readingMode,
        })

      if (insertError) {
        throw insertError
      }

      router.push('/storysprout/dashboard')
    } catch (err) {
      console.error(err)
      setError('Failed to create profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const canProceed = () => {
    switch (step) {
      case 'name':
        return name.trim().length > 0
      case 'age':
        return ageBand !== null
      case 'avatar':
        return true
      case 'mode':
        return true
      default:
        return false
    }
  }

  const nextStep = () => {
    switch (step) {
      case 'name':
        setStep('age')
        break
      case 'age':
        setStep('avatar')
        break
      case 'avatar':
        setStep('mode')
        break
      case 'mode':
        handleSubmit()
        break
    }
  }

  const prevStep = () => {
    switch (step) {
      case 'age':
        setStep('name')
        break
      case 'avatar':
        setStep('age')
        break
      case 'mode':
        setStep('avatar')
        break
    }
  }

  const selectedAvatar = CHILD_AVATARS.find(a => a.id === avatar)

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      {/* Header */}
      <header className="p-4">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <Link
            href="/storysprout/dashboard"
            className="p-2 -ml-2 rounded-full hover:bg-white/50 transition-colors"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Link>
          <div className="flex gap-2">
            {['name', 'age', 'avatar', 'mode'].map((s, i) => (
              <div
                key={s}
                className={`w-2 h-2 rounded-full transition-all ${
                  s === step
                    ? 'w-6 bg-primary-500'
                    : ['name', 'age', 'avatar', 'mode'].indexOf(step) > i
                      ? 'bg-primary-300'
                      : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
          <div className="w-10" />
        </div>
      </header>

      {/* Content */}
      <main className="px-4 py-8 max-w-md mx-auto">
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-center">
            {error}
          </div>
        )}

        {/* Step: Name */}
        {step === 'name' && (
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Add a New Reader
            </h1>
            <p className="text-gray-500 mb-8">
              What's your child's name?
            </p>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter name..."
              className="w-full text-center text-2xl font-medium p-4 border-b-2 border-gray-200 focus:border-primary-500 outline-none bg-transparent"
              autoFocus
            />
          </div>
        )}

        {/* Step: Age */}
        {step === 'age' && (
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              How old is {name}?
            </h1>
            <p className="text-gray-500 mb-8">
              We'll show age-appropriate stories.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {Object.values(AGE_BANDS).map((band) => (
                <AgeBandCard
                  key={band.id}
                  ageBand={band.id}
                  isSelected={ageBand === band.id}
                  onClick={() => setAgeBand(band.id)}
                  showDescription
                />
              ))}
            </div>
          </div>
        )}

        {/* Step: Avatar */}
        {step === 'avatar' && (
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Choose an Avatar
            </h1>
            <p className="text-gray-500 mb-8">
              Pick a fun character for {name}!
            </p>
            <div className="grid grid-cols-5 gap-3 max-w-xs mx-auto">
              {CHILD_AVATARS.map((av) => (
                <button
                  key={av.id}
                  onClick={() => setAvatar(av.id)}
                  className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl transition-all ${
                    avatar === av.id
                      ? 'ring-4 ring-primary-500 scale-110'
                      : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: av.color }}
                >
                  {av.emoji}
                </button>
              ))}
            </div>

            {/* Preview */}
            <div className="mt-8">
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center text-5xl mx-auto shadow-lg"
                style={{ backgroundColor: selectedAvatar?.color }}
              >
                {selectedAvatar?.emoji}
              </div>
              <p className="mt-3 font-semibold text-gray-900">{name}</p>
            </div>
          </div>
        )}

        {/* Step: Reading Mode */}
        {step === 'mode' && (
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Default Reading Mode
            </h1>
            <p className="text-gray-500 mb-8">
              How does {name} prefer to read?
            </p>
            <div className="space-y-3">
              {Object.values(READING_MODES).map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setReadingMode(mode.id)}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                    readingMode === mode.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">{mode.icon}</span>
                    <div>
                      <h3 className="font-semibold text-gray-900">{mode.label}</h3>
                      <p className="text-sm text-gray-500">{mode.description}</p>
                    </div>
                    {readingMode === mode.id && (
                      <svg className="w-6 h-6 text-primary-500 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-12 flex gap-3">
          {step !== 'name' && (
            <Button
              variant="secondary"
              onClick={prevStep}
              className="flex-1"
            >
              Back
            </Button>
          )}
          <Button
            onClick={nextStep}
            disabled={!canProceed() || loading}
            isLoading={loading}
            className="flex-1"
          >
            {step === 'mode' ? 'Create Profile' : 'Continue'}
          </Button>
        </div>
      </main>
    </div>
  )
}
