import { notFound } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/Card';
import PollHeader from '@/components/PollHeader';
import VoteForm from '@/components/VoteForm';
import type { Poll, PollOption } from '@/types';

interface PollPageProps {
  params: Promise<{
    pollId: string;
  }>;
}

async function getPollWithOptions(pollId: string): Promise<{
  poll: Poll;
  options: PollOption[];
} | null> {
  const supabase = await createServerClient();

  const { data: poll, error: pollError } = await supabase
    .from('polls')
    .select('*')
    .eq('id', pollId)
    .single();

  if (pollError || !poll) {
    console.error('Poll fetch error:', pollError);
    return null;
  }

  const { data: options, error: optionsError } = await supabase
    .from('poll_options')
    .select('*')
    .eq('poll_id', pollId)
    .order('display_order', { ascending: true });

  if (optionsError || !options) {
    console.error('Options fetch error:', optionsError);
    return null;
  }

  return { poll, options };
}

export default async function PollPage({ params }: PollPageProps) {
  const { pollId } = await params;

  const data = await getPollWithOptions(pollId);

  if (!data) {
    notFound();
  }

  const { poll, options } = data;
  const isExpired = new Date(poll.deadline) < new Date();

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <Card>
          <CardContent className="pt-6 space-y-6">
            <PollHeader
              question={poll.question}
              creatorName={poll.creator_name}
              deadline={poll.deadline}
              showRealtimeResults={poll.show_realtime_results}
              isExpired={isExpired}
            />

            {isExpired ? (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg">
                <p className="font-semibold">Voting has closed</p>
                <p className="text-sm">
                  This poll ended on {new Date(poll.deadline).toLocaleString()}. You can no longer submit votes.
                </p>
              </div>
            ) : (
              <VoteForm pollId={poll.id} options={options} showRealtimeResults={poll.show_realtime_results} />
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
