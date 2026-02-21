/**
 * Mock Supabase client for testing
 */

import { mockAnalysesList, mockUser, mockFeedback } from '../fixtures/mockAnalyses';

export const createMockSupabaseClient = () => {
  const mockFrom = jest.fn((table: string) => {
    if (table === 'analyses') {
      return {
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            order: jest.fn(() => ({
              data: mockAnalysesList,
              error: null
            }))
          })),
          single: jest.fn(() => ({
            data: mockAnalysesList[0],
            error: null
          }))
        })),
        insert: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => ({
              data: mockAnalysesList[0],
              error: null
            }))
          }))
        })),
        update: jest.fn(() => ({
          eq: jest.fn(() => ({
            data: mockAnalysesList[0],
            error: null
          }))
        })),
        delete: jest.fn(() => ({
          eq: jest.fn(() => ({
            data: null,
            error: null
          }))
        }))
      };
    }

    if (table === 'feedback') {
      return {
        insert: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => ({
              data: mockFeedback,
              error: null
            }))
          }))
        }))
      };
    }

    return {};
  });

  const mockStorage = {
    from: jest.fn(() => ({
      upload: jest.fn(() => ({
        data: { path: 'test-document.pdf' },
        error: null
      })),
      getPublicUrl: jest.fn(() => ({
        data: { publicUrl: 'https://example.com/storage/test-document.pdf' }
      })),
      remove: jest.fn(() => ({
        data: null,
        error: null
      }))
    }))
  };

  const mockAuth = {
    getUser: jest.fn(() => ({
      data: { user: mockUser },
      error: null
    })),
    signInWithPassword: jest.fn(() => ({
      data: { user: mockUser },
      error: null
    })),
    signOut: jest.fn(() => ({
      error: null
    }))
  };

  const mockChannel = {
    on: jest.fn(() => mockChannel),
    subscribe: jest.fn(() => mockChannel),
    unsubscribe: jest.fn()
  };

  return {
    from: mockFrom,
    storage: mockStorage,
    auth: mockAuth,
    channel: jest.fn(() => mockChannel)
  };
};

// Default mock export
export const mockSupabaseClient = createMockSupabaseClient();
