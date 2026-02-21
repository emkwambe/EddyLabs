import { DoubleBillingResult } from '@/lib/types'
import { formatCurrency } from '@/lib/utils'
import { Copy, AlertOctagon } from 'lucide-react'

interface DoubleBillingAlertProps {
  doubleBilling: DoubleBillingResult | null | undefined
}

export function DoubleBillingAlert({ doubleBilling }: DoubleBillingAlertProps) {
  // Only render if double billing is detected
  if (!doubleBilling || !doubleBilling.hasDoubleBilling) {
    return null
  }

  const { diagnosticFee, laborHours, explanation, potentialSavings } = doubleBilling

  return (
    <div className="p-4 bg-danger-50 border-2 border-danger-300 rounded-lg">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <div className="h-10 w-10 rounded-full bg-danger-100 flex items-center justify-center">
            <AlertOctagon className="h-5 w-5 text-danger-600" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-danger-900 mb-2 flex items-center space-x-2">
            <Copy className="h-4 w-4" />
            <span>Duplicate Charges Detected</span>
          </h3>

          <p className="text-sm text-danger-800 mb-3">
            {explanation}
          </p>

          {/* Details grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
            {diagnosticFee !== null && diagnosticFee > 0 && (
              <div className="p-2 bg-white rounded border border-danger-200">
                <p className="text-xs text-danger-700">Diagnostic Fee</p>
                <p className="text-sm font-semibold text-danger-900">
                  {formatCurrency(diagnosticFee)}
                </p>
              </div>
            )}
            {laborHours !== null && (
              <div className="p-2 bg-white rounded border border-danger-200">
                <p className="text-xs text-danger-700">Labor Hours</p>
                <p className="text-sm font-semibold text-danger-900">
                  {laborHours.toFixed(1)} hrs
                </p>
              </div>
            )}
            {potentialSavings > 0 && (
              <div className="p-2 bg-white rounded border border-danger-200">
                <p className="text-xs text-danger-700">Potential Savings</p>
                <p className="text-sm font-semibold text-success-700">
                  {formatCurrency(potentialSavings)}
                </p>
              </div>
            )}
          </div>

          {/* Action suggestion */}
          <div className="mt-3 p-3 bg-white rounded border border-danger-200">
            <p className="text-xs font-medium text-danger-900 mb-1">
              What to do:
            </p>
            <p className="text-xs text-danger-800">
              Ask the shop to explain why both diagnostic and labor are being charged separately.
              In many cases, diagnostic work is included in the labor estimate, and charging both
              may be unnecessary double billing.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
