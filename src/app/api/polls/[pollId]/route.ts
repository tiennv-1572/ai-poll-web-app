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
      .select('*')
      .eq('id', pollId)
      .single();

    if (pollError || !poll) {
      return NextResponse.json({ error: 'Poll not found' }, { status: 404 });
    }

    // Fetch poll options
    const { data: options, error: optionsError } = await supabase
      .from('poll_options')
      .select('*')
      .eq('poll_id', pollId)
      .order('display_order', { ascending: true });

    if (optionsError) {
      console.error('Options fetch error:', optionsError);
      return NextResponse.json(
        { error: 'Failed to fetch poll options' },
        { status: 500 }
      );
    }

    // Return poll data
    return NextResponse.json({
      poll,
      options,
    });
  } catch (error) {
    console.error('Unexpected error in GET /api/polls/[pollId]:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
