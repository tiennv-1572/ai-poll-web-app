import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import PollForm from '@/components/PollForm';

export default function CreatePollPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-primary-900 mb-2">
            Create a New Poll
          </h1>
          <p className="text-primary-700">
            Set up your poll with custom options and settings. Share the link or access code with voters.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Poll Details</CardTitle>
          </CardHeader>
          <CardContent>
            <PollForm />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
