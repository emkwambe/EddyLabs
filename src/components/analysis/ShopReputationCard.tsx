import { ShopReputationResult } from '@/lib/types'
import { Star, AlertTriangle, CheckCircle, MessageSquare, ExternalLink } from 'lucide-react'

interface ShopReputationCardProps {
  reputation: ShopReputationResult | null | undefined
}

export function ShopReputationCard({ reputation }: ShopReputationCardProps) {
  if (!reputation) {
    return null
  }

  const { shopName, rating, totalReviews, verifiedBusiness, warnings, trustScore, recentReviews } = reputation

  // Determine trust score color
  const getTrustScoreColor = (score: number) => {
    if (score >= 75) return { bg: 'bg-success-100', text: 'text-success-700', bar: 'bg-success-500' }
    if (score >= 50) return { bg: 'bg-warning-100', text: 'text-warning-700', bar: 'bg-warning-500' }
    return { bg: 'bg-danger-100', text: 'text-danger-700', bar: 'bg-danger-500' }
  }

  const trustColors = getTrustScoreColor(trustScore)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">Shop Reputation</h3>
        {verifiedBusiness && (
          <div className="flex items-center space-x-1 text-primary-600">
            <CheckCircle className="h-4 w-4" />
            <span className="text-xs font-medium">Verified</span>
          </div>
        )}
      </div>

      {/* Shop name */}
      <div>
        <h4 className="font-semibold text-gray-900">{shopName}</h4>
      </div>

      {/* Rating and reviews */}
      {rating !== null && (
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-4 w-4 ${
                  star <= Math.round(rating)
                    ? 'fill-warning-400 text-warning-400'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-sm font-medium text-gray-900">{rating.toFixed(1)}</span>
          <span className="text-xs text-gray-500">({totalReviews} reviews)</span>
        </div>
      )}

      {/* Trust score */}
      <div className={`p-3 ${trustColors.bg} rounded-lg`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-700">Trust Score</span>
          <span className={`text-lg font-bold ${trustColors.text}`}>{trustScore}/100</span>
        </div>
        <div className="h-2 bg-white rounded-full overflow-hidden">
          <div
            className={`h-full ${trustColors.bar} rounded-full transition-all`}
            style={{ width: `${trustScore}%` }}
          />
        </div>
      </div>

      {/* Warnings */}
      {warnings && warnings.length > 0 && (
        <div className="p-3 bg-danger-50 border border-danger-200 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-danger-600" />
            <span className="text-xs font-medium text-danger-900">Warnings</span>
          </div>
          <ul className="space-y-1">
            {warnings.map((warning, index) => (
              <li key={index} className="text-xs text-danger-800 flex items-start space-x-1">
                <span className="text-danger-600 mt-0.5">•</span>
                <span>{warning}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recent reviews */}
      {recentReviews && recentReviews.length > 0 && (
        <div className="pt-3 border-t border-gray-200">
          <p className="text-xs font-medium text-gray-700 mb-2">Recent Reviews</p>
          <div className="space-y-2">
            {recentReviews.slice(0, 2).map((review, index) => (
              <div key={index} className="p-2 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-1 mb-1">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-3 w-3 ${
                          star <= review.rating
                            ? 'fill-warning-400 text-warning-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-500">{review.time}</span>
                </div>
                <p className="text-xs text-gray-700 line-clamp-2">{review.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Link to more reviews */}
      {shopName && (
        <div className="pt-2">
          <a
            href={`https://www.google.com/search?q=${encodeURIComponent(shopName + ' reviews')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1 text-xs text-primary-600 hover:text-primary-700 hover:underline"
          >
            <MessageSquare className="h-3 w-3" />
            <span>Read more reviews</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      )}
    </div>
  )
}
