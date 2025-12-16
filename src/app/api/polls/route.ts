import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { createPollSchema } from '@/lib/validations';
import { nanoid } from 'nanoid';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body using Zod schema
    const validationResult = createPollSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          issues: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const { creator_name, creator_email, question, options, deadline, show_realtime_results } =
      validationResult.data;

    // Initialize Supabase client
    const supabase = await createServerClient();

    // Generate unique 8-character access code
    let accessCode = nanoid(8).toUpperCase();
    let isUnique = false;
    let attempts = 0;

    // Ensure access code is unique (retry up to 5 times if collision)
    while (!isUnique && attempts < 5) {
      const { data: existing } = await supabase
        .from('polls')
        .select('id')
        .eq('access_code', accessCode)
        .single();

      if (!existing) {
        isUnique = true;
      } else {
        accessCode = nanoid(8).toUpperCase();
        attempts++;
      }
    }

    if (!isUnique) {
      return NextResponse.json(
        { error: 'Failed to generate unique access code. Please try again.' },
        { status: 500 }
      );
    }

    // Insert poll into database
    const { data: poll, error: pollError } = await supabase
      .from('polls')
      .insert({
        creator_name,
        creator_email,
        question,
        deadline,
        show_realtime_results,
        access_code: accessCode,
      })
      .select()
      .single();

    if (pollError) {
      console.error('Poll creation error:', pollError);
      return NextResponse.json(
        { error: 'Failed to create poll. Please try again.' },
        { status: 500 }
      );
    }

    // Insert poll options
    const optionsData = options.map((option_text, index) => ({
      poll_id: poll.id,
      option_text,
      display_order: index,
    }));

    const { error: optionsError } = await supabase
      .from('poll_options')
      .insert(optionsData);

    if (optionsError) {
      console.error('Options creation error:', optionsError);
      // Rollback: delete the poll if options fail
      await supabase.from('polls').delete().eq('id', poll.id);
      return NextResponse.json(
        { error: 'Failed to create poll options. Please try again.' },
        { status: 500 }
      );
    }

    // Return success response with poll data
    return NextResponse.json(
      {
        success: true,
        poll: {
          id: poll.id,
          access_code: poll.access_code,
          question: poll.question,
          deadline: poll.deadline,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Unexpected error in POST /api/polls:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
