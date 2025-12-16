import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

interface RouteContext {
  params: Promise<{
    code: string;
  }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { code } = await context.params;

    // Validate code format (8 characters, alphanumeric)
    if (!code || code.length !== 8) {
      return NextResponse.json(
        { error: 'Invalid access code format. Code must be exactly 8 characters.' },
        { status: 400 }
      );
    }

    // Initialize Supabase client
    const supabase = await createServerClient();

    // Look up poll by access code (case-insensitive)
    const { data: poll, error: pollError } = await supabase
      .from('polls')
      .select('id, question, deadline')
      .ilike('access_code', code) // case-insensitive match
      .single();

    if (pollError || !poll) {
      return NextResponse.json(
        { error: 'Poll not found. Please check the access code and try again.' },
        { status: 404 }
      );
    }

    // Return poll ID for redirect
    return NextResponse.json({
      poll_id: poll.id,
      question: poll.question,
      deadline: poll.deadline,
    });
  } catch (error) {
    console.error('Unexpected error in GET /api/polls/by-code/[code]:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
