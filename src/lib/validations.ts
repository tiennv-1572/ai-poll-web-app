import { z } from 'zod'

export const createPollSchema = z.object({
  creator_name: z.string().min(1, 'Name is required').max(255),
  creator_email: z.string().email('Valid email required'),
  question: z.string().min(5, 'Question must be at least 5 characters'),
  options: z.array(z.string().min(1, 'Option cannot be empty').max(500)).min(2, 'At least 2 options required'),
  deadline: z.string().refine(
    (date) => {
      // datetime-local input returns format: "2025-12-19T07:03"
      // Convert to ISO datetime by appending seconds and timezone
      const isoDate = date.includes('T') ? `${date}:00` : date;
      return new Date(isoDate) > new Date();
    },
    'Deadline must be in the future'
  ),
  show_realtime_results: z.boolean().default(true),
})

export const submitVoteSchema = z.object({
  poll_id: z.string().uuid(),
  poll_option_id: z.string().uuid(),
  voter_name: z.string().min(1, 'Name is required').max(255),
  voter_email: z.string().email('Valid email required'),
})

export type CreatePollInput = z.infer<typeof createPollSchema>
export type SubmitVoteInput = z.infer<typeof submitVoteSchema>
