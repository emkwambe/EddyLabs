# Fairlytica

AI-powered consumer protection web app that helps detect hidden fees, shady charges, and predatory terms in bills, estimates, and contracts.

## Features

- **Document Analysis**: Upload PDFs, images, or paste text for instant analysis
- **Red Flag Detection**: AI identifies suspicious fees, predatory terms, and vague charges
- **Risk Scoring**: Clear risk assessment (Safe, Mild Concern, High Concern)
- **Plain English Summaries**: Complex terms explained simply
- **Action Scripts**: Ready-to-use scripts to challenge suspicious charges
- **User Dashboard**: Track and manage all your analyses

## Tech Stack

- **Frontend**: Next.js 15 (App Router) + TypeScript + React + TailwindCSS
- **Backend**: Next.js Route Handlers (API routes)
- **Database**: PostgreSQL via Supabase
- **Auth**: Supabase Auth
- **Storage**: Supabase Storage
- **AI**: OpenAI GPT-4o-mini
- **OCR**: OCR.space API (optional)

## Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account (free tier works)
- OpenAI API key

## Setup Instructions

### 1. Clone the repository

```bash
git clone <repository-url>
cd fairlytica
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to the SQL Editor and run the schema from `supabase/schema.sql`
3. Get your project credentials from Settings > API

### 4. Configure environment variables

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# OpenAI Configuration
OPENAI_API_KEY=your-openai-api-key

# OCR Configuration (optional)
OCR_API_KEY=your-ocr-api-key
OCR_API_URL=https://api.ocr.space/parse/image

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Quick Start

1. Sign up for an account (or use "Try Demo Account" for quick testing)
2. Click "New Analysis" on the dashboard
3. Choose your input method:
   - Upload a file (PDF, JPG, PNG, TXT)
   - Paste text directly
   - Enter a URL
4. Wait for the AI analysis to complete
5. Review your results including:
   - Risk score and summary
   - Red flags detected
   - Cost breakdown (if available)
   - Recommended actions and scripts

### Sample Documents

The app includes sample documents for testing in `src/lib/sampleData.ts`:

- Medical Invoice
- Dental Estimate
- Auto Repair Estimate
- Subscription Contract
- Loan Agreement

You can paste these directly when creating a new analysis.

## API Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analyses` | List user's analyses |
| POST | `/api/analyses` | Create new analysis |
| GET | `/api/analyses/[id]` | Get analysis details |
| DELETE | `/api/analyses/[id]` | Delete an analysis |
| POST | `/api/analyses/[id]/feedback` | Submit feedback |
| GET | `/api/admin/analyses` | List all analyses (admin) |
| POST | `/api/auth/signup` | Create account |
| POST | `/api/auth/login` | Sign in |
| POST | `/api/auth/logout` | Sign out |

## Project Structure

```
src/
├── app/
│   ├── api/              # API route handlers
│   ├── admin/            # Admin dashboard
│   ├── analyses/[id]/    # Analysis detail page
│   ├── dashboard/        # User dashboard
│   ├── login/            # Login page
│   ├── signup/           # Signup page
│   └── page.tsx          # Landing page
├── components/
│   ├── layout/           # Header, Footer
│   └── ui/               # Button, Card, Input, Badge
├── lib/
│   ├── ai/               # AI analysis engine
│   ├── ocr/              # OCR extraction
│   ├── supabase/         # Supabase clients
│   ├── types.ts          # TypeScript types
│   └── utils.ts          # Utility functions
└── middleware.ts         # Auth middleware
```

## Database Schema

### Tables

- **users**: User profiles
- **analyses**: Document analyses
- **red_flags**: Detected red flags
- **recommendations**: Action recommendations
- **feedback**: User feedback on analyses

See `supabase/schema.sql` for full schema.

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

## OCR Setup (Optional)

For image and PDF text extraction:

1. Sign up at [ocr.space](https://ocr.space/ocrapi)
2. Get your free API key
3. Add to `.env.local`:
   ```
   OCR_API_KEY=your-api-key
   ```

Without OCR configured, users can still paste text directly.

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Other Platforms

Build the production version:

```bash
npm run build
npm start
```

## Red Flag Detection

The AI analysis combines:

1. **LLM-based analysis**: GPT-4o-mini analyzes document context
2. **Rule-based patterns**: Keyword matching for common issues

Detected issues include:
- Hidden fees (processing fees, facility fees, etc.)
- Predatory terms (auto-renewal, arbitration clauses)
- Vague charges (miscellaneous, "other fees")
- High interest rates or penalties

## Limitations

- This tool provides **informational analysis only**
- Not legal, financial, or professional advice
- OCR accuracy depends on document quality
- AI analysis may not catch all issues

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues or questions, please open a GitHub issue.

---

**Disclaimer**: Fairlytica is an informational tool and does not provide legal, financial, or professional advice. Always consult qualified professionals for important decisions.
