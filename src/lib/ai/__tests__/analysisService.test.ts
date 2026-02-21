/**
 * Tests for AI analysis service
 */

import { analyzeDocument } from '../analysisService';
import { mockOpenAIClient, createFailingOpenAIClient } from '../../../__tests__/mocks/openai';
import { sampleConstructionContract } from '../../../__tests__/fixtures/sampleDocuments';

// Mock the OpenAI client
jest.mock('openai', () => ({
  __esModule: true,
  default: jest.fn(() => mockOpenAIClient)
}));

describe('AI Analysis Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('analyzeDocument', () => {
    it('should successfully analyze a construction contract', async () => {
      const result = await analyzeDocument(sampleConstructionContract);

      expect(result).toBeDefined();
      expect(result.documentType).toBe('Construction Contract');
      expect(result.riskScore).toBeGreaterThan(0);
      expect(result.riskScore).toBeLessThanOrEqual(100);
      expect(result.redFlags).toBeInstanceOf(Array);
      expect(result.recommendations).toBeInstanceOf(Array);
      expect(result.costBreakdown).toBeDefined();
    });

    it('should identify red flags in the contract', async () => {
      const result = await analyzeDocument(sampleConstructionContract);

      expect(result.redFlags.length).toBeGreaterThan(0);
      expect(result.redFlags[0]).toHaveProperty('flag');
      expect(result.redFlags[0]).toHaveProperty('severity');
      expect(result.redFlags[0]).toHaveProperty('explanation');
    });

    it('should provide a cost breakdown', async () => {
      const result = await analyzeDocument(sampleConstructionContract);

      expect(result.costBreakdown).toBeDefined();
      expect(result.costBreakdown.totalAmount).toBeGreaterThan(0);
      expect(result.costBreakdown.breakdown).toBeInstanceOf(Array);
    });

    it('should generate recommendations', async () => {
      const result = await analyzeDocument(sampleConstructionContract);

      expect(result.recommendations).toBeInstanceOf(Array);
      expect(result.recommendations.length).toBeGreaterThan(0);
      expect(typeof result.recommendations[0]).toBe('string');
    });

    it('should handle empty or invalid text', async () => {
      await expect(analyzeDocument('')).rejects.toThrow();
      await expect(analyzeDocument('   ')).rejects.toThrow();
    });

    it('should handle API failures gracefully', async () => {
      const OpenAI = require('openai').default;
      OpenAI.mockImplementationOnce(() => createFailingOpenAIClient());

      await expect(analyzeDocument(sampleConstructionContract)).rejects.toThrow();
    });

    it('should calculate appropriate risk scores', async () => {
      const result = await analyzeDocument(sampleConstructionContract);

      // Risk score should be high for this contract (has multiple red flags)
      expect(result.riskScore).toBeGreaterThan(60);
    });
  });

  describe('Risk Score Calculation', () => {
    it('should return higher scores for contracts with more red flags', async () => {
      const result = await analyzeDocument(sampleConstructionContract);

      // This contract has 4-5 red flags, should have high risk
      expect(result.riskScore).toBeGreaterThan(70);
    });

    it('should weight high severity flags more heavily', async () => {
      const result = await analyzeDocument(sampleConstructionContract);

      const highSeverityFlags = result.redFlags.filter(flag => flag.severity === 'high');
      expect(highSeverityFlags.length).toBeGreaterThan(0);
    });
  });
});
