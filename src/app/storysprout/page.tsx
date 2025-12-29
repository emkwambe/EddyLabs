import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/Button'
import { AGE_BANDS, CATEGORIES, READING_MODES } from '@/lib/storysprout/types'

export const metadata = {
  title: 'StorySprout - Where Little Readers Grow',
  description: 'A mobile-first digital reading platform for children ages 2-10. Beautiful stories, curriculum-aligned content, and sight word learning.',
}

export default async function StorySproutLandingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const ageBands = Object.values(AGE_BANDS)
  const categories = Object.values(CATEGORIES).slice(0, 4)
  const readingModes = Object.values(READING_MODES)

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/storysprout" className="flex items-center gap-2">
              <span className="text-3xl">📚</span>
              <span className="text-xl font-bold text-gray-900">StorySprout</span>
            </Link>
            <div className="flex items-center gap-4">
              {user ? (
                <Link href="/storysprout/dashboard">
                  <Button size="sm">My Library</Button>
                </Link>
              ) : (
                <>
                  <Link href="/storysprout/login">
                    <Button variant="ghost" size="sm">Log In</Button>
                  </Link>
                  <Link href="/storysprout/signup">
                    <Button size="sm">Get Started</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-16">
        {/* Hero Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <div className="flex -space-x-4">
                {['🌸', '🌱', '🌿', '🌳', '🌻', '🌺'].map((emoji, i) => (
                  <div
                    key={i}
                    className="w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center text-3xl border-4 border-white"
                    style={{ transform: `rotate(${(i - 2.5) * 10}deg)` }}
                  >
                    {emoji}
                  </div>
                ))}
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Where Little Readers
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500">
                Grow & Flourish
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Beautiful, curriculum-aligned stories for children ages 2-10.
              Build early literacy, vocabulary, and emotional understanding through
              age-appropriate narratives and guided reading experiences.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href={user ? '/storysprout/dashboard' : '/storysprout/signup'}>
                <Button size="lg" className="w-full sm:w-auto text-lg px-8 py-4">
                  Start Reading Free
                </Button>
              </Link>
              <Link href="#features">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto text-lg px-8 py-4">
                  Learn More
                </Button>
              </Link>
            </div>
            <p className="mt-4 text-sm text-gray-500">
              No ads. No games. Just beautiful stories.
            </p>
          </div>
        </section>

        {/* Age Bands Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Stories for Every Stage
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Developmentally aligned content that grows with your child,
                from first picture books to independent reading adventures.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {ageBands.map((band) => (
                <div
                  key={band.id}
                  className="p-6 rounded-2xl text-center transition-all hover:shadow-lg hover:-translate-y-1"
                  style={{ backgroundColor: band.color + '20' }}
                >
                  <span className="text-4xl mb-3 block">{band.icon}</span>
                  <h3 className="font-bold text-gray-900">{band.label}</h3>
                  <p className="text-sm text-gray-600">
                    Ages {band.ageRange[0]}-{band.ageRange[1]}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    {band.readingFocus}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 bg-gradient-to-b from-white to-purple-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Reading Modes for Every Learner
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Three thoughtfully designed reading experiences that meet
                children where they are in their literacy journey.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {readingModes.map((mode) => (
                <div
                  key={mode.id}
                  className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow"
                >
                  <span className="text-5xl mb-4 block">{mode.icon}</span>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {mode.label}
                  </h3>
                  <p className="text-gray-600 mb-4">{mode.description}</p>
                  <ul className="space-y-2">
                    {mode.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-gray-500">
                        <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Story Categories */}
        <section className="py-16 bg-purple-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Story Categories
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                From calming bedtime tales to curriculum-aligned learning stories,
                there's something for every moment.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center gap-4 p-5 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow"
                >
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl"
                    style={{ backgroundColor: category.color + '20' }}
                  >
                    {category.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{category.label}</h3>
                    <p className="text-sm text-gray-500 line-clamp-1">
                      {category.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Sight Words & Curriculum */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <span className="text-6xl mb-4 block">✨</span>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Sight Words, Naturally Woven
                </h2>
                <p className="text-gray-600 mb-6">
                  No flashcard fatigue here. Sight words are seamlessly integrated
                  into engaging stories, so learning happens naturally as children read.
                </p>
                <ul className="space-y-3">
                  {[
                    '5-7 target sight words per story',
                    'Visual emphasis on first appearance',
                    'Tap-to-hear pronunciation',
                    'Progress tracking for parents',
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-gray-700">
                      <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                        <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <span className="text-6xl mb-4 block">📋</span>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Curriculum Aligned
                </h2>
                <p className="text-gray-600 mb-6">
                  Every story is mapped to reading standards, sight word lists,
                  and emotional learning objectives. Parents feel confident,
                  and educators can trust the content.
                </p>
                <ul className="space-y-3">
                  {[
                    'Phonics progression alignment',
                    'Grade-specific vocabulary',
                    'Comprehension skill building',
                    'Social-emotional learning',
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-gray-700">
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                        <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Safety Section */}
        <section className="py-16 bg-gradient-to-b from-white to-green-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center text-4xl mx-auto mb-6">
              🛡️
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Safe & Trusted
            </h2>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Designed with children's safety as the top priority.
              No ads, no external links, no social features for kids.
            </p>
            <div className="grid sm:grid-cols-3 gap-6">
              {[
                { icon: '🚫', label: 'No Ads', desc: 'Ever. Period.' },
                { icon: '🔒', label: 'COPPA Compliant', desc: 'Privacy-first design' },
                { icon: '📱', label: 'Offline Mode', desc: 'Read anywhere' },
              ].map((item, i) => (
                <div key={i} className="p-4 bg-white rounded-xl shadow-sm">
                  <span className="text-3xl">{item.icon}</span>
                  <h3 className="font-semibold text-gray-900 mt-2">{item.label}</h3>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Parent Features */}
        <section className="py-16 bg-green-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                For Parents & Educators
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Track progress, manage reading time, and see exactly
                which skills your child is developing.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: '👶', title: 'Child Profiles', desc: 'Track multiple children with age-appropriate content' },
                { icon: '📊', title: 'Reading Insights', desc: 'See time spent reading and stories completed' },
                { icon: '🎯', title: 'Sight Word Tracking', desc: 'Monitor word exposure and mastery' },
                { icon: '🌙', title: 'Bedtime Mode', desc: 'Lock screen time with bedtime controls' },
              ].map((item, i) => (
                <div key={i} className="bg-white p-6 rounded-xl shadow-sm">
                  <span className="text-3xl mb-3 block">{item.icon}</span>
                  <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Start Your Reading Journey Today
            </h2>
            <p className="text-white/90 mb-8 text-lg">
              Join thousands of families building a love of reading,
              one story at a time.
            </p>
            <Link href={user ? '/storysprout/dashboard' : '/storysprout/signup'}>
              <Button size="lg" variant="secondary" className="text-lg px-10 py-4">
                Get Started Free
              </Button>
            </Link>
            <p className="mt-4 text-white/70 text-sm">
              Free stories to start. Premium for unlimited access.
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 bg-gray-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📚</span>
                <span className="text-xl font-bold">StorySprout</span>
              </div>
              <div className="flex gap-8 text-sm text-gray-400">
                <Link href="/storysprout/about" className="hover:text-white transition-colors">About</Link>
                <Link href="/storysprout/privacy" className="hover:text-white transition-colors">Privacy</Link>
                <Link href="/storysprout/terms" className="hover:text-white transition-colors">Terms</Link>
                <Link href="/storysprout/contact" className="hover:text-white transition-colors">Contact</Link>
              </div>
              <p className="text-sm text-gray-500">
                © {new Date().getFullYear()} StorySprout. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}
