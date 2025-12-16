'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default function JoinPage() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Auto-uppercase and limit to 8 characters
    const value = e.target.value.toUpperCase().slice(0, 8);
    setCode(value);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (code.length !== 8) {
      setError('Access code must be exactly 8 characters');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/polls/by-code/${code}`);

      if (!response.ok) {
        if (response.status === 404) {
          setError('Poll not found. Please check the access code and try again.');
        } else {
          const errorData = await response.json();
          setError(errorData.error || 'Failed to find poll');
        }
        return;
      }

      const data = await response.json();

      // Redirect to the poll page
      router.push(`/poll/${data.poll_id}`);
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 py-8 px-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold text-primary-900">Join a Poll</h1>
          <p className="text-primary-700">
            Enter the 8-character access code to participate in a poll
          </p>
        </div>

        {/* Code Entry Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>🔑</span>
              <span>Enter Access Code</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Access Code"
                type="text"
                value={code}
                onChange={handleCodeChange}
                placeholder="ABCD1234"
                maxLength={8}
                required
                error={error || undefined}
                className="text-center text-2xl font-mono tracking-wider uppercase"
                autoFocus
              />

              <Button
                type="submit"
                variant="primary"
                disabled={isLoading || code.length !== 8}
                className="w-full"
              >
                {isLoading ? 'Finding Poll...' : 'Join Poll'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Help Section */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-3 text-sm text-primary-700">
              <p className="font-semibold text-primary-900">Where do I find the access code?</p>
              <ul className="space-y-2 list-disc list-inside">
                <li>The poll creator should have shared an 8-character code with you</li>
                <li>The code is case-insensitive (ABC123 and abc123 are the same)</li>
                <li>Make sure to enter all 8 characters</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Back to Home */}
        <div className="text-center">
          <Link href="/" className="text-primary-600 hover:text-primary-700 text-sm">
            ← Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
