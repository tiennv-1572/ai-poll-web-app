'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

function SuccessContent() {
  const searchParams = useSearchParams();
  const pollId = searchParams.get('pollId');
  const code = searchParams.get('code');

  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [pollUrl, setPollUrl] = useState('');
  const [joinUrl, setJoinUrl] = useState('');

  useEffect(() => {
    if (pollId && typeof window !== 'undefined') {
      setPollUrl(`${window.location.origin}/poll/${pollId}`);
      setJoinUrl(`${window.location.origin}/join`);
    }
  }, [pollId]);

  if (!pollId || !code) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <p className="text-red-600">Missing poll information. Please try creating a poll again.</p>
            <Link href="/create">
              <Button variant="primary" className="w-full mt-4">
                Create New Poll
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(pollUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch (error) {
      console.error('Failed to copy code:', error);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Success Message */}
        <div className="text-center space-y-2">
          <div className="text-6xl">✅</div>
          <h1 className="text-3xl md:text-4xl font-bold text-primary-900">
            Poll Created Successfully!
          </h1>
          <p className="text-primary-700">
            Your poll is ready. Share the link or access code with voters.
          </p>
        </div>

        {/* Poll Link */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>🔗</span>
              <span>Poll Link</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-3 break-all font-mono text-sm text-primary-800">
              {pollUrl}
            </div>
            <Button
              onClick={handleCopyLink}
              variant={copiedLink ? 'secondary' : 'primary'}
              className="w-full"
            >
              {copiedLink ? '✓ Copied!' : 'Copy Link'}
            </Button>
          </CardContent>
        </Card>

        {/* Access Code */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>🔑</span>
              <span>Access Code</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-center">
              <Badge variant="primary" className="text-2xl font-mono px-6 py-3">
                {code}
              </Badge>
            </div>
            <p className="text-center text-sm text-primary-600">
              Voters can use this 8-character code at{' '}
              <span className="font-semibold">{joinUrl}</span>
            </p>
            <Button
              onClick={handleCopyCode}
              variant={copiedCode ? 'secondary' : 'outline'}
              className="w-full"
            >
              {copiedCode ? '✓ Copied!' : 'Copy Code'}
            </Button>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card>
          <CardHeader>
            <CardTitle>Next Steps</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <ul className="space-y-2 text-primary-700">
              <li className="flex items-start gap-2">
                <span className="text-primary-500 mt-1">1.</span>
                <span>Share the poll link or access code with your voters</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-500 mt-1">2.</span>
                <span>Track votes and view results in real-time</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-500 mt-1">3.</span>
                <span>Results will be finalized after the voting deadline</span>
              </li>
            </ul>

            <div className="pt-4 space-y-2">
              <Link href={`/poll/${pollId}`}>
                <Button variant="primary" className="w-full">
                  View Poll
                </Button>
              </Link>
              <Link href={`/poll/${pollId}/results`}>
                <Button variant="outline" className="w-full">
                  View Results
                </Button>
              </Link>
              <Link href="/create">
                <Button variant="ghost" className="w-full">
                  Create Another Poll
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center">
          <div className="text-primary-600">Loading...</div>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
