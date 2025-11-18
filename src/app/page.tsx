import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/Button'
import { Shield, FileSearch, AlertTriangle, MessageSquare, CheckCircle } from 'lucide-react'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen flex flex-col">
      <Header user={user} />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-primary-50 to-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="flex justify-center mb-6">
              <Shield className="h-16 w-16 text-primary-600" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Detect Hidden Fees &<br />Predatory Terms
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              AI-powered analysis that helps you spot suspicious charges, understand complex terms, and protect your wallet.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href={user ? '/dashboard' : '/signup'}>
                <Button size="lg">
                  Get Started Free
                </Button>
              </Link>
              <Link href="#how-it-works">
                <Button variant="secondary" size="lg">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* What We Analyze */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              What You Can Analyze
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: 'Bills & Invoices',
                  description: 'Medical bills, utility bills, service invoices with hidden fees',
                },
                {
                  title: 'Repair Estimates',
                  description: 'Dental, auto, and home repair estimates with unclear charges',
                },
                {
                  title: 'Contracts',
                  description: 'Subscription agreements, loans, and service contracts',
                },
              ].map((item) => (
                <div key={item.title} className="text-center p-6 rounded-lg border border-gray-200">
                  <FileSearch className="h-10 w-10 text-primary-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              How It Works
            </h2>
            <div className="grid md:grid-cols-4 gap-8">
              {[
                {
                  step: '1',
                  title: 'Upload',
                  description: 'Upload a PDF, image, or paste text from your document',
                },
                {
                  step: '2',
                  title: 'Analyze',
                  description: 'Our AI scans for red flags, hidden fees, and predatory terms',
                },
                {
                  step: '3',
                  title: 'Review',
                  description: 'Get a plain-English summary with risk score and flagged items',
                },
                {
                  step: '4',
                  title: 'Act',
                  description: 'Use our suggested scripts to question charges or negotiate',
                },
              ].map((item) => (
                <div key={item.step} className="text-center">
                  <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              What You Get
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: AlertTriangle,
                  title: 'Red Flag Detection',
                  description: 'Automatic detection of suspicious fees and predatory terms',
                },
                {
                  icon: CheckCircle,
                  title: 'Risk Assessment',
                  description: 'Clear risk score so you know when to be concerned',
                },
                {
                  icon: FileSearch,
                  title: 'Plain English',
                  description: 'Complex terms explained in language you understand',
                },
                {
                  icon: MessageSquare,
                  title: 'Action Scripts',
                  description: 'Ready-to-use scripts to challenge suspicious charges',
                },
              ].map((item) => (
                <div key={item.title} className="p-4">
                  <item.icon className="h-8 w-8 text-primary-600 mb-3" />
                  <h3 className="font-semibold mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Privacy */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Shield className="h-12 w-12 text-primary-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Your Privacy Matters
            </h2>
            <p className="text-gray-600 mb-6">
              Your documents are processed securely and only used for analysis. We don't sell your data or share it with third parties. You can delete your analyses at any time.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-primary-600">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Stop Overpaying Today
            </h2>
            <p className="text-primary-100 mb-8">
              Join thousands of consumers who are taking control of their bills and contracts.
            </p>
            <Link href={user ? '/dashboard' : '/signup'}>
              <Button size="lg" variant="secondary">
                Start Your Free Analysis
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
