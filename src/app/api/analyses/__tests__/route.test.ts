/**
 * Tests for analyses API route
 */

import { POST, GET } from '../route';
import { mockSupabaseClient } from '../../../../__tests__/mocks/supabase';
import { NextRequest } from 'next/server';

// Mock the Supabase client
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(() => mockSupabaseClient)
}));

// Mock the AI and OCR services
jest.mock('@/lib/ai/analysisService', () => ({
  analyzeDocument: jest.fn(async () => ({
    documentType: 'Test Contract',
    summary: 'Test summary',
    costBreakdown: { totalAmount: 1000, breakdown: [], additionalFees: [] },
    redFlags: [],
    riskScore: 50,
    recommendations: []
  }))
}));

jest.mock('@/lib/ocr/extractText', () => ({
  extractText: jest.fn(async () => 'Extracted text from document')
}));

describe('Analyses API Routes', () => {
  describe('GET /api/analyses', () => {
    it('should return all analyses for the authenticated user', async () => {
      const request = new NextRequest('http://localhost:3000/api/analyses');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toBeInstanceOf(Array);
      expect(data.length).toBeGreaterThan(0);
    });

    it('should return 401 if user is not authenticated', async () => {
      // Mock unauthenticated user
      const mockUnauthClient = {
        ...mockSupabaseClient,
        auth: {
          getUser: jest.fn(() => ({
            data: { user: null },
            error: { message: 'Not authenticated' }
          }))
        }
      };

      jest.mock('@/lib/supabase/client', () => ({
        createClient: jest.fn(() => mockUnauthClient)
      }));

      const request = new NextRequest('http://localhost:3000/api/analyses');
      const response = await GET(request);

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/analyses', () => {
    it('should create a new analysis from uploaded file', async () => {
      const formData = new FormData();
      const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
      formData.append('file', file);

      const request = new NextRequest('http://localhost:3000/api/analyses', {
        method: 'POST',
        body: formData
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toHaveProperty('id');
      expect(data.status).toBe('processing');
    });

    it('should reject requests without a file', async () => {
      const request = new NextRequest('http://localhost:3000/api/analyses', {
        method: 'POST',
        body: new FormData()
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
    });

    it('should reject files that are too large', async () => {
      const formData = new FormData();
      // Create a mock file larger than 10MB
      const largeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'large.pdf', {
        type: 'application/pdf'
      });
      formData.append('file', largeFile);

      const request = new NextRequest('http://localhost:3000/api/analyses', {
        method: 'POST',
        body: formData
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
    });

    it('should reject unsupported file types', async () => {
      const formData = new FormData();
      const file = new File(['test'], 'test.exe', { type: 'application/x-msdownload' });
      formData.append('file', file);

      const request = new NextRequest('http://localhost:3000/api/analyses', {
        method: 'POST',
        body: formData
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
    });
  });
});
