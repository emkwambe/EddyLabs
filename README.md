# StorySprout

A mobile-first digital reading platform for children ages 2-10 that delivers beautifully written, curriculum-aligned storybooks.

## Core Features

- **Age-Band System**: Pre-K through Grade 4 with developmental alignment
- **Three Reading Modes**: 
  - Read-to-Me (narration)
  - Read-With-Me (highlighted text)
  - Read-Alone (distraction-free)
- **Curriculum Alignment**: Stories mapped to reading standards and sight word lists
- **Sight Word Tracking**: Non-intrusive learning woven into narratives
- **Progress Tracking**: Visual progress paths and reading insights
- **Parent Dashboard**: Manage children, track progress, view sight word exposure

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS
- **Authentication**: Supabase Auth

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase account

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Fill in your Supabase credentials.

4. Set up the database:
   - Run `supabase/storysprout_schema.sql` to create tables
   - Run `supabase/storysprout_seed_data.sql` to add sample stories

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/
│   ├── storysprout/           # Main app pages
│   │   ├── page.tsx           # Landing page
│   │   ├── login/             # Authentication
│   │   ├── signup/
│   │   ├── read/              # Child mode
│   │   │   ├── [childId]/     # Child home & library
│   │   │   └── story/[storyId]/ # Story reader
│   │   └── dashboard/         # Parent mode
│   └── api/storysprout/       # API routes
├── components/storysprout/    # UI components
├── lib/storysprout/           # Types and utilities
└── supabase/                  # Database schema & seeds
```

## Design Principles

- **Story First, Learning Second**: No flashcard fatigue
- **Mobile-First**: Large tap zones, gesture navigation
- **Child-Safe**: No ads, no external links, COPPA-aware
- **Emotionally Safe**: Calm pacing, soft colors, gentle transitions

## License

MIT
