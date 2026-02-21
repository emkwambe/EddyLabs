/**
 * Integration test for complete analysis flow
 */

import { mockSupabaseClient } from '../mocks/supabase';
import { mockOpenAIClient } from '../mocks/openai';
import { mockOCRExtract } from '../mocks/ocr';
import { sampleConstructionContract } from '../fixtures/sampleDocuments';

describe('Complete Analysis Flow Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should complete full analysis workflow', async () => {
    // 1. Upload file to Supabase Storage
    const uploadResult = await mockSupabaseClient.storage
      .from('documents')
      .upload('test-doc.pdf', new Blob(['test']));

    expect(uploadResult.error).toBeNull();
    expect(uploadResult.data?.path).toBeDefined();

    // 2. Create analysis record
    const createResult = await mockSupabaseClient
      .from('analyses')
      .insert({
        user_id: 'test-user',
        document_url: 'https://example.com/test-doc.pdf',
        status: 'processing'
      })
      .select()
      .single();

    expect(createResult.error).toBeNull();
    expect(createResult.data?.id).toBeDefined();

    // 3. Extract text via OCR
    const ocrText = await mockOCRExtract('https://example.com/test-doc.pdf');
    expect(ocrText.ParsedText).toBeTruthy();
    expect(ocrText.IsErroredOnProcessing).toBe(false);

    // 4. Analyze with AI
    const aiResponse = await mockOpenAIClient.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: sampleConstructionContract }]
    });

    expect(aiResponse.choices[0].message.content).toBeTruthy();

    // 5. Update analysis with results
    const updateResult = await mockSupabaseClient
      .from('analyses')
      .update({
        status: 'completed',
        document_type: 'Construction Contract',
        risk_score: 78
      })
      .eq('id', createResult.data.id);

    expect(updateResult.error).toBeNull();
  });

  it('should handle OCR failure gracefully', async () => {
    // Simulate OCR failure
    const ocrText = await mockOCRExtract('https://example.com/corrupted.pdf');

    expect(ocrText.IsErroredOnProcessing).toBe(true);
    expect(ocrText.ErrorMessage).toBeTruthy();

    // Update analysis status to failed
    const updateResult = await mockSupabaseClient
      .from('analyses')
      .update({
        status: 'failed',
        error_message: ocrText.ErrorMessage
      })
      .eq('id', 'test-id');

    expect(updateResult.error).toBeNull();
  });

  it('should handle AI analysis failure', async () => {
    try {
      const failingClient = require('../mocks/openai').createFailingOpenAIClient();
      await failingClient.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: []
      });

      fail('Should have thrown error');
    } catch (error) {
      expect(error).toBeDefined();

      // Update analysis to failed status
      const updateResult = await mockSupabaseClient
        .from('analyses')
        .update({
          status: 'failed',
          error_message: (error as Error).message
        })
        .eq('id', 'test-id');

      expect(updateResult.error).toBeNull();
    }
  });

  it('should support feedback submission', async () => {
    const feedbackResult = await mockSupabaseClient
      .from('feedback')
      .insert({
        analysis_id: 'analysis-123',
        user_id: 'test-user',
        rating: 5,
        comment: 'Great analysis!'
      })
      .select()
      .single();

    expect(feedbackResult.error).toBeNull();
    expect(feedbackResult.data?.rating).toBe(5);
  });
});
