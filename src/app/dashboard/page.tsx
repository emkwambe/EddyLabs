import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { RiskBadge } from '@/components/ui/Badge'
import { formatDate } from '@/lib/utils'
import { Plus, FileText, Eye, Trash2 } from 'lucide-react'
import { DeleteAnalysisButton } from './DeleteAnalysisButton'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Fetch user's analyses
  const { data: analyses } = await supabase
    .from('analyses')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const documentTypeLabels: Record<string, string> = {
    INVOICE: 'Invoice',
    ESTIMATE_DENTAL: 'Dental Estimate',
    ESTIMATE_AUTO: 'Auto Repair',
    ESTIMATE_HOME_REPAIR: 'Home Repair',
    CONTRACT_SUBSCRIPTION: 'Subscription',
    LOAN_AGREEMENT: 'Loan',
    OTHER: 'Other',
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header user={user} />

      <main className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Analyses</h1>
              <p className="text-gray-600">View and manage your document analyses</p>
            </div>
            <Link href="/dashboard/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Analysis
              </Button>
            </Link>
          </div>

          {!analyses || analyses.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No analyses yet</h3>
                <p className="text-gray-600 mb-6">
                  Upload your first document to get started with RedFlagRadar
                </p>
                <Link href="/dashboard/new">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    New Analysis
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {analyses.map((analysis) => (
                <Card key={analysis.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <FileText className="h-6 w-6 text-gray-600" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">
                              {analysis.document_type
                                ? documentTypeLabels[analysis.document_type]
                                : 'Document'}
                            </span>
                            {analysis.risk_label && (
                              <RiskBadge label={analysis.risk_label} />
                            )}
                            {analysis.status === 'PROCESSING' && (
                              <span className="text-xs text-primary-600 animate-pulse">
                                Processing...
                              </span>
                            )}
                            {analysis.status === 'FAILED' && (
                              <span className="text-xs text-danger-600">
                                Failed
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">
                            {formatDate(analysis.created_at)} &middot; {analysis.source_type.toLowerCase()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {analysis.status === 'COMPLETE' && (
                          <Link href={`/analyses/${analysis.id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </Link>
                        )}
                        <DeleteAnalysisButton analysisId={analysis.id} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
