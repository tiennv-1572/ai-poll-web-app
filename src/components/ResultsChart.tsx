'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';
import PieChart from './PieChart';

interface ResultData {
  option_id: string;
  option_text: string;
  vote_count: number;
  percentage: number;
  voters: Array<{
    voter_name: string;
    voter_email: string;
    submitted_at: string;
  }>;
}

interface ResultsData {
  poll_id: string;
  total_votes: number;
  results: ResultData[];
}

interface ResultsChartProps {
  pollId: string;
  enableRealtime: boolean;
}

export default function ResultsChart({ pollId, enableRealtime }: ResultsChartProps) {
  const [resultsData, setResultsData] = useState<ResultsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchResults = async () => {
    try {
      setError(null);
      const response = await fetch(`/api/polls/${pollId}/results`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch results');
      }

      const data: ResultsData = await response.json();
      setResultsData(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, [pollId]);

  // Set up real-time subscription if enabled
  useEffect(() => {
    if (!enableRealtime) return;

    const supabase = createBrowserClient();

    // Subscribe to votes table changes for this poll
    const channel = supabase
      .channel(`poll-${pollId}-results`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'votes',
          filter: `poll_id=eq.${pollId}`,
        },
        (payload) => {
          console.log('New vote received:', payload);
          // Refetch results when a new vote is inserted
          fetchResults();
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [pollId, enableRealtime]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        <p className="font-semibold">Error loading results</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  if (!resultsData) {
    return (
      <div className="bg-gray-50 border border-gray-200 text-gray-700 px-4 py-3 rounded-lg">
        No results available
      </div>
    );
  }

  const { total_votes, results } = resultsData;

  // Prepare data for pie chart
  const pieChartData = results.map((result) => ({
    option_id: result.option_id,
    option_text: result.option_text,
    percentage: result.percentage,
    vote_count: result.vote_count,
  }));

  return (
    <div className="space-y-8">
      {/* Total Votes */}
      <div className="text-center">
        <p className="text-sm text-primary-600 mb-1">Total Votes</p>
        <p className="text-4xl font-bold text-primary-900">{total_votes}</p>
        {enableRealtime && (
          <p className="text-xs text-primary-500 mt-1">● Updating in real-time</p>
        )}
      </div>

      {/* Results Bar Chart */}
      <div className="space-y-4">
        {results.length === 0 ? (
          <div className="text-center text-primary-600 py-8">
            No votes have been cast yet
          </div>
        ) : (
          results.map((result) => (
            <div key={result.option_id} className="space-y-2">
              {/* Option Text and Stats */}
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium text-primary-900">{result.option_text}</span>
                <span className="text-primary-600">
                  {result.vote_count} vote{result.vote_count !== 1 ? 's' : ''} ({result.percentage}%)
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-primary-100 rounded-full h-8 overflow-hidden">
                <div
                  className="bg-primary-600 h-full rounded-full transition-all duration-500 ease-out flex items-center justify-end pr-3"
                  style={{ width: `${result.percentage}%` }}
                >
                  {result.percentage > 10 && (
                    <span className="text-xs font-semibold text-white">{result.percentage}%</span>
                  )}
                </div>
              </div>

              {/* Voters List */}
              {result.voters.length > 0 && (
                <div className="mt-2 pl-2 space-y-1">
                  <p className="text-xs font-semibold text-primary-700 mb-1">Voted by:</p>
                  <div className="space-y-1">
                    {result.voters.map((voter, idx) => (
                      <div key={idx} className="text-xs text-primary-600 flex items-center gap-2">
                        <span className="inline-block w-1.5 h-1.5 bg-primary-400 rounded-full"></span>
                        <span className="font-medium">{voter.voter_name}</span>
                        <span className="text-primary-400">({voter.voter_email})</span>
                        <span className="text-primary-400 text-[10px]">
                          {new Date(voter.submitted_at).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Pie Chart Visualization */}
      {total_votes > 0 && (
        <div className="bg-white rounded-lg p-6 border border-primary-200">
          <h3 className="text-lg font-semibold text-primary-900 mb-4 text-center">
            Vote Distribution
          </h3>
          <PieChart data={pieChartData} />
        </div>
      )}

      {/* Legend */}
      {total_votes === 0 && (
        <div className="text-center text-sm text-primary-600 bg-primary-50 border border-primary-200 rounded-lg p-4">
          Be the first to vote! Share the poll link with others to start collecting votes.
        </div>
      )}
    </div>
  );
}
