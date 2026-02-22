import { LaborRateAnalysis } from '@/lib/types'
import { formatCurrency } from '@/lib/utils'
import { AlertCircle, CheckCircle2, Clock } from 'lucide-react'

interface LaborRateCardProps {
  laborRateAnalysis: LaborRateAnalysis | null | undefined
}

export function LaborRateCard({ laborRateAnalysis }: LaborRateCardProps) {
  if (!laborRateAnalysis) {
    return null
  }

  const {
    totalLaborCharged,
    totalLaborHours,
    effectiveLaborRate,
    marketRateMin,
    marketRateMax,
    percentageAboveMarket,
    isAboveMarket,
    confidence,
    zipCode,
  } = laborRateAnalysis

  // Calculate position on gauge (0-100%)
  const buffer = (marketRateMax - marketRateMin) * 0.5
  const gaugeMin = Math.max(0, marketRateMin - buffer)
  const gaugeMax = marketRateMax + buffer

  const position = ((effectiveLaborRate - gaugeMin) / (gaugeMax - gaugeMin)) * 100
  const clampedPosition = Math.max(0, Math.min(100, position))

  // Determine zone
  const marketZoneStart = ((marketRateMin - gaugeMin) / (gaugeMax - gaugeMin)) * 100
  const marketZoneEnd = ((marketRateMax - gaugeMin) / (gaugeMax - gaugeMin)) * 100

  let zone: 'fair' | 'slightly-high' | 'overpriced'
  let zoneColor: string
  let zoneIcon: React.ReactNode

  if (clampedPosition <= marketZoneEnd) {
    zone = 'fair'
    zoneColor = 'text-success-600'
    zoneIcon = <CheckCircle2 className="h-5 w-5" />
  } else if (percentageAboveMarket <= 20) {
    zone = 'slightly-high'
    zoneColor = 'text-warning-600'
    zoneIcon = <AlertCircle className="h-5 w-5" />
  } else {
    zone = 'overpriced'
    zoneColor = 'text-danger-600'
    zoneIcon = <AlertCircle className="h-5 w-5" />
  }

  const zoneLabels = {
    fair: 'Fair Rate',
    'slightly-high': 'Above Market',
    overpriced: 'Well Above Market',
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-700">Labor Rate Analysis</h3>
          <p className="text-xs text-gray-500 mt-0.5">Market data for {zipCode}</p>
        </div>
        <div className={`flex items-center space-x-1 ${zoneColor} font-medium text-sm`}>
          {zoneIcon}
          <span>{zoneLabels[zone]}</span>
        </div>
      </div>

      {/* Labor hours and total */}
      <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 rounded-lg">
        <div>
          <div className="flex items-center space-x-1 text-gray-600 mb-1">
            <Clock className="h-4 w-4" />
            <span className="text-xs">Labor Hours</span>
          </div>
          <p className="text-lg font-semibold">{totalLaborHours.toFixed(1)} hrs</p>
        </div>
        <div>
          <p className="text-xs text-gray-600 mb-1">Total Labor</p>
          <p className="text-lg font-semibold">{formatCurrency(totalLaborCharged)}</p>
        </div>
      </div>

      {/* Gauge visualization */}
      <div className="relative pb-8">
        {/* Background track */}
        <div className="h-8 rounded-full overflow-hidden bg-gradient-to-r from-success-200 via-warning-200 to-danger-200">
          {/* Market zone marker */}
          <div
            className="absolute top-0 h-8 bg-success-400 bg-opacity-50"
            style={{
              left: `${marketZoneStart}%`,
              width: `${marketZoneEnd - marketZoneStart}%`,
            }}
          />
        </div>

        {/* Effective rate marker */}
        <div
          className="absolute top-0 flex flex-col items-center"
          style={{
            left: `${clampedPosition}%`,
            transform: 'translateX(-50%)',
          }}
        >
          <div className={`w-1 h-8 ${isAboveMarket ? 'bg-danger-600' : 'bg-success-600'} rounded-full`} />
          <div className="mt-1 px-2 py-1 bg-white border border-gray-300 rounded shadow-sm">
            <p className="text-xs font-semibold whitespace-nowrap">
              ${effectiveLaborRate}/hr
            </p>
          </div>
        </div>
      </div>

      {/* Labels */}
      <div className="flex justify-between text-xs text-gray-600 px-1">
        <span>${Math.round(gaugeMin)}</span>
        <span className="font-medium text-success-700">
          Market: ${marketRateMin}-${marketRateMax}/hr
        </span>
        <span>${Math.round(gaugeMax)}</span>
      </div>

      {/* Above market percentage */}
      {isAboveMarket && (
        <div className="p-3 bg-warning-50 border border-warning-200 rounded-lg">
          <p className="text-sm text-warning-800">
            <span className="font-semibold">{percentageAboveMarket}%</span> above market average
          </p>
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
