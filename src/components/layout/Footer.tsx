import { Shield } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <Shield className="h-5 w-5 text-primary-600" />
            <span className="text-sm font-medium text-gray-900">Fairlytica</span>
          </div>

          <p className="text-xs text-gray-500 text-center md:text-right max-w-md">
            Disclaimer: This tool provides informational analysis only and does not constitute legal, financial, or professional advice. Always consult qualified professionals for important decisions.
          </p>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-400">
            &copy; {new Date().getFullYear()} Fairlytica. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
