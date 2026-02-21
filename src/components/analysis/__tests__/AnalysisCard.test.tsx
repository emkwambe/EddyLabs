/**
 * Tests for AnalysisCard component
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { AnalysisCard } from '../AnalysisCard';
import { mockAnalysisCompleted, mockAnalysisProcessing, mockAnalysisFailed } from '../../../__tests__/fixtures/mockAnalyses';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn()
  })
}));

describe('AnalysisCard', () => {
  describe('Completed Analysis', () => {
    it('should render completed analysis correctly', () => {
      render(<AnalysisCard analysis={mockAnalysisCompleted} />);

      expect(screen.getByText(mockAnalysisCompleted.original_filename)).toBeInTheDocument();
      expect(screen.getByText(mockAnalysisCompleted.document_type!)).toBeInTheDocument();
      expect(screen.getByText(`Risk Score: ${mockAnalysisCompleted.risk_score}`)).toBeInTheDocument();
    });

    it('should display red flags count', () => {
      render(<AnalysisCard analysis={mockAnalysisCompleted} />);

      const redFlagsCount = mockAnalysisCompleted.red_flags!.length;
      expect(screen.getByText(`${redFlagsCount} Red Flags`)).toBeInTheDocument();
    });

    it('should show risk badge with correct color', () => {
      render(<AnalysisCard analysis={mockAnalysisCompleted} />);

      const badge = screen.getByText(`Risk Score: ${mockAnalysisCompleted.risk_score}`);

      // High risk (>70) should have red/warning styling
      if (mockAnalysisCompleted.risk_score! > 70) {
        expect(badge).toHaveClass('bg-red-100', 'text-red-800');
      }
    });

    it('should be clickable and navigate to detail page', () => {
      const { container } = render(<AnalysisCard analysis={mockAnalysisCompleted} />);

      const card = container.querySelector('[data-testid="analysis-card"]');
      expect(card).toHaveAttribute('href', `/analyses/${mockAnalysisCompleted.id}`);
    });
  });

  describe('Processing Analysis', () => {
    it('should show processing status', () => {
      render(<AnalysisCard analysis={mockAnalysisProcessing} />);

      expect(screen.getByText(/Processing/i)).toBeInTheDocument();
      expect(screen.getByText(mockAnalysisProcessing.original_filename)).toBeInTheDocument();
    });

    it('should display loading indicator', () => {
      render(<AnalysisCard analysis={mockAnalysisProcessing} />);

      const spinner = screen.getByTestId('loading-spinner');
      expect(spinner).toBeInTheDocument();
    });

    it('should not show risk score or red flags', () => {
      render(<AnalysisCard analysis={mockAnalysisProcessing} />);

      expect(screen.queryByText(/Risk Score/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Red Flags/i)).not.toBeInTheDocument();
    });
  });

  describe('Failed Analysis', () => {
    it('should show error status', () => {
      render(<AnalysisCard analysis={mockAnalysisFailed} />);

      expect(screen.getByText(/Failed/i)).toBeInTheDocument();
      expect(screen.getByText(mockAnalysisFailed.original_filename)).toBeInTheDocument();
    });

    it('should display error message', () => {
      render(<AnalysisCard analysis={mockAnalysisFailed} />);

      expect(screen.getByText(mockAnalysisFailed.error_message!)).toBeInTheDocument();
    });

    it('should show retry button', () => {
      render(<AnalysisCard analysis={mockAnalysisFailed} />);

      const retryButton = screen.getByText(/Retry/i);
      expect(retryButton).toBeInTheDocument();
    });
  });

  describe('Date Formatting', () => {
    it('should display formatted creation date', () => {
      render(<AnalysisCard analysis={mockAnalysisCompleted} />);

      // Should display a human-readable date
      const dateRegex = /\w+\s\d{1,2},\s\d{4}/; // e.g., "Feb 15, 2024"
      expect(screen.getByText(dateRegex)).toBeInTheDocument();
    });
  });

  describe('Delete Functionality', () => {
    it('should show delete button on hover', () => {
      const { container } = render(<AnalysisCard analysis={mockAnalysisCompleted} />);

      const card = container.querySelector('[data-testid="analysis-card"]');
      fireEvent.mouseEnter(card!);

      const deleteButton = screen.getByLabelText(/delete/i);
      expect(deleteButton).toBeVisible();
    });

    it('should call delete handler when delete button clicked', () => {
      const onDelete = jest.fn();
      render(<AnalysisCard analysis={mockAnalysisCompleted} onDelete={onDelete} />);

      const deleteButton = screen.getByLabelText(/delete/i);
      fireEvent.click(deleteButton);

      expect(onDelete).toHaveBeenCalledWith(mockAnalysisCompleted.id);
    });
  });
});
