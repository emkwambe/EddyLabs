# StorySprout

**Global Education Platform for Ages 2-18+**

StorySprout is a Netflix-like platform for personalized educational stories with embedded text and audio. It delivers age-appropriate, culturally diverse content that grows with learners from pre-K through high school.

## Features

- **Personalized Stories** - AI-generated stories tailored to each child's reading level, interests, and learning goals
- **Global Cultures** - Stories from 7 continents and 30+ countries with authentic cultural elements
- **Age-Appropriate Content** - Strict content safety guardrails for ages 2-18+ with age-tiered restrictions
- **Audio Integration** - Text-to-speech narration for accessibility and language learning
- **Progress Tracking** - Reading metrics, achievements, and parent dashboards
- **Accessibility** - Dyslexia-friendly fonts, adjustable text sizes, and high-contrast modes

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: Supabase (PostgreSQL)
- **AI**: Anthropic Claude (claude-sonnet-4-5-20250929)
- **Workflows**: n8n Cloud
- **Styling**: Tailwind CSS
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Anthropic API key

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd storysprout
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
# Edit .env.local with your API keys
```

4. Run database migrations:
```bash
npx supabase db push
```

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
storysprout/
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── dashboard/       # Parent & child dashboards
│   │   ├── read/            # Story reader interface
│   │   ├── login/           # Authentication
│   │   └── signup/          # Registration
│   ├── lib/
│   │   ├── storysprout/     # Core platform logic
│   │   │   ├── types.ts     # TypeScript types & enums
│   │   │   ├── prompts.ts   # AI prompt templates
│   │   │   └── content-safety.ts  # Safety guardrails
│   │   └── supabase/        # Database client
│   └── components/          # Reusable UI components
├── supabase/
│   └── migrations/          # Database schema migrations
├── n8n-workflows/           # Automation workflows
└── public/                  # Static assets
```

## Age Bands & School Levels

| School Level | Grades | Ages | Content Complexity |
|--------------|--------|------|-------------------|
| Early Childhood | Pre-K, K-Prep | 2-5 | Simple, visual-heavy |
| Elementary | 1-5 | 6-11 | Developing vocabulary |
| Middle School | 6-8 | 11-14 | Age-appropriate themes |
| High School | 9-12 | 14-18+ | Complex narratives |

## Cultural Coverage

Stories span 7 continents with specific regions:
- **Africa**: North, West, East, Central, Southern
- **Asia**: East, Southeast, South, Central, Middle East
- **Europe**: Western, Eastern, Northern, Southern
- **Americas**: North, Central, South, Caribbean
- **Oceania**: Australia/NZ, Pacific Islands, Melanesia

## Content Safety

StorySprout implements multi-layer content safety:

1. **Age-Tiered Restrictions** - Different content rules per age group
2. **AI Guardrails** - System prompts enforce safe content generation
3. **Content Validation** - Post-generation safety checks
4. **Parent Controls** - Customizable content filters

## Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run test         # Run tests
npm run db:migrate   # Push database migrations
```

## n8n Workflow Integration

The `n8n-workflows/` folder contains automation workflows for:
- Story generation pipeline
- Content moderation queue
- Audio generation triggers
- Analytics aggregation

Import these into your n8n instance for automated story generation.

## License

Private - All rights reserved.

## Support

For issues and feature requests, please contact the development team.
