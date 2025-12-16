# Quickstart Guide: Poll Voting Application

**Feature**: Poll Voting Web Application  
**Tech Stack**: Next.js 14+ | TailwindCSS 3+ | Supabase  
**Date**: December 16, 2025

This guide walks you through setting up the development environment and running the Poll Voting application locally.

---

## Prerequisites

Ensure you have the following installed:

- **Node.js**: v18.17 or higher ([Download](https://nodejs.org/))
- **npm** or **pnpm**: Package manager (npm comes with Node.js)
- **Git**: Version control
- **Supabase CLI**: For local database management
- **Docker Desktop**: Required for Supabase local development

### Verify Installation

```bash
node --version  # Should be v18.17+
npm --version   # Should be v9+
git --version
```

### Install Supabase CLI

```bash
# macOS
brew install supabase/tap/supabase

# Windows (PowerShell)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# Linux
brew install supabase/tap/supabase
```

Verify:
```bash
supabase --version
```

---

## Project Setup

### 1. Clone Repository

```bash
git clone <repository-url>
cd poll-voting
```

### 2. Install Dependencies

```bash
npm install
# or
pnpm install
```

This installs:
- Next.js 14+
- React 18+
- TailwindCSS 3+
- Supabase JS Client
- Zod (validation)
- TypeScript
- Testing libraries

### 3. Start Supabase Locally

```bash
# Initialize Supabase (first time only)
supabase init

# Start all Supabase services (Postgres, Auth, Storage, etc.)
supabase start
```

**Expected Output**:
```
Started supabase local development setup.

         API URL: http://localhost:54321
          DB URL: postgresql://postgres:postgres@localhost:54322/postgres
      Studio URL: http://localhost:54323
    Inbucket URL: http://localhost:54324
      JWT secret: super-secret-jwt-token-with-at-least-32-characters-long
        anon key: eyJhbGc...
service_role key: eyJhbGc...
```

**Save the `anon key` and `API URL`** - you'll need them in the next step.

### 4. Configure Environment Variables

Create a `.env.local` file in the project root:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc... # Paste the anon key from above

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Note**: The `NEXT_PUBLIC_` prefix exposes variables to the browser. Only use it for public keys.

### 5. Run Database Migrations

```bash
# Apply migrations to local database
supabase db push

# Or run specific migration
supabase migration up
```

This creates the `polls`, `poll_options`, and `votes` tables with all indexes and functions.

### 6. Generate TypeScript Types

```bash
# Generate types from database schema
supabase gen types typescript --local > src/types/supabase.ts
```

This creates TypeScript types matching your database schema for type-safe queries.

### 7. Seed Database (Optional)

```bash
# Load sample data for development
supabase db reset
```

This will reset the database and run the seed script in `supabase/seed.sql`.

---

## Running the Application

### Development Server

```bash
npm run dev
# or
pnpm dev
```

The application will start at **http://localhost:3000**

**Hot Reload**: Changes to code automatically refresh the browser.

### Build for Production

```bash
npm run build
npm start
```

---

## Project Structure Overview

```
poll-voting/
├── src/
│   ├── app/              # Next.js App Router (pages & API)
│   │   ├── page.tsx      # Homepage
│   │   ├── create/       # Poll creation flow
│   │   ├── poll/         # Voting & results
│   │   └── api/          # API route handlers
│   ├── components/       # React components
│   ├── lib/              # Utilities & config
│   │   ├── supabase.ts   # Supabase client
│   │   └── validations.ts # Zod schemas
│   └── types/            # TypeScript types
├── supabase/
│   ├── migrations/       # Database migrations
│   └── seed.sql          # Sample data
├── tests/                # Test files
├── public/               # Static assets
└── tailwind.config.ts    # TailwindCSS config
```

---

## Key Development Workflows

### Creating a New Database Migration

When you need to change the database schema:

```bash
# Create new migration file
supabase migration new add_poll_analytics

# Edit the generated file in supabase/migrations/
# Add your SQL changes

# Apply migration
supabase db push

# Regenerate TypeScript types
supabase gen types typescript --local > src/types/supabase.ts
```

### Adding a New API Route

1. Create file in `src/app/api/[route]/route.ts`
2. Implement handler:

```typescript
// src/app/api/example/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('polls')
    .select('*')
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  return NextResponse.json(data)
}
```

### Adding a New Page

1. Create file in `src/app/[route]/page.tsx`
2. Implement component:

```typescript
// src/app/example/page.tsx
export default async function ExamplePage() {
  return (
    <div>
      <h1>Example Page</h1>
    </div>
  )
}
```

### Using Supabase Client

**Server Component**:
```typescript
import { createClient } from '@/lib/supabase/server'

export default async function ServerComponent() {
  const supabase = createClient()
  const { data } = await supabase.from('polls').select('*')
  return <div>{/* Use data */}</div>
}
```

**Client Component**:
```typescript
'use client'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

export default function ClientComponent() {
  const [data, setData] = useState([])
  const supabase = createClient()
  
  useEffect(() => {
    supabase.from('polls').select('*').then(({ data }) => setData(data))
  }, [])
  
  return <div>{/* Use data */}</div>
}
```

---

## Testing

### Run Unit Tests

```bash
npm test
# or
npm run test:watch  # Watch mode
```

### Run E2E Tests

```bash
# Start dev server first
npm run dev

# In another terminal
npm run test:e2e
```

### Run Specific Test

```bash
npm test -- PollForm.test.tsx
```

---

## Supabase Studio (Database UI)

Access the local Supabase Studio at **http://localhost:54323**

Here you can:
- Browse tables and data
- Run SQL queries
- View logs
- Manage authentication (if needed later)
- Test RLS policies

---

## Common Development Tasks

### View Database Logs

```bash
supabase db logs
```

### Reset Database

```bash
# Warning: Deletes all data
supabase db reset
```

### Check Migration Status

```bash
supabase migration list
```

### Generate Access Code (Testing)

Use the database function:

```sql
SELECT generate_access_code();
```

Or in your code:
```typescript
const { data } = await supabase.rpc('generate_access_code')
console.log(data) // e.g., "MEET2024"
```

---

## Troubleshooting

### Port Already in Use

If port 3000 is occupied:

```bash
# Use different port
PORT=3001 npm run dev
```

### Supabase Services Won't Start

```bash
# Stop all services
supabase stop

# Remove volumes and restart
supabase stop --no-backup
supabase start
```

### Type Errors After Schema Change

```bash
# Regenerate types
supabase gen types typescript --local > src/types/supabase.ts

# Restart dev server
```

### Database Connection Error

Check that Docker is running:
```bash
docker ps  # Should show Supabase containers
```

If not running:
```bash
supabase start
```

---

## Environment Variables Reference

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase API URL | Yes | `http://localhost:54321` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key | Yes | `eyJhbGc...` |
| `NEXT_PUBLIC_APP_URL` | Application base URL | Yes | `http://localhost:3000` |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side admin key | No | Used for admin operations |

---

## Next Steps

After setup, try these tasks:

1. ✅ **Create a Poll**: Navigate to http://localhost:3000/create
2. ✅ **Vote on Poll**: Use the generated link or access code
3. ✅ **View Results**: See real-time updates as votes come in
4. ✅ **Explore Database**: Check Supabase Studio to see data
5. ✅ **Run Tests**: Execute test suite to verify functionality

### Development Checklist

- [ ] All dependencies installed
- [ ] Supabase running locally
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] TypeScript types generated
- [ ] Dev server running successfully
- [ ] Can create a poll
- [ ] Can vote on a poll
- [ ] Can view results

---

## Deployment (Production)

### Supabase Cloud Setup

1. Create project at https://supabase.com
2. Run migrations:
   ```bash
   supabase link --project-ref your-project-ref
   supabase db push
   ```
3. Get production API keys from project settings

### Vercel Deployment

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_APP_URL`
4. Deploy

---

## Additional Resources

- **Next.js Documentation**: https://nextjs.org/docs
- **Supabase Documentation**: https://supabase.com/docs
- **TailwindCSS Documentation**: https://tailwindcss.com/docs
- **Project Specification**: [spec.md](../spec.md)
- **API Contracts**: [contracts/api-routes.md](../contracts/api-routes.md)
- **Data Model**: [data-model.md](../data-model.md)

---

## Support

For issues or questions:
1. Check [troubleshooting section](#troubleshooting)
2. Review [data model](../data-model.md) and [API contracts](../contracts/api-routes.md)
3. Check Supabase logs: `supabase db logs`
4. Check Next.js console output

**Happy coding! 🚀**
