import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import {
  Shield,
  FileSearch,
  AlertTriangle,
  MessageSquare,
  CheckCircle,
  TrendingUp,
  Users,
  Award,
  Lock,
  Zap,
  Target,
} from 'lucide-react';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';
import { Testimonial } from '@/components/landing/Testimonial';
import { FAQAccordion } from '@/components/landing/FAQAccordion';
import { DemoPreview } from '@/components/landing/DemoPreview';

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const testimonials = [
    {
      name: 'Sarah Mitchell',
      role: 'Small Business Owner',
      content:
        "Fairlytica caught a $450 overcharge on my auto repair bill. The mechanic tried to charge me for diagnostic labor AND a diagnostic fee. I confronted them with the analysis and they immediately adjusted the bill.",
      rating: 5,
      savings: '$450',
    },
    {
      name: 'James Rodriguez',
      role: 'Teacher',
      content:
        'My dental estimate had a bunch of unnecessary procedures. Fairlytica flagged them and gave me scripts to question my dentist. Saved me over $800!',
      rating: 5,
      savings: '$800',
    },
    {
      name: 'Emily Chen',
      role: 'Marketing Manager',
      content:
        'The contract for my SaaS subscription had auto-renewal with a 20% price increase. I would have missed it completely. Canceled before renewal and switched to a better provider.',
      rating: 5,
      savings: '$1,200/year',
    },
  ];

  const faqItems = [
    {
      question: 'How does Fairlytica detect hidden fees?',
      answer:
        'Our AI analyzes your document against thousands of patterns and industry standards. It looks for common red flags like double-billing, excessive markups, predatory terms, and unnecessary services. We also compare prices to industry benchmarks when applicable.',
    },
    {
      question: 'Is my document data secure and private?',
      answer:
        'Absolutely. Your documents are encrypted in transit and at rest. We only process them for analysis and never sell or share your data with third parties. You can delete your analyses at any time, and they are permanently removed from our servers.',
    },
    {
      question: 'What types of documents can I analyze?',
      answer:
        'You can analyze medical bills, auto repair estimates, dental estimates, home repair quotes, service contracts, subscription agreements, loan documents, utility bills, and more. If it has fees or charges, we can analyze it.',
    },
    {
      question: 'How accurate is the analysis?',
      answer:
        'Our AI has been trained on thousands of real-world documents and is continuously improving. While we achieve high accuracy, we always recommend using our analysis as a starting point for your own review and consulting with professionals for major decisions.',
    },
    {
      question: 'Is there a limit to how many documents I can analyze?',
      answer:
        'Free accounts can analyze up to 3 documents per month. Paid plans offer unlimited analyses, priority processing, and advanced features like bulk analysis and API access.',
    },
    {
      question: 'What happens after I upload a document?',
      answer:
        'Our AI extracts text from your document (using OCR if needed), analyzes it for red flags, calculates a risk score, and provides actionable recommendations. The entire process typically takes 30-60 seconds. You can then view, download, or share your analysis.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header user={user} />

      <main className="flex-1">
        {/* Hero Section - Enhanced */}
        <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 py-20 md:py-28 overflow-hidden">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-white rounded-full blur-3xl" />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-full p-4">
                <Shield className="h-16 w-16 text-white" />
              </div>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Stop Overpaying on
              <br />
              <span className="text-primary-200">Bills & Contracts</span>
            </h1>

            <p className="text-xl md:text-2xl text-primary-100 mb-10 max-w-3xl mx-auto">
              AI-powered analysis that spots hidden fees, predatory terms, and
              suspicious charges in seconds.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href={user ? '/dashboard' : '/signup'}>
                <Button size="lg" variant="secondary" className="text-lg px-8 py-4">
                  <Zap className="mr-2 h-5 w-5" />
                  Start Free Analysis
                </Button>
              </Link>
              <Link href="#demo">
                <Button
                  size="lg"
                  className="bg-white/10 hover:bg-white/20 text-white border-2 border-white/30 text-lg px-8 py-4"
                >
                  See Demo
                </Button>
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center justify-center gap-8 text-primary-100">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                <span className="text-sm">No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                <span className="text-sm">Bank-level encryption</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                <span className="text-sm">Trusted by 10,000+ users</span>
              </div>
            </div>
          </div>
        </section>

        {/* Statistics Section - NEW */}
        <section className="py-16 bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-4 gap-8 text-center">
              <div className="p-6">
                <TrendingUp className="h-10 w-10 text-primary-600 mx-auto mb-3" />
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  $<AnimatedCounter end={2500000} duration={2500} />+
                </div>
                <p className="text-gray-600">Total Savings Identified</p>
              </div>
              <div className="p-6">
                <Users className="h-10 w-10 text-primary-600 mx-auto mb-3" />
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  <AnimatedCounter end={10000} duration={2000} />+
                </div>
                <p className="text-gray-600">Active Users</p>
              </div>
              <div className="p-6">
                <FileSearch className="h-10 w-10 text-primary-600 mx-auto mb-3" />
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  <AnimatedCounter end={45000} duration={2500} />+
                </div>
                <p className="text-gray-600">Documents Analyzed</p>
              </div>
              <div className="p-6">
                <Target className="h-10 w-10 text-primary-600 mx-auto mb-3" />
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  <AnimatedCounter end={87} duration={2000} />%
                </div>
                <p className="text-gray-600">Red Flags Detected</p>
              </div>
            </div>
          </div>
        </section>

        {/* Demo Preview Section - NEW */}
        <section id="demo" className="py-20 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                See It In Action
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Watch how Fairlytica analyzes a real auto repair estimate and
                identifies over $450 in potential savings.
              </p>
            </div>
            <DemoPreview />
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
                  description:
                    'Medical bills, utility bills, service invoices with hidden fees',
                  examples: ['Medical bills', 'Utility bills', 'Service invoices'],
                },
                {
                  title: 'Repair Estimates',
                  description:
                    'Dental, auto, and home repair estimates with unclear charges',
                  examples: ['Auto repair', 'Dental work', 'Home repairs'],
                },
                {
                  title: 'Contracts',
                  description: 'Subscription agreements, loans, and service contracts',
                  examples: ['SaaS subscriptions', 'Loan agreements', 'Service contracts'],
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="text-center p-6 rounded-xl border border-gray-200 hover:border-primary-300 hover:shadow-lg transition-all"
                >
                  <FileSearch className="h-12 w-12 text-primary-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                  <p className="text-gray-600 mb-4">{item.description}</p>
                  <ul className="text-sm text-gray-500 space-y-1">
                    {item.examples.map((example) => (
                      <li key={example}>✓ {example}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 text-center mb-16 max-w-2xl mx-auto">
              Get your analysis in under 60 seconds
            </p>

            <div className="grid md:grid-cols-4 gap-8">
              {[
                {
                  step: '1',
                  title: 'Upload',
                  description: 'Upload a PDF, image, or paste text from your document',
                  icon: FileSearch,
                },
                {
                  step: '2',
                  title: 'Analyze',
                  description: 'Our AI scans for red flags, hidden fees, and predatory terms',
                  icon: Zap,
                },
                {
                  step: '3',
                  title: 'Review',
                  description: 'Get a plain-English summary with risk score and flagged items',
                  icon: Target,
                },
                {
                  step: '4',
                  title: 'Act',
                  description: 'Use our suggested scripts to question charges or negotiate',
                  icon: MessageSquare,
                },
              ].map((item) => (
                <div key={item.step} className="text-center relative">
                  {/* Connector Line (hidden on mobile) */}
                  {item.step !== '4' && (
                    <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-0.5 bg-gray-300" />
                  )}

                  <div className="relative bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="w-14 h-14 bg-gradient-to-br from-primary-600 to-primary-700 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 relative z-10">
                      {item.step}
                    </div>
                    <item.icon className="h-10 w-10 text-primary-600 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                    <p className="text-gray-600 text-sm">{item.description}</p>
                  </div>
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
                <div
                  key={item.title}
                  className="p-6 rounded-lg border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all"
                >
                  <div className="bg-primary-50 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
                    <item.icon className="h-6 w-6 text-primary-600" />
                  </div>
                  <h3 className="font-semibold mb-2 text-lg">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials - NEW */}
        <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Real People, Real Savings
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Join thousands who have saved money using Fairlytica
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <Testimonial key={index} {...testimonial} />
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section - NEW */}
        <section className="py-20 bg-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-xl text-gray-600">
                Everything you need to know about Fairlytica
              </p>
            </div>

            <FAQAccordion items={faqItems} />
          </div>
        </section>

        {/* Privacy */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
              <div className="bg-primary-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-primary-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Your Privacy Matters
              </h2>
              <p className="text-gray-600 mb-6">
                Your documents are encrypted and processed securely. We never sell
                your data or share it with third parties. You can delete your
                analyses at any time.
              </p>
              <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  <span>256-bit encryption</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <span>SOC 2 Compliant</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>GDPR Ready</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA - Enhanced */}
        <section className="py-20 bg-gradient-to-br from-primary-600 to-primary-800 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 right-10 w-64 h-64 bg-white rounded-full blur-3xl" />
            <div className="absolute bottom-10 left-10 w-96 h-96 bg-white rounded-full blur-3xl" />
          </div>

          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Stop Overpaying Today
            </h2>
            <p className="text-xl text-primary-100 mb-10 max-w-2xl mx-auto">
              Join{' '}
              <span className="font-semibold text-white">
                <AnimatedCounter end={10000} />+
              </span>{' '}
              consumers who are taking control of their bills and contracts.
            </p>

            <Link href={user ? '/dashboard' : '/signup'}>
              <Button
                size="lg"
                variant="secondary"
                className="text-lg px-10 py-5 shadow-xl hover:shadow-2xl"
              >
                <Zap className="mr-2 h-5 w-5" />
                Start Your Free Analysis
              </Button>
            </Link>

            <p className="mt-6 text-primary-200 text-sm">
              No credit card required • 3 free analyses • Cancel anytime
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
