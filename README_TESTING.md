# RedFlagRadar Testing Guide

This guide covers all testing data, fixtures, and how to run tests for the RedFlagRadar application.

## Test Structure

```
src/
├── __tests__/
│   ├── fixtures/           # Test data and mock responses
│   │   ├── sampleDocuments.ts    # Sample contract text for testing
│   │   └── mockAnalyses.ts       # Mock analysis objects
│   ├── mocks/              # Mock services and APIs
│   │   ├── supabase.ts           # Supabase client mock
│   │   ├── openai.ts             # OpenAI API mock
│   │   └── ocr.ts                # OCR service mock
│   └── integration/        # Integration tests
│       └── analysisFlow.test.ts
├── components/
│   ├── __tests__/          # Component unit tests
│   │   └── Badge.test.tsx
│   └── analysis/
│       └── __tests__/
│           └── AnalysisCard.test.tsx
├── lib/
│   ├── __tests__/
│   │   └── utils.test.ts
│   └── ai/
│       └── __tests__/
│           └── analysisService.test.ts
└── app/
    └── api/
        └── analyses/
            └── __tests__/
                └── route.test.ts
```

## Available Test Data

### Sample Documents (`fixtures/sampleDocuments.ts`)

We provide **5 different contract types** with realistic content:

1. **Construction Contract** - $450,000 residential build
   - High upfront deposit (30%)
   - Vague termination clause
   - Multiple red flags
   - **Risk Score:** 78

2. **Software Development Service Agreement** - $75,000
   - 50% non-refundable deposit
   - IP retained by provider
   - Auto-renewal clause
   - **Risk Score:** 82

3. **Commercial Lease Agreement** - $300,000 (5-year)
   - 8% annual rent increases
   - No early termination
   - High security deposit
   - **Risk Score:** 85

4. **Freelance Consulting Agreement** - $8,500
   - High kill fee
   - Expensive rush charges
   - **Risk Score:** 65

5. **Event Vendor Agreement** - $55,540
   - Double charges (service + gratuity)
   - Harsh cancellation terms
   - **Risk Score:** 72

### Mock Analysis Data (`fixtures/mockAnalyses.ts`)

Pre-built analysis objects representing different states:

- `mockAnalysisCompleted` - Fully analyzed with results
- `mockAnalysisProcessing` - Currently being analyzed
- `mockAnalysisFailed` - Failed analysis with error
- `mockAnalysisLowRisk` - Low risk score (25)
- `mockAnalysisHighRisk` - High risk score (85)

### Mock Services

#### Supabase Mock (`mocks/supabase.ts`)
```typescript
import { mockSupabaseClient } from '@/__tests__/mocks/supabase';

// Already mocked: database queries, storage, auth
```

#### OpenAI Mock (`mocks/openai.ts`)
```typescript
import { mockOpenAIClient } from '@/__tests__/mocks/openai';

// Returns structured analysis response
// Also includes createFailingOpenAIClient() for error testing
```

#### OCR Mock (`mocks/ocr.ts`)
```typescript
import { mockOCRExtract } from '@/__tests__/mocks/ocr';

// Returns extracted text from documents
// Simulates failures for 'corrupted' or 'invalid' filenames
```

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Specific Test File
```bash
npm test -- src/lib/ai/__tests__/analysisService.test.ts
```

### Run Tests with Coverage
```bash
npm test -- --coverage
```

## Test Categories

### 1. Unit Tests

**Component Tests:**
- `src/components/__tests__/Badge.test.tsx`
- `src/components/analysis/__tests__/AnalysisCard.test.tsx`

**Utility Tests:**
- `src/lib/__tests__/utils.test.ts`
- `src/lib/ai/__tests__/config.test.ts`

**Service Tests:**
- `src/lib/ai/__tests__/analysisService.test.ts`

### 2. Integration Tests

**Complete Flow:**
- `src/__tests__/integration/analysisFlow.test.ts`
  - Upload → OCR → AI Analysis → Database Update
  - Error handling scenarios
  - Feedback submission

