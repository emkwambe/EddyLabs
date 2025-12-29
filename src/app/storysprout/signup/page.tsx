'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default function StorySproutSignupPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      })

      if (signUpError) {
        setError(signUpError.message)
      } else {
        setSuccess(true)
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white flex flex-col">
        <header className="p-4">
          <Link href="/storysprout" className="flex items-center gap-2">
            <span className="text-2xl">📚</span>
            <span className="text-xl font-bold text-gray-900">StorySprout</span>
          </Link>
        </header>
        <main className="flex-1 flex items-center justify-center px-4 py-8">
          <div className="w-full max-w-sm text-center">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">✉️</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Check Your Email
            </h1>
            <p className="text-gray-500 mb-6">
              We've sent a confirmation link to <strong>{email}</strong>.
              Click the link to activate your account.
            </p>
            <Link href="/storysprout/login">
              <Button variant="secondary">
                Back to Sign In
              </Button>
            </Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white flex flex-col">
      {/* Header */}
      <header className="p-4">
        <Link href="/storysprout" className="flex items-center gap-2">
          <span className="text-2xl">📚</span>
          <span className="text-xl font-bold text-gray-900">StorySprout</span>
        </Link>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Create an Account
            </h1>
            <p className="text-gray-500">
              Start your family's reading journey
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-center text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Your Name
              </label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Parent Name"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="parent@example.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                minLength={6}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Must be at least 6 characters
              </p>
            </div>

            <Button
              type="submit"
              className="w-full"
              isLoading={loading}
            >
              Create Account
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Already have an account?{' '}
              <Link href="/storysprout/login" className="text-primary-600 font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </div>

          <div className="mt-8 p-4 bg-gray-50 rounded-xl">
            <h3 className="font-medium text-gray-900 text-sm mb-2">
              What you get:
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Free starter library
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Multiple child profiles
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Progress tracking
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Sight word learning
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  )
}
