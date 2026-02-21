/**
 * Mock OCR.space API for testing
 */

import { mockOCRResponse } from '../fixtures/sampleDocuments';

export const mockOCRExtract = jest.fn(async (imageUrl: string) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 200));

  // Simulate error for specific test cases
  if (imageUrl.includes('corrupted') || imageUrl.includes('invalid')) {
    return {
      ParsedText: '',
      ErrorMessage: 'Unable to extract text from image',
      ErrorDetails: 'File appears to be corrupted or in an unsupported format',
      FileParseExitCode: 0,
      IsErroredOnProcessing: true,
      ProcessingTimeInMilliseconds: '500'
    };
  }

  return mockOCRResponse;
});

// Mock for testing OCR failures
export const mockOCRExtractFailure = jest.fn(async () => {
  throw new Error('OCR service temporarily unavailable');
});
