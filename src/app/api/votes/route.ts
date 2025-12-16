import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { submitVoteSchema } from '@/lib/validations';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body using Zod schema
    const validationResult = submitVoteSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          issues: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const { poll_id, poll_option_id, voter_name, voter_email } = validationResult.data;

    // Initialize Supabase client
    const supabase = await createServerClient();

    // Check if poll exists and is still open
    const { data: poll, error: pollError } = await supabase
      .from('polls')
      .select('id, deadline')
      .eq('id', poll_id)
      .single();

    if (pollError || !poll) {
      return NextResponse.json({ error: 'Poll not found' }, { status: 404 });
    }

    // Check if deadline has passed
    const now = new Date();
    const deadline = new Date(poll.deadline);
    if (now > deadline) {
      return NextResponse.json(
        { error: 'Voting has closed for this poll' },
        { status: 410 } // 410 Gone
      );
    }

    // Check if option belongs to this poll
    const { data: option, error: optionError } = await supabase
      .from('poll_options')
      .select('id')
      .eq('id', poll_option_id)
      .eq('poll_id', poll_id)
      .single();

    if (optionError || !option) {
      return NextResponse.json(
        { error: 'Invalid poll option' },
        { status: 400 }
      );
    }

    // Check for duplicate vote (same email for this poll)
    const { data: existingVote, error: duplicateCheckError } = await supabase
      .from('votes')
      .select('id')
      .eq('poll_id', poll_id)
      .eq('voter_email', voter_email)
      .single();

    if (duplicateCheckError && duplicateCheckError.code !== 'PGRST116') {
      // PGRST116 is "no rows returned" which is expected when no duplicate exists
      console.error('Duplicate check error:', duplicateCheckError);
      return NextResponse.json(
        { error: 'Failed to check duplicate vote' },
        { status: 500 }
      );
    }

    if (existingVote) {
      return NextResponse.json(
        { error: 'You have already voted in this poll' },
        { status: 409 } // 409 Conflict
      );
    }

    // Insert vote
    const { data: vote, error: voteError } = await supabase
      .from('votes')
      .insert({
        poll_id,
        poll_option_id,
        voter_name,
        voter_email,
      })
      .select()
      .single();

    if (voteError) {
      console.error('Vote insertion error:', voteError);
      return NextResponse.json(
        { error: 'Failed to submit vote. Please try again.' },
        { status: 500 }
      );
    }

    // Return success response
    return NextResponse.json(
      {
        success: true,
        vote: {
          id: vote.id,
          poll_id: vote.poll_id,
          created_at: vote.created_at,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Unexpected error in POST /api/votes:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
