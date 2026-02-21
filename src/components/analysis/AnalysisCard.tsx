'use client';

/**
 * AnalysisCard Component
 * Displays a summary card for a document analysis
 */

import Link from 'next/link';
import { useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';

interface Analysis {
  id: string;
  user_id: string;
  document_url?: string | null;
  original_filename: string;
  status: 'completed' | 'processing' | 'failed' | 'pending';
  document_type?: string | null;
  summary?: string | null;
  cost_breakdown?: any;
  red_flags?: Array<{
    flag: string;
    severity: string;
    explanation: string;
  }> | null;
  risk_score?: number | null;
  recommendations?: string[] | null;
  error_message?: string | null;
  created_at: string;
  updated_at?: string;
  processing_time_ms?: number | null;
}

interface AnalysisCardProps {
  analysis: Analysis;
  onDelete?: (id: string) => void;
}

export function AnalysisCard({ analysis, onDelete }: AnalysisCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete) {
      onDelete(analysis.id);
    }
  };

  // Render different states
  if (analysis.status === 'processing') {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {analysis.original_filename}
          </h3>
          <Badge variant="warning">Processing</Badge>
        </div>

        <div className="flex items-center space-x-2">
          <div
            data-testid="loading-spinner"
            className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"
          />
          <span className="text-sm text-gray-600">Analyzing document...</span>
        </div>

        <div className="mt-4 text-xs text-gray-500">
          {formatDate(analysis.created_at)}
        </div>
      </div>
    );
  }

  if (analysis.status === 'failed') {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border border-red-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {analysis.original_filename}
          </h3>
          <Badge variant="danger">Error</Badge>
        </div>

        {analysis.error_message && (
          <div className="mb-4 p-3 bg-red-50 rounded-md">
            <p className="text-sm text-red-800">{analysis.error_message}</p>
          </div>
        )}

        <button
          onClick={handleDelete}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          Retry
        </button>

        <div className="mt-4 text-xs text-gray-500">
          {formatDate(analysis.created_at)}
        </div>
      </div>
    );
  }

  // Completed analysis - clickable card
  const riskScore = analysis.risk_score || 0;
  const redFlagsCount = analysis.red_flags?.length || 0;

  // Determine risk badge color based on score
  const getRiskBadgeClass = (score: number) => {
    if (score >= 70) return 'bg-red-100 text-red-800';
    if (score >= 40) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  return (
    <Link
      href={`/analyses/${analysis.id}`}
      data-testid="analysis-card"
      className="block bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all duration-200"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 truncate mb-1">
            {analysis.original_filename}
          </h3>
          {analysis.document_type && (
            <p className="text-sm text-gray-600">{analysis.document_type}</p>
          )}
        </div>

        <button
          onClick={handleDelete}
          aria-label="delete"
          className={`ml-2 p-2 text-gray-400 hover:text-red-600 transition-opacity ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ pointerEvents: onDelete ? 'auto' : 'none' }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      {analysis.summary && (
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {analysis.summary}
        </p>
      )}

      <div className="flex items-center space-x-3 mb-3">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRiskBadgeClass(
            riskScore
          )}`}
        >
          Risk Score: {riskScore}
        </span>

        {redFlagsCount > 0 && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            {redFlagsCount} Red Flags
          </span>
        )}
      </div>

      <div className="text-xs text-gray-500">{formatDate(analysis.created_at)}</div>
    </Link>
  );
}
