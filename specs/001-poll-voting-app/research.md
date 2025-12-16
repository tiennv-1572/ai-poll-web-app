# Phase 0: Research & Technology Decisions

**Feature**: Poll Voting Web Application  
**Date**: December 16, 2025  
**Status**: Phase 0 Complete

## Technology Stack Decisions

### Next.js 14+ (Full-Stack Framework)

**Decision**: Use Next.js App Router with Server Components for full-stack implementation

**Rationale**:
- **Unified Development**: Single codebase for frontend and backend eliminates coordination overhead
- **Server Components**: Default server rendering reduces JavaScript bundle size and improves initial load performance
- **API Routes**: Built-in API route handlers provide backend functionality without separate server setup
- **TypeScript Native**: First-class TypeScript support throughout the stack
- **File-based Routing**: Intuitive routing system matches application structure
- **Performance Optimizations**: Automatic code splitting, image optimization, and font optimization built-in

**Alternatives Considered**:
- **Separate React + Express**: Rejected due to increased complexity of maintaining two separate projects, CORS configuration, and deployment coordination
- **Create React App**: Rejected due to lack of backend capabilities and deprecation in favor of frameworks like Next.js
- **Remix**: Strong alternative with similar capabilities but Next.js has larger ecosystem and more resources

**Best Practices**:
- Use Server Components by default, Client Components only when needed (interactivity, browser APIs)
- Keep API routes lightweight - delegate business logic to service functions
- Use Server Actions for form submissions where appropriate
- Implement proper error boundaries for both server and client errors
- Use Next.js Image component for optimized image delivery

### TailwindCSS 3+ (Styling)

**Decision**: Use TailwindCSS for all styling with utility-first approach

**Rationale**:
- **Rapid Development**: Utility classes enable fast UI development without context switching
- **Responsive Design**: Built-in responsive modifiers (sm:, md:, lg:, xl:) simplify mobile-first design
- **Consistency**: Design system constraints prevent arbitrary values and ensure visual consistency
- **Small Bundle Size**: PurgeCSS removes unused styles in production
- **Dark Mode Ready**: Built-in dark mode support if needed in future
- **Component Reusability**: Can extract common patterns into React components while keeping styling co-located

**Alternatives Considered**:
- **CSS Modules**: Rejected due to verbose class naming and lack of design system constraints
- **Styled Components**: Rejected due to runtime overhead and complexity with Server Components
- **Material-UI**: Rejected due to opinionated design that may not match desired aesthetics and bundle size concerns

