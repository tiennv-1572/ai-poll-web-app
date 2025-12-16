import { notFound, redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/Card';
import PollHeader from '@/components/PollHeader';
import ResultsChart from '@/components/ResultsChart';
import type { Poll } from '@/types';

interface ResultsPageProps {
  params: Promise<{
    pollId: string;
  }>;
}

async function getPoll(pollId: string): Promise<Poll | null> {
  const supabase = await createServerClient();

  const { data: poll, error } = await supabase
    .from('polls')
    .select('*')
    .eq('id', pollId)
    .single();

  if (error || !poll) {
    console.error('Poll fetch error:', error);
    return null;
  }

  return poll;
}

export default async function ResultsPage({ params }: ResultsPageProps) {
  const { pollId } = await params;

  const poll = await getPoll(pollId);

  if (!poll) {
    notFound();
  }

  const isExpired = new Date(poll.deadline) < new Date();

  // Check if results should be hidden
  if (!poll.show_realtime_results && !isExpired) {
    // Results are hidden and poll is still open
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

              <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg">
                <p className="font-semibold">Results will be available after voting closes</p>
                <p className="text-sm">
                  This poll is configured to hide results until the deadline on{' '}
                  {new Date(poll.deadline).toLocaleString()}.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

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

            <ResultsChart pollId={pollId} enableRealtime={poll.show_realtime_results && !isExpired} />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
