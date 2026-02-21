import { PriceComparison } from '@/lib/types'
import { formatCurrency } from '@/lib/utils'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface PricingGaugeProps {
  priceComparison: PriceComparison | null | undefined
}

export function PricingGauge({ priceComparison }: PricingGaugeProps) {
  if (!priceComparison) {
    return null
  }

  const { estimateTotal, fairPriceMin, fairPriceMax, isOverpriced, confidence } = priceComparison

  // Calculate position on gauge (0-100%)
  // We'll show a range from (fairPriceMin - buffer) to (fairPriceMax + buffer)
  const buffer = (fairPriceMax - fairPriceMin) * 0.5
  const gaugeMin = Math.max(0, fairPriceMin - buffer)
  const gaugeMax = fairPriceMax + buffer

  // Calculate percentage position
  const position = ((estimateTotal - gaugeMin) / (gaugeMax - gaugeMin)) * 100
  const clampedPosition = Math.max(0, Math.min(100, position))

  // Determine zone and color
  const fairZoneStart = ((fairPriceMin - gaugeMin) / (gaugeMax - gaugeMin)) * 100
  const fairZoneEnd = ((fairPriceMax - gaugeMin) / (gaugeMax - gaugeMin)) * 100

  let zone: 'fair' | 'slightly-high' | 'overpriced'
  let zoneColor: string
  let zoneIcon: React.ReactNode

  if (clampedPosition <= fairZoneEnd) {
    zone = 'fair'
    zoneColor = 'text-success-600'
    zoneIcon = <TrendingDown className="h-5 w-5" />
  } else if (clampedPosition <= fairZoneEnd + 20) {
    zone = 'slightly-high'
    zoneColor = 'text-warning-600'
    zoneIcon = <Minus className="h-5 w-5" />
  } else {
    zone = 'overpriced'
    zoneColor = 'text-danger-600'
    zoneIcon = <TrendingUp className="h-5 w-5" />
  }

  const zoneLabels = {
    fair: 'Fair Price',
    'slightly-high': 'Slightly High',
    overpriced: 'Overpriced',
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">Pricing Analysis</h3>
        <div className={`flex items-center space-x-1 ${zoneColor} font-medium text-sm`}>
          {zoneIcon}
          <span>{zoneLabels[zone]}</span>
        </div>
      </div>

      {/* Gauge visualization */}
      <div className="relative">
        {/* Background track */}
        <div className="h-8 rounded-full overflow-hidden bg-gradient-to-r from-success-200 via-warning-200 to-danger-200">
          {/* Fair zone marker */}
          <div
            className="absolute top-0 h-8 bg-success-400 bg-opacity-50"
            style={{
              left: `${fairZoneStart}%`,
              width: `${fairZoneEnd - fairZoneStart}%`,
            }}
          />
        </div>

        {/* Estimate marker */}
        <div
          className="absolute top-0 flex flex-col items-center"
          style={{
            left: `${clampedPosition}%`,
            transform: 'translateX(-50%)',
          }}
        >
          <div className={`w-1 h-8 ${isOverpriced ? 'bg-danger-600' : 'bg-success-600'} rounded-full`} />
          <div className="mt-1 px-2 py-1 bg-white border border-gray-300 rounded shadow-sm">
            <p className="text-xs font-semibold whitespace-nowrap">
              You: {formatCurrency(estimateTotal)}
            </p>
          </div>
        </div>
      </div>

      {/* Labels */}
      <div className="flex justify-between text-xs text-gray-600 px-1">
        <span>{formatCurrency(gaugeMin)}</span>
        <span className="font-medium text-success-700">
          Fair: {formatCurrency(fairPriceMin)}-{formatCurrency(fairPriceMax)}
        </span>
        <span>{formatCurrency(gaugeMax)}</span>
      </div>

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
