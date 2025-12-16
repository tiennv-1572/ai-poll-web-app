import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-900">
            Poll Voting
          </h1>
          <p className="text-lg md:text-xl text-primary-700 max-w-2xl mx-auto">
            Create polls, gather votes, and view real-time results. Simple, fast, and collaborative.
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Create Poll Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-2xl text-primary-900">Create a Poll</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-primary-700">
                Set up a new poll with custom options, deadline, and result visibility settings.
              </p>
              <Link href="/create">
                <Button variant="primary" className="w-full">
                  Create New Poll
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Join Poll Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-2xl text-primary-900">Join a Poll</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-primary-700">
                Enter an 8-character access code to participate in an existing poll.
              </p>
              <Link href="/join">
                <Button variant="secondary" className="w-full">
                  Join with Code
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <div className="grid sm:grid-cols-3 gap-4 pt-8">
          <div className="text-center space-y-2">
            <div className="text-3xl">🗳️</div>
            <h3 className="font-semibold text-primary-900">Easy Voting</h3>
            <p className="text-sm text-primary-600">One vote per email address</p>
          </div>
          <div className="text-center space-y-2">
            <div className="text-3xl">⏰</div>
            <h3 className="font-semibold text-primary-900">Set Deadlines</h3>
            <p className="text-sm text-primary-600">Automatically close polls at your chosen time</p>
          </div>
          <div className="text-center space-y-2">
            <div className="text-3xl">📊</div>
            <h3 className="font-semibold text-primary-900">Real-time Results</h3>
            <p className="text-sm text-primary-600">Live updates as votes come in</p>
          </div>
        </div>
      </div>
    </main>
  );
}
