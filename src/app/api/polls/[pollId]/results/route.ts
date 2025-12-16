import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

interface RouteContext {
  params: Promise<{
    pollId: string;
  }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { pollId } = await context.params;

    // Initialize Supabase client
    const supabase = await createServerClient();

    // Fetch poll details
    const { data: poll, error: pollError } = await supabase
      .from('polls')
      .select('id, show_realtime_results, deadline')
      .eq('id', pollId)
      .single();

    if (pollError || !poll) {
      return NextResponse.json({ error: 'Poll not found' }, { status: 404 });
    }

    // Check visibility permissions
    const isExpired = new Date(poll.deadline) < new Date();
    if (!poll.show_realtime_results && !isExpired) {
      return NextResponse.json(
        { error: 'Results are not available until voting closes' },
        { status: 403 } // 403 Forbidden
      );
    }

    // Fetch poll options
    const { data: options, error: optionsError } = await supabase
      .from('poll_options')
      .select('id, option_text, display_order')
      .eq('poll_id', pollId)
      .order('display_order', { ascending: true });

    if (optionsError) {
      console.error('Options fetch error:', optionsError);
      return NextResponse.json(
        { error: 'Failed to fetch poll options' },
        { status: 500 }
      );
    }

    // Aggregate votes for each option
    const resultsPromises = options.map(async (option) => {
      const { data: votes, error, count } = await supabase
        .from('votes')
        .select('voter_name, voter_email, submitted_at', { count: 'exact' })
        .eq('poll_id', pollId)
        .eq('poll_option_id', option.id)
        .order('submitted_at', { ascending: true });

      if (error) {
        console.error(`Vote count error for option ${option.id}:`, error);
        return {
          option_id: option.id,
          option_text: option.option_text,
          vote_count: 0,
          percentage: 0,
          voters: [],
        };
      }

      return {
        option_id: option.id,
        option_text: option.option_text,
        vote_count: count || 0,
        percentage: 0, // Will calculate after getting total
        voters: votes || [],
      };
    });

    const results = await Promise.all(resultsPromises);

    // Calculate total votes
    const totalVotes = results.reduce((sum, result) => sum + result.vote_count, 0);

    // Calculate percentages
    const resultsWithPercentages = results.map((result) => ({
      ...result,
      percentage: totalVotes > 0 ? Math.round((result.vote_count / totalVotes) * 100) : 0,
    }));

    // Return aggregated results
    return NextResponse.json({
      poll_id: pollId,
      total_votes: totalVotes,
      results: resultsWithPercentages,
    });
  } catch (error) {
    console.error('Unexpected error in GET /api/polls/[pollId]/results:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
