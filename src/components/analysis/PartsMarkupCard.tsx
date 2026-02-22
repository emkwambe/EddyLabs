import { PartsMarkupAnalysis } from '@/lib/types'
import { formatCurrency } from '@/lib/utils'
import { AlertCircle, CheckCircle2, Package } from 'lucide-react'

interface PartsMarkupCardProps {
  partsMarkupAnalysis: PartsMarkupAnalysis | null | undefined
}

export function PartsMarkupCard({ partsMarkupAnalysis }: PartsMarkupCardProps) {
  if (!partsMarkupAnalysis) {
    return null
  }

  const {
    totalPartsCharged,
    estimatedOEMCost,
    averageMarkupPercentage,
    excessiveMarkupItems,
    totalExcessiveMarkup,
    confidence,
  } = partsMarkupAnalysis

  // Determine if markup is reasonable (50-100% is typical, >100% is excessive)
  const isReasonable = averageMarkupPercentage <= 100
  const isSlightlyHigh = averageMarkupPercentage > 100 && averageMarkupPercentage <= 150
  const isExcessive = averageMarkupPercentage > 150

  let statusColor: string
  let statusIcon: React.ReactNode
  let statusLabel: string

  if (isReasonable) {
    statusColor = 'text-success-600'
    statusIcon = <CheckCircle2 className="h-5 w-5" />
    statusLabel = 'Fair Markup'
  } else if (isSlightlyHigh) {
    statusColor = 'text-warning-600'
    statusIcon = <AlertCircle className="h-5 w-5" />
    statusLabel = 'Above Typical'
  } else {
    statusColor = 'text-danger-600'
    statusIcon = <AlertCircle className="h-5 w-5" />
    statusLabel = 'Excessive Markup'
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-700">Parts Markup Analysis</h3>
          <p className="text-xs text-gray-500 mt-0.5">Compared to OEM pricing</p>
        </div>
        <div className={`flex items-center space-x-1 ${statusColor} font-medium text-sm`}>
          {statusIcon}
          <span>{statusLabel}</span>
        </div>
      </div>

      {/* Parts cost breakdown */}
      <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 rounded-lg">
        <div>
          <div className="flex items-center space-x-1 text-gray-600 mb-1">
            <Package className="h-4 w-4" />
            <span className="text-xs">Parts Charged</span>
          </div>
          <p className="text-lg font-semibold">{formatCurrency(totalPartsCharged)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-600 mb-1">Est. OEM Cost</p>
          <p className="text-lg font-semibold">{formatCurrency(estimatedOEMCost)}</p>
        </div>
      </div>

      {/* Average markup gauge */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Average Markup:</span>
          <span className={`font-bold text-lg ${statusColor}`}>
            {averageMarkupPercentage}%
          </span>
        </div>

        {/* Markup visualization bar */}
        <div className="relative h-6 bg-gray-200 rounded-full overflow-hidden">
          {/* Typical markup zones */}
          <div className="absolute inset-0 flex">
            <div className="bg-success-300 flex-[50]" /> {/* 0-50% */}
            <div className="bg-success-400 flex-[50]" /> {/* 50-100% */}
            <div className="bg-warning-400 flex-[50]" /> {/* 100-150% */}
            <div className="bg-danger-400 flex-[50]" /> {/* 150-200%+ */}
          </div>

          {/* Actual markup indicator */}
          <div
            className="absolute top-0 h-full w-1 bg-gray-900"
            style={{
              left: `${Math.min(100, (averageMarkupPercentage / 200) * 100)}%`,
            }}
          />
        </div>

        {/* Zone labels */}
        <div className="flex justify-between text-xs text-gray-600">
          <span>0%</span>
          <span className="text-success-700 font-medium">Typical: 50-100%</span>
          <span>200%+</span>
        </div>
      </div>

      {/* Excessive markup items */}
      {excessiveMarkupItems.length > 0 && (
        <div className="p-3 bg-danger-50 border border-danger-200 rounded-lg space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-danger-800">
              {excessiveMarkupItems.length} item{excessiveMarkupItems.length > 1 ? 's' : ''} with excessive markup
            </p>
            <p className="text-sm font-semibold text-danger-900">
              +{formatCurrency(totalExcessiveMarkup)}
            </p>
          </div>

          {/* Show top 3 excessive items */}
          <div className="space-y-1 mt-2">
            {excessiveMarkupItems.slice(0, 3).map((item, index) => (
              <div key={index} className="flex items-center justify-between text-xs text-danger-700">
                <span className="truncate flex-1">{item.description}</span>
                <span className="font-medium ml-2">+{item.markupPercentage}%</span>
              </div>
            ))}
            {excessiveMarkupItems.length > 3 && (
              <p className="text-xs text-danger-600 italic">
                +{excessiveMarkupItems.length - 3} more items
              </p>
            )}
          </div>
        </div>
      )}

      {/* Confidence */}
      <div className="pt-3 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Confidence:</span>
          <span className={`font-medium ${
            confidence === 'HIGH' ? 'text-success-600' :
            confidence === 'MEDIUM' ? 'text-warning-600' :
            'text-gray-600'
          }`}>
            {confidence}
          </span>
        </div>
        <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${
              confidence === 'HIGH' ? 'bg-success-500' :
              confidence === 'MEDIUM' ? 'bg-warning-500' :
              'bg-gray-400'
            }`}
            style={{
              width: confidence === 'HIGH' ? '100%' : confidence === 'MEDIUM' ? '66%' : '33%',
            }}
          />
        </div>
      </div>
    </div>
  )
}
