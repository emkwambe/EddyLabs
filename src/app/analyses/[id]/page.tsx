import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'
import { RiskBadge, Badge } from '@/components/ui/Badge'
import { formatDate, formatCurrency } from '@/lib/utils'
import { AlertTriangle, CheckCircle, MessageSquare, Copy, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { FeedbackSection } from './FeedbackSection'
import { CopyButton } from './CopyButton'
import { VehicleShopContext } from '@/components/analysis/VehicleShopContext'
import { SavingsCallout } from '@/components/analysis/SavingsCallout'
import { PricingGauge } from '@/components/analysis/PricingGauge'
import { FeeAnalysisPanel } from '@/components/analysis/FeeAnalysisPanel'
import { DoubleBillingAlert } from '@/components/analysis/DoubleBillingAlert'
import { ShopReputationCard } from '@/components/analysis/ShopReputationCard'
import type { VehicleInfo, ShopInfo, FeeAnalysisResult, DoubleBillingResult, PriceComparison, ShopReputationResult } from '@/lib/types'

export default async function AnalysisDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Fetch analysis with related data
  const { data: analysis, error } = await supabase
    .from('analyses')
    .select(`
      *,
      red_flags (*),
      recommendations (*),
      feedback (*)
    `)
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error || !analysis) {
    redirect('/dashboard')
  }

  const documentTypeLabels: Record<string, string> = {
    INVOICE: 'Invoice',
    ESTIMATE_DENTAL: 'Dental Estimate',
    ESTIMATE_AUTO: 'Auto Repair Estimate',
    ESTIMATE_HOME_REPAIR: 'Home Repair Estimate',
    CONTRACT_SUBSCRIPTION: 'Subscription Contract',
    LOAN_AGREEMENT: 'Loan Agreement',
    OTHER: 'Document',
  }

  const severityColors: Record<string, string> = {
    HIGH: 'danger',
    MEDIUM: 'warning',
    LOW: 'default',
  }

  const extractedFields = analysis.extracted_fields as {
    total_cost?: number
    provider_name?: string
    consumer_name?: string
    line_items?: Array<{
      description: string
      quantity?: number
      unit_price?: number
      line_total?: number
    }>
    taxes_and_fees?: Array<{ name: string; amount: number }>
    vehicle_info?: VehicleInfo | null
    shop_info?: ShopInfo | null
  } | null

  // Extract additional analysis fields
  const feeAnalysis = analysis.fee_analysis as FeeAnalysisResult | null | undefined
  const doubleBilling = analysis.double_billing_check as DoubleBillingResult | null | undefined
  const priceComparison = analysis.price_comparison as PriceComparison | null | undefined
  const shopReputation = analysis.shop_reputation as ShopReputationResult | null | undefined

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header user={user} />

      <main className="flex-1 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/dashboard"
            className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Dashboard
          </Link>

          {/* Vehicle and Shop Context */}
          <VehicleShopContext
            vehicleInfo={extractedFields?.vehicle_info}
            shopInfo={extractedFields?.shop_info}
          />

          {/* Savings Callout */}
          <SavingsCallout priceComparison={priceComparison} />

          {/* Header */}
          <Card className="mb-6">
            <CardContent className="py-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <h1 className="text-2xl font-bold">
                      {documentTypeLabels[analysis.document_type || 'OTHER']}
                    </h1>
                    {analysis.risk_label && (
                      <RiskBadge label={analysis.risk_label} />
                    )}
                  </div>
                  <p className="text-gray-500 text-sm">
                    Analyzed on {formatDate(analysis.created_at)}
                  </p>
                </div>

                {extractedFields?.total_cost && (
                  <div className="mt-4 md:mt-0 text-right">
                    <p className="text-sm text-gray-500">Total Cost</p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(extractedFields.total_cost)}
                    </p>
                  </div>
                )}
              </div>

              {analysis.risk_score !== null && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Risk Score</span>
                    <span className="font-medium">{analysis.risk_score}/100</span>
                  </div>
                  <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        analysis.risk_score <= 20
                          ? 'bg-success-500'
                          : analysis.risk_score <= 50
                          ? 'bg-warning-500'
                          : 'bg-danger-500'
                      }`}
                      style={{ width: `${analysis.risk_score}%` }}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Summary */}
          {analysis.summary && (
            <Card className="mb-6">
              <CardHeader>
                <h2 className="text-lg font-semibold">Summary</h2>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{analysis.summary}</p>
              </CardContent>
            </Card>
          )}

          {/* Pricing Analysis & Shop Reputation */}
          {(priceComparison || feeAnalysis || shopReputation) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Left column: Pricing & Fees */}
              {(priceComparison || feeAnalysis) && (
                <Card>
                  <CardHeader>
                    <h2 className="text-lg font-semibold">Pricing Analysis</h2>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <PricingGauge priceComparison={priceComparison} />
                    {feeAnalysis && (
                      <div className="pt-6 border-t border-gray-200">
                        <FeeAnalysisPanel feeAnalysis={feeAnalysis} />
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Right column: Shop Reputation */}
              {shopReputation && (
                <Card>
                  <CardHeader>
                    <h2 className="text-lg font-semibold">Shop Information</h2>
                  </CardHeader>
                  <CardContent>
                    <ShopReputationCard reputation={shopReputation} />
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Double Billing Alert */}
          {doubleBilling && doubleBilling.hasDoubleBilling && (
            <div className="mb-6">
              <DoubleBillingAlert doubleBilling={doubleBilling} />
            </div>
          )}

          {/* Red Flags */}
          {analysis.red_flags && analysis.red_flags.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-danger-500" />
                  <h2 className="text-lg font-semibold">Red Flags</h2>
                  <span className="text-sm text-gray-500">
                    ({analysis.red_flags.length} found)
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analysis.red_flags.map((flag: {
                    id: string
                    severity: string
                    flag_type: string
                    explanation: string
                    snippet?: string
                  }) => (
                    <div
                      key={flag.id}
                      className="p-4 border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <Badge
                          variant={severityColors[flag.severity] as 'danger' | 'warning' | 'default'}
                        >
                          {flag.severity}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {flag.flag_type.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-2">{flag.explanation}</p>
                      {flag.snippet && (
                        <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-600 font-mono">
                          "{flag.snippet}"
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Cost Breakdown */}
          {extractedFields?.line_items && extractedFields.line_items.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <h2 className="text-lg font-semibold">Cost Breakdown</h2>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 font-medium">Description</th>
                        <th className="text-right py-2 font-medium">Qty</th>
                        <th className="text-right py-2 font-medium">Price</th>
                        <th className="text-right py-2 font-medium">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {extractedFields.line_items.map((item, i) => (
                        <tr key={i} className="border-b border-gray-100">
                          <td className="py-2">{item.description}</td>
                          <td className="text-right py-2">{item.quantity || '-'}</td>
                          <td className="text-right py-2">
                            {item.unit_price ? formatCurrency(item.unit_price) : '-'}
                          </td>
                          <td className="text-right py-2 font-medium">
                            {item.line_total ? formatCurrency(item.line_total) : '-'}
                          </td>
                        </tr>
                      ))}
                      {extractedFields.taxes_and_fees?.map((fee, i) => (
                        <tr key={`fee-${i}`} className="border-b border-gray-100 text-gray-600">
                          <td className="py-2" colSpan={3}>
                            {fee.name}
                          </td>
                          <td className="text-right py-2">
                            {formatCurrency(fee.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    {extractedFields.total_cost && (
                      <tfoot>
                        <tr className="font-semibold">
                          <td className="py-2" colSpan={3}>
                            Total
                          </td>
                          <td className="text-right py-2">
                            {formatCurrency(extractedFields.total_cost)}
                          </td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recommendations */}
          {analysis.recommendations && analysis.recommendations.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-success-500" />
                  <h2 className="text-lg font-semibold">What You Can Do</h2>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analysis.recommendations.map((rec: {
                    id: string
                    title: string
                    body: string
                    script_example?: string
                  }) => (
                    <div
                      key={rec.id}
                      className="p-4 border border-gray-200 rounded-lg"
                    >
                      <h3 className="font-medium mb-2">{rec.title}</h3>
                      <p className="text-gray-600 text-sm mb-3">{rec.body}</p>
                      {rec.script_example && (
                        <div className="relative">
                          <div className="flex items-start space-x-2 p-3 bg-primary-50 rounded-lg">
                            <MessageSquare className="h-4 w-4 text-primary-600 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-primary-800 flex-1">
                              "{rec.script_example}"
                            </p>
                            <CopyButton text={rec.script_example} />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Feedback */}
          <Card className="mb-6">
            <CardHeader>
              <h2 className="text-lg font-semibold">Was this helpful?</h2>
            </CardHeader>
            <CardContent>
              <FeedbackSection
                analysisId={analysis.id}
                existingFeedback={analysis.feedback?.[0]}
              />
            </CardContent>
          </Card>

          {/* Disclaimer */}
          <div className="text-center p-4 bg-gray-100 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>Disclaimer:</strong> This analysis is for informational purposes only and does not constitute legal, financial, or professional advice. Always consult qualified professionals for important decisions.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
