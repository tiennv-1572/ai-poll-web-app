# Phase 1: Data Model

**Feature**: Poll Voting Web Application  
**Date**: December 16, 2025  
**Technology**: Supabase (PostgreSQL)

## Database Schema

### Table: polls

Stores poll metadata and configuration.

```sql
CREATE TABLE polls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Creator information
  creator_name VARCHAR(255) NOT NULL,
  creator_email VARCHAR(255) NOT NULL,
  
  -- Poll content
  question TEXT NOT NULL CHECK (char_length(question) >= 5),
  deadline TIMESTAMPTZ NOT NULL,
  
  -- Configuration
  show_realtime_results BOOLEAN NOT NULL DEFAULT true,
  access_code VARCHAR(8) UNIQUE NOT NULL,
  
  -- Constraints
  CONSTRAINT deadline_must_be_future CHECK (deadline > created_at)
);

-- Indexes
CREATE INDEX idx_polls_access_code ON polls(access_code);
CREATE INDEX idx_polls_deadline ON polls(deadline);
CREATE INDEX idx_polls_created_at ON polls(created_at DESC);
```

**Field Descriptions**:
- `id`: UUID primary key for poll identification in URLs
- `created_at`: Automatic timestamp for audit trail
- `updated_at`: Track last modification (triggers below)
- `creator_name`: Display name of poll creator (required, no auth)
- `creator_email`: Contact email of creator (required, validation in app)
- `question`: The poll question (minimum 5 characters)
- `deadline`: When voting closes (must be future date at creation)
- `show_realtime_results`: Whether to show results before deadline
- `access_code`: Short code for easy poll access (8 chars, unique)

**Business Rules**:
- Deadline must be in the future when poll is created
- Access code must be unique across all polls
- Question must be at least 5 characters

---

### Table: poll_options

Stores the available choices for each poll.

```sql
CREATE TABLE poll_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  option_text VARCHAR(500) NOT NULL,
  display_order INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT unique_option_order_per_poll UNIQUE(poll_id, display_order),
  CONSTRAINT option_text_not_empty CHECK (char_length(option_text) > 0)
);

-- Indexes
CREATE INDEX idx_poll_options_poll_id ON poll_options(poll_id);
CREATE INDEX idx_poll_options_order ON poll_options(poll_id, display_order);
```

**Field Descriptions**:
- `id`: UUID primary key
- `poll_id`: Foreign key to parent poll (cascade delete)
- `option_text`: The choice text (max 500 chars)
- `display_order`: Order to display options (0-indexed)
- `created_at`: Timestamp for audit

**Business Rules**:
- Each poll must have at least 2 options (enforced in application)
- Display order must be unique within a poll
- Options are deleted when parent poll is deleted

---

### Table: votes

Stores individual votes submitted by voters.

```sql
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  poll_option_id UUID NOT NULL REFERENCES poll_options(id) ON DELETE CASCADE,
  
  -- Voter information
  voter_name VARCHAR(255) NOT NULL,
  voter_email VARCHAR(255) NOT NULL,
  
  -- Metadata
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints: One vote per email per poll (case-insensitive)
  CONSTRAINT unique_vote_per_poll UNIQUE(poll_id, voter_email)
);

-- Indexes
CREATE INDEX idx_votes_poll_id ON votes(poll_id);
CREATE INDEX idx_votes_poll_option_id ON votes(poll_option_id);
CREATE INDEX idx_votes_submitted_at ON votes(submitted_at DESC);

-- Case-insensitive unique constraint on email
CREATE UNIQUE INDEX unique_vote_per_poll_case_insensitive 
ON votes(poll_id, LOWER(voter_email));
```

**Field Descriptions**:
- `id`: UUID primary key
- `poll_id`: Foreign key to poll being voted on
- `poll_option_id`: Foreign key to selected option
- `voter_name`: Display name of voter (required, no auth)
- `voter_email`: Email of voter (required, used for deduplication)
- `submitted_at`: Timestamp of vote submission

**Business Rules**:
- One vote per email per poll (case-insensitive email matching)
- Cannot vote after poll deadline (enforced in application)
- Votes are deleted when parent poll is deleted

---

### Materialized View: poll_results

