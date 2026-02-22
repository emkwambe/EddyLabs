'use client';

/**
 * DemoPreview Component
 * Shows a sample document analysis with animated reveal
 */

import { useState, useEffect } from 'react';
import { AlertTriangle, DollarSign, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

export function DemoPreview() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation after component mounts
    const timer = setTimeout(() => setIsVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden max-w-3xl mx-auto">
      {/* Document Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4">
        <div className="flex items-center gap-3">
          <FileText className="h-6 w-6 text-white" />
          <div className="flex-1">
            <h3 className="text-white font-semibold">auto_repair_estimate.pdf</h3>
            <p className="text-primary-100 text-sm">Analyzed in 2.3 seconds</p>
          </div>
          <Badge variant="success">Completed</Badge>
        </div>
      </div>

      {/* Analysis Results */}
      <div className="p-6">
        {/* Risk Score */}
        <div
          className={`mb-6 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-gray-900">Risk Assessment</h4>
            <span className="text-3xl font-bold text-danger-600">78</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-warning-500 to-danger-500 h-3 rounded-full transition-all duration-1000"
              style={{ width: isVisible ? '78%' : '0%' }}
            />
          </div>
          <p className="text-sm text-gray-600 mt-2">
            High Risk - Review carefully before proceeding
          </p>
        </div>

        {/* Red Flags */}
        <div
          className={`mb-6 transition-all duration-700 delay-200 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-danger-600" />
            3 Red Flags Detected
          </h4>
          <div className="space-y-3">
            {[
              {
                title: 'Diagnostic Fee Double-Billing',
                severity: 'high',
                detail: 'Charging $150 diagnostic fee AND 2 hours of diagnostic labor ($200)',
              },
              {
                title: 'Excessive Parts Markup',
                severity: 'high',
                detail: 'Parts marked up 340% above retail price',
              },
              {
                title: 'Unnecessary Service',
                severity: 'medium',
                detail: 'Transmission flush not recommended for your mileage',
              },
            ].map((flag, index) => (
              <div
                key={index}
                className="bg-red-50 border-l-4 border-danger-500 p-3 rounded"
              >
                <div className="flex items-start gap-2">
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded uppercase ${
                      flag.severity === 'high'
                        ? 'bg-danger-200 text-danger-800'
                        : 'bg-warning-200 text-warning-800'
                    }`}
                  >
                    {flag.severity}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm">
                      {flag.title}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">{flag.detail}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Potential Savings */}
        <div
          className={`bg-success-50 border border-success-200 rounded-lg p-4 transition-all duration-700 delay-300 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="bg-success-500 rounded-full p-2">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-success-700 font-medium">
                Potential Savings
              </p>
              <p className="text-2xl font-bold text-success-800">$450 - $620</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