### 3. API Route Tests

**Analyses Endpoints:**
- `src/app/api/analyses/__tests__/route.test.ts`
  - GET /api/analyses (list all)
  - POST /api/analyses (create new)
  - Authentication checks
  - File validation

## Writing New Tests

### Using Sample Documents

```typescript
import {
  sampleConstructionContract,
  sampleServiceAgreement
} from '@/__tests__/fixtures/sampleDocuments';

test('analyzes construction contract', async () => {
  const result = await analyzeDocument(sampleConstructionContract);
  expect(result.documentType).toBe('Construction Contract');
});
```

### Using Mock Analyses

```typescript
import {
  mockAnalysisCompleted,
  mockAnalysisProcessing
} from '@/__tests__/fixtures/mockAnalyses';

test('displays completed analysis', () => {
  render(<AnalysisCard analysis={mockAnalysisCompleted} />);
  expect(screen.getByText('Construction Contract')).toBeInTheDocument();
});
```

### Using Mock Services

```typescript
import { createMockSupabaseClient } from '@/__tests__/mocks/supabase';

test('fetches analyses from database', async () => {
  const client = createMockSupabaseClient();
  const { data } = await client.from('analyses').select();
  expect(data).toHaveLength(5);
});
```

## Test Coverage Goals

| Module | Current Coverage | Goal |
|--------|-----------------|------|
| Components | 60% | 80% |
| API Routes | 45% | 75% |
| AI Services | 70% | 85% |
| Utilities | 85% | 90% |
| Integration | 30% | 60% |

## Manual Testing Scenarios

### Upload Flow
1. Navigate to `/dashboard/new`
2. Upload a PDF file
3. Verify processing status updates
4. Check completed analysis results

### Dashboard
1. View all analyses
2. Filter by status
3. Delete an analysis
4. Navigate to detail page

### Analysis Detail
1. View full analysis
2. Check red flags display
3. Verify cost breakdown
4. Submit feedback

### Admin Dashboard
1. View all user analyses
2. Check statistics
3. Read feedback entries

## Common Test Patterns

### Testing Async Operations
```typescript
it('should complete async operation', async () => {
  const result = await asyncFunction();
  expect(result).toBeDefined();
});
```

### Testing Error Handling
```typescript
it('should handle errors', async () => {
  await expect(failingFunction()).rejects.toThrow('Error message');
});
```

### Testing React Components
```typescript
it('should render component', () => {
  render(<MyComponent prop="value" />);
  expect(screen.getByText('Expected Text')).toBeInTheDocument();
});
```

### Testing API Routes
```typescript
it('should return data', async () => {
  const request = new NextRequest('http://localhost/api/test');
  const response = await GET(request);
  expect(response.status).toBe(200);
});
```

## Troubleshooting

### Tests Failing?

1. **Check Mocks:** Ensure all external services are properly mocked
2. **Clear Cache:** Run `npm test -- --clearCache`
3. **Update Snapshots:** Run `npm test -- -u` if component snapshots changed
4. **Check Environment:** Verify `.env.test` file exists

### Common Issues

**Issue:** "Cannot find module"
**Solution:** Check import paths and ensure files exist

**Issue:** "Timeout exceeded"
**Solution:** Increase timeout in jest.config.js or specific test

**Issue:** "Unexpected token"
**Solution:** Check Jest configuration for TypeScript/JSX support

## Next Steps

To improve test coverage:

1. ✅ **Add E2E tests** using Playwright or Cypress
2. ✅ **Add visual regression tests** for UI components
3. ✅ **Add performance tests** for AI analysis
4. ✅ **Add accessibility tests** using jest-axe
5. ✅ **Add API contract tests** for external services

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Next.js Testing Guide](https://nextjs.org/docs/testing)
- [Supabase Testing Guide](https://supabase.com/docs/guides/testing)

---

**Last Updated:** February 21, 2026

For questions or issues, please refer to the main [README.md](./README.md) or create an issue in the repository.
