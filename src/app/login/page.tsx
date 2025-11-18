'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card'
import { Shield } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        setError(authError.message)
        return
      }

      router.push(redirect)
      router.refresh()
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoLogin = async () => {
    setIsLoading(true)
    setError('')

    // Create a demo account with random email
    const demoEmail = `demo-${Date.now()}@redflagradar.test`
    const demoPassword = 'demo123456'

    try {
      // Sign up demo user
      const { error: signupError } = await supabase.auth.signUp({
        email: demoEmail,
        password: demoPassword,
        options: {
          data: { name: 'Demo User' },
        },
      })

      if (signupError) {
        setError(signupError.message)
        return
      }

      // Sign in
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: demoEmail,
        password: demoPassword,
      })

      if (loginError) {
        setError(loginError.message)
        return
      }

      router.push('/dashboard')
      router.refresh()
    } catch {
      setError('Failed to create demo account')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="text-center">
              <Shield className="h-10 w-10 text-primary-600 mx-auto mb-2" />
              <h1 className="text-2xl font-bold">Welcome Back</h1>
              <p className="text-gray-600 text-sm">Sign in to your account</p>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-danger-50 border border-danger-200 rounded-lg text-sm text-danger-700">
                  {error}
                </div>
              )}

              <Input
                id="email"
                type="email"
                label="Email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <Input
                id="password"
                type="password"
                label="Password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <Button type="submit" className="w-full" isLoading={isLoading}>
                Sign In
              </Button>
            </form>

            <div className="mt-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-2 text-gray-500">Or</span>
                </div>
              </div>

              <Button
                variant="secondary"
                className="w-full mt-4"
                onClick={handleDemoLogin}
                isLoading={isLoading}
              >
                Try Demo Account
              </Button>
            </div>
          </CardContent>

          <CardFooter>
            <p className="text-sm text-gray-600 text-center w-full">
              Don't have an account?{' '}
              <Link href="/signup" className="text-primary-600 hover:underline font-medium">
                Sign up
              </Link>
            </p>
          </CardFooter>
        </Card>
      </main>
    </div>
  )
}
