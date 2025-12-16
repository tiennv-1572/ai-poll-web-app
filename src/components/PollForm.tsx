'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { createPollSchema } from '@/lib/validations';
import type { z } from 'zod';

type PollFormData = z.infer<typeof createPollSchema>;

export default function PollForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<Partial<PollFormData>>({
    creator_name: '',
    creator_email: '',
    question: '',
    options: ['', ''],
    deadline: '',
    show_realtime_results: true,
  });

  const handleAddOption = () => {
    setFormData((prev) => ({
      ...prev,
      options: [...(prev.options || []), ''],
    }));
  };

  const handleRemoveOption = (index: number) => {
    if ((formData.options?.length || 0) <= 2) return; // Minimum 2 options
    setFormData((prev) => ({
      ...prev,
      options: prev.options?.filter((_, i) => i !== index) || [],
    }));
  };

  const handleOptionChange = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      options: prev.options?.map((opt, i) => (i === index ? value : opt)) || [],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    try {
      // Client-side validation using Zod
      const validatedData = createPollSchema.parse(formData);

      // Submit to API
      const response = await fetch('/api/polls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validatedData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create poll');
      }

      const result = await response.json();

      // Redirect to success page with poll data
      router.push(
        `/create/success?pollId=${result.poll.id}&code=${result.poll.access_code}`
      );
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Creator Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-primary-900">Your Information</h3>

        <Input
          label="Your Name"
          type="text"
          value={formData.creator_name || ''}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, creator_name: e.target.value }))
          }
          error={errors.creator_name}
          required
          placeholder="John Doe"
        />

        <Input
          label="Your Email"
          type="email"
          value={formData.creator_email || ''}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, creator_email: e.target.value }))
          }
          error={errors.creator_email}
          required
          placeholder="john@example.com"
        />
      </div>

      {/* Poll Question */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-primary-900">Poll Details</h3>

        <Input
          label="Question"
          type="text"
          value={formData.question || ''}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, question: e.target.value }))
          }
          error={errors.question}
          required
          placeholder="What's your favorite programming language?"
        />
      </div>

      {/* Poll Options */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-primary-900">Options</h3>
          <Button
            type="button"
            variant="outline"
            onClick={handleAddOption}
            className="text-sm"
          >
            + Add Option
          </Button>
        </div>

        {formData.options?.map((option, index) => (
          <div key={index} className="flex gap-2">
            <Input
              label={`Option ${index + 1}`}
              type="text"
              value={option}
              onChange={(e) => handleOptionChange(index, e.target.value)}
              error={errors[`options.${index}`]}
              required
              placeholder={`Option ${index + 1}`}
            />
            {(formData.options?.length || 0) > 2 && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => handleRemoveOption(index)}
                className="mt-6 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                Remove
              </Button>
            )}
          </div>
        ))}
        {errors.options && (
          <p className="text-sm text-red-600">{errors.options}</p>
        )}
      </div>

      {/* Deadline */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-primary-900">Settings</h3>

        <Input
          label="Voting Deadline"
          type="datetime-local"
          value={formData.deadline || ''}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, deadline: e.target.value }))
          }
          error={errors.deadline}
          required
        />
      </div>

      {/* Result Visibility */}
      <div className="flex items-start space-x-3">
        <input
          type="checkbox"
          id="show_realtime_results"
          checked={formData.show_realtime_results || false}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              show_realtime_results: e.target.checked,
            }))
          }
          className="mt-1 h-4 w-4 text-primary-600 border-primary-300 rounded focus:ring-primary-500"
        />
        <label
          htmlFor="show_realtime_results"
          className="text-sm text-primary-700"
        >
          <span className="font-medium">Show real-time results</span>
          <p className="text-primary-600">
            Allow voters to see results immediately. If unchecked, results will only be visible
            after the deadline.
          </p>
        </label>
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
        {isSubmitting ? 'Creating Poll...' : 'Create Poll'}
      </Button>
    </form>
  );
}
