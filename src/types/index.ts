export interface Poll {
  id: string
  created_at: string
  updated_at: string
  creator_name: string
  creator_email: string
  question: string
  deadline: string
  show_realtime_results: boolean
  access_code: string
}

export interface PollOption {
  id: string
  poll_id: string
  option_text: string
  display_order: number
  created_at: string
}

export interface Vote {
  id: string
  poll_id: string
  poll_option_id: string
  voter_name: string
  voter_email: string
  submitted_at: string
}

export interface PollResult {
  option_id: string
  option_text: string
  vote_count: number
  percentage: number
}

export interface PollWithOptions extends Poll {
  options: PollOption[]
}
