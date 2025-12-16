# Poll Voting Web Application

A responsive web application for creating and participating in polls with real-time results.

## Features

- ✅ **Create Polls**: Set up polls with custom questions, multiple choice options, and deadlines
- 🗳️ **Easy Voting**: One vote per email address with simple form submission
- 📊 **Real-time Results**: Live vote count updates with percentage visualization
- 🔑 **Access Codes**: Join polls using 8-character access codes or direct links
- 📱 **Responsive Design**: Works seamlessly on mobile, tablet, and desktop (320px-1920px)
- ⏰ **Deadline Management**: Automatically close polls at specified times
- 🔒 **Result Visibility**: Choose to show results in real-time or after voting closes

## Tech Stack

- **Framework**: Next.js 14+ (App Router with Server Components)
- **Language**: TypeScript 5.0+
- **Styling**: TailwindCSS 3+
- **Database**: Supabase (PostgreSQL with Real-time)
- **Validation**: Zod
- **Utilities**: date-fns, nanoid

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Supabase account (for production) or Supabase CLI (for local development)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd poll-voting
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Copy the example environment file:

   ```bash
   cp .env.local.example .env.local
   ```

   Fill in your Supabase credentials:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. **Set up the database**

   If using Supabase CLI (local development):

   ```bash
   # Initialize Supabase
   supabase init

   # Start local Supabase
   supabase start

   # Apply migrations
   supabase db push
   ```

   If using Supabase Cloud:
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor
   - Run the migration file from `supabase/migrations/001_initial_schema.sql`

5. **Run the development server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
poll-voting/
├── src/
│   ├── app/                      # Next.js App Router pages and API routes
│   │   ├── page.tsx             # Homepage
│   │   ├── create/              # Poll creation flow
│   │   ├── poll/[pollId]/       # Voting and results pages
│   │   ├── join/                # Code entry page
│   │   └── api/                 # API endpoints
│   ├── components/              # React components
│   │   ├── ui/                  # Reusable UI components
│   │   ├── PollForm.tsx         # Poll creation form
│   │   ├── VoteForm.tsx         # Voting form
│   │   ├── ResultsChart.tsx     # Results visualization
│   │   └── PollHeader.tsx       # Poll metadata display
│   ├── lib/                     # Utilities and configurations
│   │   ├── supabase/            # Supabase client configs
│   │   ├── validations.ts       # Zod schemas
│   │   └── utils.ts             # Helper functions
│   └── types/                   # TypeScript type definitions
├── supabase/
│   └── migrations/              # Database migrations
├── public/                      # Static assets
└── package.json
```

## Database Schema

### Tables

- **polls**: Poll metadata (question, creator info, deadline, settings)
- **poll_options**: Available choices for each poll
- **votes**: Individual vote records

See [data-model.md](specs/001-poll-voting-app/data-model.md) for detailed schema documentation.

## API Routes

- `POST /api/polls` - Create a new poll
- `GET /api/polls/[pollId]` - Get poll details
- `GET /api/polls/[pollId]/results` - Get vote results
- `GET /api/polls/by-code/[code]` - Look up poll by access code
- `POST /api/votes` - Submit a vote

See [contracts/api-routes.md](specs/001-poll-voting-app/contracts/api-routes.md) for detailed API documentation.

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

### Code Quality

- ESLint configured for Next.js and TypeScript
- Prettier for code formatting
- TypeScript strict mode enabled

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Other Platforms

The application can be deployed to any platform that supports Next.js 14+:
- Netlify
- Railway
- Render
- Self-hosted with Docker

## Environment Variables

Required environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Documentation

For more detailed documentation, see:

- [Specification](specs/001-poll-voting-app/spec.md) - Feature requirements and user stories
- [Technical Plan](specs/001-poll-voting-app/plan.md) - Architecture and implementation details
- [Quick Start Guide](specs/001-poll-voting-app/quickstart.md) - Setup and usage walkthrough
- [Task Breakdown](specs/001-poll-voting-app/tasks.md) - Development task list

## License

MIT

## Support

For issues and questions, please open a GitHub issue.