Aggregated vote counts for efficient result display.

```sql
CREATE MATERIALIZED VIEW poll_results AS
SELECT 
  po.poll_id,
  po.id as option_id,
  po.option_text,
  po.display_order,
  COUNT(v.id) as vote_count,
  ROUND(
    CASE 
      WHEN (SELECT COUNT(*) FROM votes WHERE poll_id = po.poll_id) = 0 
      THEN 0 
      ELSE (COUNT(v.id)::NUMERIC / (SELECT COUNT(*) FROM votes WHERE poll_id = po.poll_id) * 100)
    END, 
    2
  ) as percentage
FROM poll_options po
LEFT JOIN votes v ON v.poll_option_id = po.id
GROUP BY po.poll_id, po.id, po.option_text, po.display_order
ORDER BY po.poll_id, po.display_order;

-- Index for fast lookups
CREATE UNIQUE INDEX idx_poll_results_poll_option 
ON poll_results(poll_id, option_id);

-- Refresh function (called after votes inserted)
CREATE OR REPLACE FUNCTION refresh_poll_results(p_poll_id UUID)
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY poll_results;
END;
$$ LANGUAGE plpgsql;
```

**Note**: For initial implementation, can use regular view instead of materialized view. Materialized view provides better performance for high-traffic polls but requires refresh strategy.

---

## Database Functions

### Function: generate_access_code

Generates a unique 8-character access code for polls.

```sql
CREATE OR REPLACE FUNCTION generate_access_code()
RETURNS VARCHAR(8) AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- Exclude ambiguous chars
  code VARCHAR(8);
  attempts INTEGER := 0;
  max_attempts INTEGER := 100;
BEGIN
  LOOP
    code := '';
    FOR i IN 1..8 LOOP
      code := code || substr(chars, floor(random() * length(chars) + 1)::int, 1);
    END LOOP;
    
    -- Check if code already exists
    IF NOT EXISTS (SELECT 1 FROM polls WHERE access_code = code) THEN
      RETURN code;
    END IF;
    
    attempts := attempts + 1;
    IF attempts >= max_attempts THEN
      RAISE EXCEPTION 'Could not generate unique access code after % attempts', max_attempts;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;
```

**Usage**: Set as default value or call in application before insert.

---

### Function: can_vote

Checks if voting is allowed for a poll.

```sql
CREATE OR REPLACE FUNCTION can_vote(p_poll_id UUID, p_email VARCHAR)
RETURNS TABLE(allowed BOOLEAN, reason TEXT) AS $$
DECLARE
  poll_deadline TIMESTAMPTZ;
  already_voted BOOLEAN;
BEGIN
  -- Get poll deadline
  SELECT deadline INTO poll_deadline 
  FROM polls WHERE id = p_poll_id;
  
  IF poll_deadline IS NULL THEN
    RETURN QUERY SELECT false, 'Poll not found';
    RETURN;
  END IF;
  
  -- Check if deadline passed
  IF NOW() > poll_deadline THEN
    RETURN QUERY SELECT false, 'Voting has closed';
    RETURN;
  END IF;
  
  -- Check if already voted
  SELECT EXISTS(
    SELECT 1 FROM votes 
    WHERE poll_id = p_poll_id 
    AND LOWER(voter_email) = LOWER(p_email)
  ) INTO already_voted;
  
  IF already_voted THEN
    RETURN QUERY SELECT false, 'You have already voted on this poll';
    RETURN;
  END IF;
  
  -- All checks passed
  RETURN QUERY SELECT true, 'Allowed';
END;
$$ LANGUAGE plpgsql;
```

**Usage**: Call before accepting vote to provide user-friendly error messages.

---

## Row Level Security (RLS) Policies

Enable RLS on all tables for security, even without authentication.

