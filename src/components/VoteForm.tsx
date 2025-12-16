'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { submitVoteSchema } from '@/lib/validations';
import type { PollOption } from '@/types';
import type { z } from 'zod';

interface VoteFormProps {
  pollId: string;
  options: PollOption[];
  showRealtimeResults: boolean;
}

export default function VoteForm({ pollId, options, showRealtimeResults }: VoteFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showConfirmation, setShowConfirmation] = useState(false);

  const [formData, setFormData] = useState({
    voter_name: '',
    voter_email: '',
    poll_option_id: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    try {
      // Client-side validation using Zod
      const validatedData = submitVoteSchema.parse({
        ...formData,
        poll_id: pollId,
      });

      // Submit to API
      const response = await fetch('/api/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validatedData),
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          setErrors({ submit: 'You have already voted in this poll.' });
        } else if (response.status === 410) {
          setErrors({ submit: 'Voting has closed for this poll.' });
        } else {
          setErrors({ submit: result.error || 'Failed to submit vote. Please try again.' });
        }
        return;
      }

      // Show confirmation
      setShowConfirmation(true);

      // Redirect after 2 seconds
      setTimeout(() => {
        if (showRealtimeResults) {
          router.push(`/poll/${pollId}/results`);
        } else {
          router.push('/');
        }
      }, 2000);
    } catch (error: unknown) {
      if (error instanceof Error && 'issues' in error) {
        // Zod validation error
        const zodError = error as z.ZodError;
        const fieldErrors: Record<string, string> = {};
        zodError.issues.forEach((issue) => {
          const path = issue.path.join('.');
          fieldErrors[path] = issue.message;
        });
        setErrors(fieldErrors);
      } else if (error instanceof Error) {
        setErrors({ submit: error.message });
      } else {
        setErrors({ submit: 'An unexpected error occurred' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showConfirmation) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center space-y-3">
        <div className="text-5xl">✅</div>
        <h2 className="text-xl font-semibold text-green-900">Your vote has been recorded!</h2>
        <p className="text-green-700">
          {showRealtimeResults
            ? 'Redirecting to results...'
            : 'Thank you for voting. Results will be available after the deadline.'}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Voter Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-primary-900">Your Information</h3>

        <Input
          label="Your Name"
          type="text"
          value={formData.voter_name}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, voter_name: e.target.value }))
          }
          error={errors.voter_name}
          required
          placeholder="John Doe"
        />

        <Input
          label="Your Email"
          type="email"
          value={formData.voter_email}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, voter_email: e.target.value }))
          }
          error={errors.voter_email}
          required
          placeholder="john@example.com"
          helpText="One vote per email address"
        />
      </div>

      {/* Poll Options */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-primary-900">Your Choice</h3>

        <div className="space-y-3">
          {options.map((option) => (
            <label
              key={option.id}
              className={`
                flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all
                ${
                  formData.poll_option_id === option.id
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-primary-200 hover:border-primary-300 hover:bg-primary-50'
                }
              `}
            >
              <input
                type="radio"
                name="poll_option"
                value={option.id}
                checked={formData.poll_option_id === option.id}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, poll_option_id: e.target.value }))
                }
                className="h-5 w-5 text-primary-600 border-primary-300 focus:ring-primary-500"
                required
              />
              <span className="text-primary-900 font-medium">{option.option_text}</span>
            </label>
          ))}
        </div>
        {errors.poll_option_id && (
          <p className="text-sm text-red-600">{errors.poll_option_id}</p>
        )}
      </div>

      {/* Submit Error */}
      {errors.submit && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {errors.submit}
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        variant="primary"
        disabled={isSubmitting}
        className="w-full"
      >
        {isSubmitting ? 'Submitting Vote...' : 'Submit Vote'}
      </Button>
    </form>
  );
}
