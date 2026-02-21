/**
 * Mock OpenAI client for testing
 */

import { mockAIAnalysisResponse } from '../fixtures/sampleDocuments';

export const createMockOpenAIClient = () => {
  return {
    chat: {
      completions: {
        create: jest.fn(async ({ messages }) => {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 100));

          // Check if request is valid
          if (!messages || messages.length === 0) {
            throw new Error('Invalid request: messages array is required');
          }

          return {
            id: 'chatcmpl-test-123',
            object: 'chat.completion',
            created: Date.now(),
            model: 'gpt-4o-mini',
            choices: [
              {
                index: 0,
                message: {
                  role: 'assistant',
                  content: JSON.stringify(mockAIAnalysisResponse)
                },
                finish_reason: 'stop'
              }
            ],
            usage: {
              prompt_tokens: 500,
              completion_tokens: 300,
              total_tokens: 800
            }
          };
        })
      }
    }
  };
};

// Mock for error scenarios
export const createFailingOpenAIClient = () => {
  return {
    chat: {
      completions: {
        create: jest.fn(async () => {
          throw new Error('OpenAI API rate limit exceeded');
        })
      }
    }
  };
};

export const mockOpenAIClient = createMockOpenAIClient();
