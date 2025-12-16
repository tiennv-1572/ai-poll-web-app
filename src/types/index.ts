export interface Poll {
  id: string
  createdAt: string
  updatedAt: string
  creatorName: string
  creatorEmail: string
  question: string
  deadline: string
  showRealtimeResults: boolean
  accessCode: string
}

export interface PollOption {
  id: string
  pollId: string
  optionText: string
  displayOrder: number
  createdAt: string
}

export interface Vote {
  id: string
  pollId: string
  pollOptionId: string
  voterName: string
  voterEmail: string
  submittedAt: string
}

export interface PollResult {
  optionId: string
  optionText: string
  voteCount: number
  percentage: number
}

export interface PollWithOptions extends Poll {
  options: PollOption[]
}