**Best Practices**:
- Configure theme colors, spacing, and breakpoints in tailwind.config.ts
- Use @apply sparingly - prefer composition of utility classes
- Create component variants using clsx/classnames for conditional styling
- Leverage Tailwind plugins for extended functionality (forms, typography)
- Use arbitrary values ([#hex]) only when theme values truly don't fit

### Supabase (Database & Real-time)

**Decision**: Use Supabase for PostgreSQL database, authentication infrastructure (even if unused initially), and real-time subscriptions

**Rationale**:
- **PostgreSQL Foundation**: Robust, proven database with excellent TypeScript support
- **Real-time Built-in**: Native real-time subscriptions eliminate need for WebSocket server setup
- **Auto-generated API**: REST API and TypeScript types generated from database schema
- **Row Level Security**: Powerful security model even without authentication (can use email-based policies)
- **Development Experience**: Local development with Docker, migration tools, schema diff
- **Scalability**: Handles connection pooling, backups, and scaling automatically
- **Future-proof**: Authentication system ready if needed later

**Alternatives Considered**:
- **Firebase**: Rejected due to NoSQL data model complicating vote counting and relationships
- **PlanetScale + Pusher**: Rejected due to complexity of integrating separate services
- **Direct PostgreSQL + Socket.io**: Rejected due to infrastructure management overhead

**Best Practices**:
- Enable Row Level Security (RLS) on all tables
- Use database functions for complex operations (vote counting, duplicate prevention)
- Create database indexes on frequently queried columns (poll_id, email, deadline)
- Use Supabase Realtime for live result updates, not for individual votes
- Type-safe queries using supabase-js generated types
- Handle connection errors gracefully with retry logic

## Architecture Patterns

### Server vs Client Components

**Pattern**: Server Components for data fetching, Client Components for interactivity

**Implementation**:
```typescript
// Server Component (default)
// app/poll/[pollId]/page.tsx
export default async function PollPage({ params }) {
  const poll = await supabase.from('polls').select('*').eq('id', params.pollId).single()
  return <VoteForm poll={poll} /> // VoteForm is Client Component
}

// Client Component (interactive form)
// components/VoteForm.tsx
'use client'
export function VoteForm({ poll }) {
  const [selected, setSelected] = useState(null)
  // ... interactive logic
}
```

**Benefits**: Reduced JavaScript bundle, faster initial render, better SEO

### Real-time Updates Strategy

**Pattern**: Supabase Realtime channels for live result updates

**Implementation**:
```typescript
// Subscribe to vote changes
const channel = supabase
  .channel(`poll:${pollId}`)
  .on('postgres_changes', 
    { event: 'INSERT', schema: 'public', table: 'votes', filter: `poll_id=eq.${pollId}` },
    (payload) => {
      // Update results UI
    }
  )
  .subscribe()
```

**Considerations**:
- Only subscribe on results page, not during voting
- Debounce UI updates if votes come rapidly
- Show loading state during subscription establishment
- Gracefully degrade if real-time fails (polling fallback)

### Form Validation Strategy

**Pattern**: Zod schemas shared between client and server

**Implementation**:
```typescript
// lib/validations.ts
export const createPollSchema = z.object({
  creatorName: z.string().min(1, 'Name is required'),
  creatorEmail: z.string().email('Valid email required'),
  question: z.string().min(5, 'Question too short'),
  options: z.array(z.string()).min(2, 'At least 2 options required'),
  deadline: z.date().min(new Date(), 'Deadline must be future'),
  showRealtime: z.boolean()
})

// Use in both client form and API route
```

**Benefits**: Single source of truth, consistent validation, type safety

## Data Access Patterns

### Poll Access Methods

**Link-based Access**: 
- URL: `/poll/[uuid]`
- Direct database lookup by poll ID
- Most common access pattern

**Code-based Access**:
- User enters 6-character code on `/join` page
- Lookup poll by `access_code` column (indexed)
- Redirect to `/poll/[uuid]`

### Duplicate Vote Prevention

**Pattern**: Database unique constraint + application-level check

**Implementation**:
```sql
-- Database level
CREATE UNIQUE INDEX unique_vote_per_poll 
ON votes(poll_id, LOWER(voter_email));

-- Application level check before insert
const existingVote = await supabase
  .from('votes')
  .select('id')
  .eq('poll_id', pollId)
  .ilike('voter_email', email)
  .single()
```

**Benefits**: Prevents race conditions, provides user-friendly error messages

## Performance Optimizations

### Database Indexes

```sql
CREATE INDEX idx_polls_access_code ON polls(access_code);
CREATE INDEX idx_polls_deadline ON polls(deadline);
CREATE INDEX idx_votes_poll_id ON votes(poll_id);
CREATE INDEX idx_votes_poll_email ON votes(poll_id, voter_email);
```

### Caching Strategy

- **Poll Data**: Revalidate on mutation (Next.js cache tags)
- **Vote Counts**: Aggregate in database function, cache for 1 second
- **Static Assets**: CDN via Vercel/Next.js automatic optimization

### Bundle Optimization

- Use dynamic imports for code-only result pages: `const Chart = dynamic(() => import('react-chartjs-2'))`
- Minimize client-side dependencies
- Use Server Components for anything that doesn't need interactivity

## Security Considerations

### Input Validation

- Validate all inputs on both client (UX) and server (security)
- Sanitize user-generated content (poll questions, options, names)
- Use parameterized queries (Supabase handles this)

### Rate Limiting

- Consider implementing rate limiting on poll creation (prevent spam)
- Use Vercel rate limiting or Upstash Redis for distributed rate limiting

### Email Verification (Optional Future Enhancement)

- Current: No verification, trust-based system
- Future: Could send confirmation email before accepting vote

## Development Workflow

### Local Development Setup

1. **Supabase Local**: Use `supabase start` for local database
2. **Environment Variables**: `.env.local` for Supabase URL and anon key
3. **Type Generation**: Run `supabase gen types typescript` after schema changes
4. **Hot Reload**: Next.js dev server with fast refresh

### Testing Strategy

- **Unit Tests**: Component logic, utility functions (Jest + RTL)
- **Integration Tests**: API routes with mock Supabase client
- **E2E Tests**: Critical user flows with Playwright (create poll → vote → view results)

### Deployment

- **Platform**: Vercel (optimal Next.js integration)
- **Database**: Supabase Cloud (production)
- **Environment**: Separate staging and production Supabase projects
- **Migrations**: Run via Supabase CLI or dashboard

## Open Questions (Resolved)

All technical questions have been resolved through technology stack selection:

- ✅ **Real-time implementation**: Supabase Realtime subscriptions
- ✅ **Vote deduplication**: Database unique constraint + Supabase RLS
- ✅ **Responsive design**: TailwindCSS responsive utilities
- ✅ **Form validation**: Zod schemas with TypeScript
- ✅ **Code generation**: Nanoid for short, URL-safe access codes
- ✅ **Date handling**: date-fns for locale-aware formatting

## Next Steps

Proceed to Phase 1:
1. ✅ Create detailed data model (data-model.md)
2. ✅ Define API contracts (contracts/)
3. ✅ Write quickstart guide (quickstart.md)
4. Update agent context with technology choices
