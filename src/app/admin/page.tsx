import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/Header'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'
import { RiskBadge, Badge } from '@/components/ui/Badge'
import { formatDate } from '@/lib/utils'
import { BarChart3, ThumbsUp, ThumbsDown, FileText, AlertTriangle } from 'lucide-react'

export default async function AdminPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login?redirect=/admin')
  }

  // Fetch all analyses with admin API
  const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/admin/analyses`, {
    headers: {
      Cookie: `sb-access-token=${(await supabase.auth.getSession()).data.session?.access_token}`,
    },
    cache: 'no-store',
  })

  let analyses: any[] = []
  let stats = { total: 0, helpful: 0, notHelpful: 0 }

  if (response.ok) {
    const data = await response.json()
    analyses = data.analyses || []
    stats = data.stats || stats
  }

  const documentTypeLabels: Record<string, string> = {
    INVOICE: 'Invoice',
    ESTIMATE_DENTAL: 'Dental',
    ESTIMATE_AUTO: 'Auto',
    ESTIMATE_HOME_REPAIR: 'Home',
    CONTRACT_SUBSCRIPTION: 'Subscription',
    LOAN_AGREEMENT: 'Loan',
    OTHER: 'Other',
  }

  // Calculate statistics
  const totalAnalyses = analyses.length
  const completedAnalyses = analyses.filter(a => a.status === 'COMPLETE').length
  const failedAnalyses = analyses.filter(a => a.status === 'FAILED').length
  const avgRiskScore = completedAnalyses > 0
    ? Math.round(analyses.filter(a => a.risk_score).reduce((sum, a) => sum + a.risk_score, 0) / completedAnalyses)
    : 0

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} />

      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">System overview and debug information</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="py-4 text-center">
                <FileText className="h-8 w-8 text-primary-600 mx-auto mb-2" />
                <p className="text-2xl font-bold">{totalAnalyses}</p>
                <p className="text-sm text-gray-500">Total Analyses</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="py-4 text-center">
                <BarChart3 className="h-8 w-8 text-warning-600 mx-auto mb-2" />
                <p className="text-2xl font-bold">{avgRiskScore}</p>
                <p className="text-sm text-gray-500">Avg Risk Score</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="py-4 text-center">
                <ThumbsUp className="h-8 w-8 text-success-600 mx-auto mb-2" />
                <p className="text-2xl font-bold">{stats.helpful}</p>
                <p className="text-sm text-gray-500">Helpful</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="py-4 text-center">
                <ThumbsDown className="h-8 w-8 text-danger-600 mx-auto mb-2" />
                <p className="text-2xl font-bold">{stats.notHelpful}</p>
                <p className="text-sm text-gray-500">Not Helpful</p>
              </CardContent>
            </Card>
          </div>

          {/* Status Breakdown */}
          <Card className="mb-8">
            <CardHeader>
              <h2 className="text-lg font-semibold">Status Breakdown</h2>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-4">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-success-500 rounded-full mr-2" />
                  <span className="text-sm">Complete: {completedAnalyses}</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-danger-500 rounded-full mr-2" />
                  <span className="text-sm">Failed: {failedAnalyses}</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-primary-500 rounded-full mr-2" />
                  <span className="text-sm">Processing: {totalAnalyses - completedAnalyses - failedAnalyses}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Analyses */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Recent Analyses</h2>
            </CardHeader>
            <CardContent>
              {analyses.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No analyses yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-2 font-medium">Date</th>
                        <th className="text-left py-3 px-2 font-medium">User</th>
                        <th className="text-left py-3 px-2 font-medium">Type</th>
                        <th className="text-left py-3 px-2 font-medium">Status</th>
                        <th className="text-left py-3 px-2 font-medium">Risk</th>
                        <th className="text-left py-3 px-2 font-medium">Flags</th>
                        <th className="text-left py-3 px-2 font-medium">Feedback</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analyses.slice(0, 50).map((analysis) => (
                        <tr key={analysis.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-2 text-gray-600">
                            {formatDate(analysis.created_at)}
                          </td>
                          <td className="py-3 px-2">
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {analysis.users?.email?.split('@')[0] || 'Unknown'}
                            </span>
                          </td>
                          <td className="py-3 px-2">
                            {documentTypeLabels[analysis.document_type] || '-'}
                          </td>
                          <td className="py-3 px-2">
                            {analysis.status === 'COMPLETE' && (
                              <Badge variant="success">Complete</Badge>
                            )}
                            {analysis.status === 'FAILED' && (
                              <Badge variant="danger">Failed</Badge>
                            )}
                            {analysis.status === 'PROCESSING' && (
                              <Badge>Processing</Badge>
                            )}
                            {analysis.status === 'PENDING' && (
                              <Badge>Pending</Badge>
                            )}
                          </td>
                          <td className="py-3 px-2">
                            {analysis.risk_label ? (
                              <RiskBadge label={analysis.risk_label} />
                            ) : (
                              '-'
                            )}
                          </td>
                          <td className="py-3 px-2">
                            {analysis.red_flags?.length > 0 ? (
                              <span className="flex items-center text-danger-600">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                {analysis.red_flags.length}
                              </span>
                            ) : (
                              '-'
                            )}
                          </td>
                          <td className="py-3 px-2">
                            {analysis.feedback?.length > 0 ? (
                              analysis.feedback[0].rating === 'UP' ? (
                                <ThumbsUp className="h-4 w-4 text-success-600" />
                              ) : (
                                <ThumbsDown className="h-4 w-4 text-danger-600" />
                              )
                            ) : (
                              '-'
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Debug Info */}
          <Card className="mt-8">
            <CardHeader>
              <h2 className="text-lg font-semibold">Debug Information</h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm font-mono">
                <p><span className="text-gray-500">Environment:</span> {process.env.NODE_ENV}</p>
                <p><span className="text-gray-500">User ID:</span> {user.id}</p>
                <p><span className="text-gray-500">User Email:</span> {user.email}</p>
                <p><span className="text-gray-500">API URL:</span> {process.env.NEXT_PUBLIC_SUPABASE_URL || 'Not set'}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
