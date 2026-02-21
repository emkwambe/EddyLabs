import { FeeAnalysisResult } from '@/lib/types'
import { formatCurrency } from '@/lib/utils'
import { DollarSign, AlertTriangle, CheckCircle, Info } from 'lucide-react'

interface FeeAnalysisPanelProps {
  feeAnalysis: FeeAnalysisResult | null | undefined
}

export function FeeAnalysisPanel({ feeAnalysis }: FeeAnalysisPanelProps) {
  if (!feeAnalysis) {
    return null
  }

  const {
    totalFees,
    feePercentage,
    feeCount,
    industryStandardMin,
    industryStandardMax,
    isSuspicious,
    estimatedOvercharge,
    reasoning,
  } = feeAnalysis

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">Fee Analysis</h3>
        {isSuspicious ? (
          <div className="flex items-center space-x-1 text-danger-600">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm font-medium">Suspicious</span>
          </div>
        ) : (
          <div className="flex items-center space-x-1 text-success-600">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Normal</span>
          </div>
        )}
      </div>

      {/* Fee summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2 mb-1">
            <DollarSign className="h-4 w-4 text-gray-600" />
            <span className="text-xs text-gray-600">Total Fees</span>
          </div>
          <p className="text-lg font-semibold text-gray-900">
            {formatCurrency(totalFees)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {feePercentage.toFixed(1)}% of estimate
          </p>
        </div>

        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2 mb-1">
            <Info className="h-4 w-4 text-gray-600" />
            <span className="text-xs text-gray-600">Fee Count</span>
          </div>
          <p className="text-lg font-semibold text-gray-900">
            {feeCount}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            line items
          </p>
        </div>
      </div>

      {/* Industry comparison */}
      <div className="p-3 bg-primary-50 border border-primary-200 rounded-lg">
        <p className="text-xs font-medium text-primary-900 mb-2">
          Industry Standard
        </p>
        <div className="flex items-center justify-between text-sm">
          <span className="text-primary-700">
            {industryStandardMin.toFixed(1)}% - {industryStandardMax.toFixed(1)}%
          </span>
          <span className={`font-semibold ${
            feePercentage > industryStandardMax ? 'text-danger-600' : 'text-success-600'
          }`}>
            {feePercentage > industryStandardMax ? 'Above' : 'Within'} Range
          </span>
        </div>

        {/* Visual bar */}
        <div className="mt-2 h-2 bg-primary-200 rounded-full overflow-hidden relative">
          {/* Industry standard range */}
          <div
            className="absolute top-0 h-2 bg-success-400"
            style={{
              left: `${Math.min(industryStandardMin, 100)}%`,
              width: `${Math.min(industryStandardMax - industryStandardMin, 100 - industryStandardMin)}%`,
            }}
          />
          {/* User's percentage */}
          <div
            className={`absolute top-0 w-1 h-2 ${
              feePercentage > industryStandardMax ? 'bg-danger-600' : 'bg-success-600'
            }`}
            style={{
              left: `${Math.min(feePercentage, 100)}%`,
            }}
          />
        </div>
      </div>

      {/* Overcharge warning */}
      {isSuspicious && estimatedOvercharge > 0 && (
        <div className="p-3 bg-warning-50 border border-warning-200 rounded-lg">
          <div className="flex items-center space-x-2 mb-1">
            <AlertTriangle className="h-4 w-4 text-warning-600" />
            <span className="text-xs font-medium text-warning-900">
              Potential Overcharge
            </span>
          </div>
          <p className="text-lg font-semibold text-warning-900">
            {formatCurrency(estimatedOvercharge)}
          </p>
        </div>
      )}

      {/* Reasoning */}
      {reasoning && (
        <div className="pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-600 leading-relaxed">
            {reasoning}
          </p>
        </div>
      )}
    </div>
  )
}