```sql
-- Enable RLS
ALTER TABLE polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Polls: Anyone can read, create
CREATE POLICY "Polls are publicly readable"
  ON polls FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create polls"
  ON polls FOR INSERT
  WITH CHECK (true);

-- Poll Options: Anyone can read, insert with poll
CREATE POLICY "Poll options are publicly readable"
  ON poll_options FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create poll options"
  ON poll_options FOR INSERT
  WITH CHECK (true);

-- Votes: Read based on poll config, anyone can insert once
CREATE POLICY "Votes readable for real-time polls"
  ON votes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM polls 
      WHERE polls.id = votes.poll_id 
      AND (polls.show_realtime_results = true OR NOW() > polls.deadline)
    )
  );

CREATE POLICY "Anyone can vote once per poll"
  ON votes FOR INSERT
  WITH CHECK (
    NOT EXISTS (
      SELECT 1 FROM votes v2 
      WHERE v2.poll_id = votes.poll_id 
      AND LOWER(v2.voter_email) = LOWER(votes.voter_email)
    )
  );
```

---

## Database Triggers

### Update timestamp trigger

```sql
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_polls_updated_at
  BEFORE UPDATE ON polls
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
```

---

## TypeScript Types (Generated)

After running `supabase gen types typescript`:

```typescript
export interface Database {
  public: {
    Tables: {
      polls: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          creator_name: string
          creator_email: string
          question: string
          deadline: string
          show_realtime_results: boolean
          access_code: string
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          creator_name: string
          creator_email: string
          question: string
          deadline: string
          show_realtime_results?: boolean
          access_code: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          creator_name?: string
          creator_email?: string
          question?: string
          deadline?: string
          show_realtime_results?: boolean
          access_code?: string
        }
      }
      poll_options: {
        Row: {
          id: string
          poll_id: string
          option_text: string
          display_order: number
          created_at: string
        }
        Insert: {
          id?: string
          poll_id: string
          option_text: string
          display_order: number
          created_at?: string
        }
        Update: {
          id?: string
          poll_id?: string
          option_text?: string
          display_order?: number
          created_at?: string
        }
      }
      votes: {
        Row: {
          id: string
          poll_id: string
          poll_option_id: string
          voter_name: string
          voter_email: string
          submitted_at: string
        }
        Insert: {
          id?: string
          poll_id: string
          poll_option_id: string
          voter_name: string
          voter_email: string
          submitted_at?: string
        }
        Update: {
          id?: string
          poll_id?: string
          poll_option_id?: string
          voter_name?: string
          voter_email?: string
          submitted_at?: string
        }
      }
    }
  }
}
```

---

## Migration Strategy

### Initial Migration

```sql
-- migrations/001_initial_schema.sql
-- Create all tables, indexes, functions, and policies in order
-- Run: supabase db push
```

### Seed Data (Development)

```sql
-- supabase/seed.sql
INSERT INTO polls (id, creator_name, creator_email, question, deadline, show_realtime_results, access_code)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'John Doe',
  'john@example.com',
  'What time works best for the team meeting?',
  NOW() + INTERVAL '7 days',
  true,
  'MEET2024'
);

INSERT INTO poll_options (poll_id, option_text, display_order)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440000', '9:00 AM', 0),
  ('550e8400-e29b-41d4-a716-446655440000', '2:00 PM', 1),
  ('550e8400-e29b-41d4-a716-446655440000', '5:00 PM', 2);
```

---

## Data Integrity Rules

1. **Referential Integrity**: All foreign keys use CASCADE DELETE to maintain consistency
2. **Email Case Sensitivity**: Emails normalized to lowercase for comparison
3. **Deadline Validation**: Checked at database level (creation) and application level (voting)
4. **Option Count**: Minimum 2 options enforced in application (not database constraint for flexibility)
5. **Access Code Uniqueness**: Database unique constraint ensures no collisions

---

## Performance Considerations

### Expected Query Patterns

1. **Poll Lookup by ID**: `O(1)` with primary key index
2. **Poll Lookup by Code**: `O(1)` with access_code index
3. **Vote Count by Poll**: `O(n)` where n = votes per poll (can use materialized view)
4. **Duplicate Vote Check**: `O(1)` with composite index on (poll_id, email)

### Optimization Strategies

- Use materialized view for high-traffic polls (100+ votes)
- Regular refresh of materialized view via cron or trigger
- Consider partitioning votes table if scaling to millions of votes
- Monitor query performance with `EXPLAIN ANALYZE`

---

## Next Steps

1. ✅ Implement database schema in Supabase migration
2. ✅ Generate TypeScript types
3. Define API contracts for Next.js API routes
4. Create quickstart guide with database setup
