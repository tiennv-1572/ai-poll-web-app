-- Create polls table
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

-- Create poll_options table
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

-- Create votes table
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

-- Create indexes for performance
CREATE INDEX idx_polls_access_code ON polls(access_code);
CREATE INDEX idx_polls_deadline ON polls(deadline);
CREATE INDEX idx_polls_created_at ON polls(created_at DESC);
CREATE INDEX idx_poll_options_poll_id ON poll_options(poll_id);
CREATE INDEX idx_poll_options_order ON poll_options(poll_id, display_order);
CREATE INDEX idx_votes_poll_id ON votes(poll_id);
CREATE INDEX idx_votes_poll_option_id ON votes(poll_option_id);
CREATE INDEX idx_votes_submitted_at ON votes(submitted_at DESC);

-- Case-insensitive unique constraint on email
CREATE UNIQUE INDEX unique_vote_per_poll_case_insensitive 
ON votes(poll_id, LOWER(voter_email));

-- Function to generate unique access code
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

-- Function to check if voting is allowed
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

-- Enable Row Level Security
ALTER TABLE polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for polls
CREATE POLICY "Polls are publicly readable"
  ON polls FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create polls"
  ON polls FOR INSERT
  WITH CHECK (true);

-- RLS Policies for poll_options
CREATE POLICY "Poll options are publicly readable"
  ON poll_options FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create poll options"
  ON poll_options FOR INSERT
  WITH CHECK (true);

-- RLS Policies for votes
CREATE POLICY "Votes readable for real-time polls"
  ON votes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM polls 
      WHERE polls.id = votes.poll_id 
      AND (polls.show_realtime_results = true OR NOW() > polls.deadline)
    )
  );

CREATE POLICY "Anyone can insert votes"
  ON votes FOR INSERT
  WITH CHECK (true);

-- Trigger function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for polls table
CREATE TRIGGER update_polls_updated_at
  BEFORE UPDATE ON polls
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
