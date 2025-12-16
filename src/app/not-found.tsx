import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="text-8xl">🔍</div>
        <h1 className="text-4xl font-bold text-primary-900">404 - Not Found</h1>
        <p className="text-lg text-primary-700">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="space-y-3">
          <Link href="/">
            <Button variant="primary" className="w-full">
              Go to Homepage
            </Button>
          </Link>
          <Link href="/create">
            <Button variant="outline" className="w-full">
              Create a Poll
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
