import { PriceComparison } from '@/lib/types'
import { formatCurrency } from '@/lib/utils'
import { AlertCircle, TrendingDown, FileText, Search } from 'lucide-react'

interface SavingsCalloutProps {
  priceComparison: PriceComparison | null | undefined
  onGenerateCounterOffer?: () => void
  onFindSecondOpinion?: () => void
}

export function SavingsCallout({
  priceComparison,
  onGenerateCounterOffer,
  onFindSecondOpinion,
}: SavingsCalloutProps) {
  // Don't render if no price comparison data
  if (!priceComparison) {
    return null
  }

  const { estimateTotal, fairPriceMin, fairPriceMax, isOverpriced, potentialOvercharge, confidence } = priceComparison

  // Don't render if no potential overcharge
  if (!isOverpriced || potentialOvercharge <= 0) {
    // Show positive message for fair pricing
    return (
      <div className="mb-6 p-6 bg-success-50 border-2 border-success-200 rounded-lg">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-success-100 flex items-center justify-center">
              <TrendingDown className="h-5 w-5 text-success-600" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-success-900 mb-1">
              Fair Pricing Detected
            </h3>
            <p className="text-sm text-success-700">
              Your estimate of <strong>{formatCurrency(estimateTotal)}</strong> appears to be within the fair market range of {formatCurrency(fairPriceMin)} - {formatCurrency(fairPriceMax)}.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mb-6 p-6 bg-warning-50 border-2 border-warning-300 rounded-lg shadow-sm">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <div className="h-12 w-12 rounded-full bg-warning-100 flex items-center justify-center">
            <AlertCircle className="h-6 w-6 text-warning-600" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-warning-900 mb-2">
                Potential Savings: {formatCurrency(potentialOvercharge)}
              </h3>
              <div className="text-sm text-warning-800 space-y-1">
                <p>
                  <span className="font-medium">Your Estimate:</span> {formatCurrency(estimateTotal)}
                </p>
                <p>
                  <span className="font-medium">Fair Market Range:</span> {formatCurrency(fairPriceMin)} - {formatCurrency(fairPriceMax)}
                </p>
                <p className="text-xs text-warning-700 mt-2">
                  Confidence: <span className="font-medium">{confidence}</span>
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              {onGenerateCounterOffer && (
                <button
                  onClick={onGenerateCounterOffer}
                  className="inline-flex items-center justify-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Counter-Offer
                </button>
              )}
              {onFindSecondOpinion && (
                <button
                  onClick={onFindSecondOpinion}
                  className="inline-flex items-center justify-center px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Second Opinion
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
