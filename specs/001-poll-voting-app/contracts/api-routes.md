# API Contracts

**Feature**: Poll Voting Web Application  
**Date**: December 16, 2025  
**Framework**: Next.js API Routes

This document defines the HTTP API contracts for the Poll Voting application. All routes are implemented as Next.js API route handlers under `src/app/api/`.

## Overview

| Endpoint | Method | Purpose | Authentication |
|----------|--------|---------|----------------|
| `/api/polls` | POST | Create new poll | None (name + email) |
| `/api/polls/[pollId]` | GET | Get poll details | None |
| `/api/polls/by-code/[code]` | GET | Get poll by access code | None |
| `/api/votes` | POST | Submit vote | None (name + email) |
| `/api/polls/[pollId]/results` | GET | Get poll results | None (visibility rules apply) |

---

## POST /api/polls

Create a new poll with question, options, and configuration.

### Request Body

```typescript
{
  creatorName: string       // 1-255 chars, required
  creatorEmail: string      // Valid email format, required
  question: string          // Min 5 chars, required
  options: string[]         // Min 2 items, max 500 chars each
  deadline: string          // ISO 8601 datetime, must be future
  showRealtimeResults: boolean  // Optional, default true
}
```

**Example**:
```json
{
  "creatorName": "John Doe",
  "creatorEmail": "john@example.com",
  "question": "What time works best for our team meeting?",
  "options": [
    "9:00 AM - 10:00 AM",
    "2:00 PM - 3:00 PM",
    "5:00 PM - 6:00 PM"
  ],
  "deadline": "2025-12-20T17:00:00Z",
  "showRealtimeResults": true
}
```

### Response (201 Created)

```typescript
{
  pollId: string           // UUID of created poll
  accessCode: string       // 8-character access code
  shareUrl: string         // Full URL to poll
  createdAt: string        // ISO 8601 datetime
}
```

**Example**:
```json
{
  "pollId": "550e8400-e29b-41d4-a716-446655440000",
  "accessCode": "MEET2024",
  "shareUrl": "https://poll-voting.app/poll/550e8400-e29b-41d4-a716-446655440000",
  "createdAt": "2025-12-16T10:30:00Z"
}
```

### Error Responses

**400 Bad Request** - Validation error:
```json
{
  "error": "Validation failed",
  "details": {
    "question": "Question must be at least 5 characters",
    "options": "At least 2 options are required"
  }
}
```

**500 Internal Server Error**:
```json
{
  "error": "Failed to create poll",
  "message": "Database error"
}
```

### Validation Rules (Zod Schema)

```typescript
const createPollSchema = z.object({
  creatorName: z.string().min(1, 'Name is required').max(255),
  creatorEmail: z.string().email('Valid email required'),
  question: z.string().min(5, 'Question must be at least 5 characters'),
  options: z.array(z.string().max(500)).min(2, 'At least 2 options required'),
  deadline: z.string().datetime().refine(
    (date) => new Date(date) > new Date(),
    'Deadline must be in the future'
  ),
  showRealtimeResults: z.boolean().default(true)
})
```

---

## GET /api/polls/[pollId]

Retrieve poll details including question, options, and metadata.

### Path Parameters

- `pollId`: UUID of the poll

### Query Parameters

None

### Response (200 OK)

```typescript
{
  id: string
  creatorName: string
  creatorEmail: string       // Only returned to creator (TBD - may remove)
  question: string
  deadline: string           // ISO 8601
  showRealtimeResults: boolean
  accessCode: string
  createdAt: string
  options: Array<{
    id: string
    text: string
    displayOrder: number
  }>
  hasVoted?: boolean         // If voter email provided in header
  isClosed: boolean          // True if past deadline
}
```

**Example**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "creatorName": "John Doe",
  "question": "What time works best for our team meeting?",
  "deadline": "2025-12-20T17:00:00Z",
  "showRealtimeResults": true,
  "accessCode": "MEET2024",
  "createdAt": "2025-12-16T10:30:00Z",
  "options": [
    {
      "id": "opt-001",
      "text": "9:00 AM - 10:00 AM",
      "displayOrder": 0
    },
    {
      "id": "opt-002",
      "text": "2:00 PM - 3:00 PM",
      "displayOrder": 1
    },
    {
      "id": "opt-003",
      "text": "5:00 PM - 6:00 PM",
      "displayOrder": 2
    }
  ],
  "isClosed": false
}
```

### Error Responses

**404 Not Found**:
```json
{
  "error": "Poll not found"
}
```

---

## GET /api/polls/by-code/[code]

Retrieve poll ID by access code (for code-based access flow).

### Path Parameters

- `code`: 8-character access code

### Response (200 OK)

```typescript
{
  pollId: string
  redirectUrl: string
}
```

**Example**:
```json
{
  "pollId": "550e8400-e29b-41d4-a716-446655440000",
  "redirectUrl": "/poll/550e8400-e29b-41d4-a716-446655440000"
}
```

### Error Responses

**404 Not Found**:
```json
{
  "error": "Poll not found",
  "message": "Please check the code and try again"
}
```

---

## POST /api/votes

Submit a vote for a poll option.

### Request Body

```typescript
{
  pollId: string           // UUID of poll
  optionId: string         // UUID of selected option
  voterName: string        // 1-255 chars
  voterEmail: string       // Valid email
}
```

**Example**:
```json
{
  "pollId": "550e8400-e29b-41d4-a716-446655440000",
  "optionId": "opt-002",
  "voterName": "Jane Smith",
  "voterEmail": "jane@example.com"
}
```

### Response (201 Created)

```typescript
{
  voteId: string
  submittedAt: string      // ISO 8601
  message: string
}
```

**Example**:
```json
{
  "voteId": "vote-123",
  "submittedAt": "2025-12-16T14:30:00Z",
  "message": "Your vote has been recorded"
}
```

### Error Responses

**400 Bad Request** - Validation error:
```json
{
  "error": "Validation failed",
  "details": {
    "voterEmail": "Valid email required"
  }
}
```

**409 Conflict** - Already voted:
```json
{
  "error": "Duplicate vote",
  "message": "You have already voted on this poll"
}
```

**410 Gone** - Poll closed:
```json
{
  "error": "Voting closed",
  "message": "Voting has closed for this poll"
}
```

**404 Not Found** - Invalid poll or option:
```json
{
  "error": "Invalid poll or option"
}
```

### Validation Rules (Zod Schema)

```typescript
const submitVoteSchema = z.object({
  pollId: z.string().uuid(),
  optionId: z.string().uuid(),
  voterName: z.string().min(1, 'Name is required').max(255),
  voterEmail: z.string().email('Valid email required')
})
```

---

## GET /api/polls/[pollId]/results

Retrieve aggregated voting results for a poll.

### Path Parameters

- `pollId`: UUID of the poll

### Response (200 OK)

```typescript
{
  pollId: string
  question: string
  totalVotes: number
  isClosed: boolean
  results: Array<{
    optionId: string
    optionText: string
    voteCount: number
    percentage: number       // 0-100, rounded to 2 decimals
  }>
  lastUpdated: string        // ISO 8601
}
```

**Example**:
```json
{
  "pollId": "550e8400-e29b-41d4-a716-446655440000",
  "question": "What time works best for our team meeting?",
  "totalVotes": 15,
  "isClosed": false,
  "results": [
    {
      "optionId": "opt-001",
      "optionText": "9:00 AM - 10:00 AM",
      "voteCount": 7,
      "percentage": 46.67
    },
    {
      "optionId": "opt-002",
      "optionText": "2:00 PM - 3:00 PM",
      "voteCount": 5,
      "percentage": 33.33
    },
    {
      "optionId": "opt-003",
      "optionText": "5:00 PM - 6:00 PM",
      "voteCount": 3,
      "percentage": 20.00
    }
  ],
  "lastUpdated": "2025-12-16T14:30:00Z"
}
```

### Error Responses

**403 Forbidden** - Results hidden until poll closes:
```json
{
  "error": "Results not available",
  "message": "Results will be available after voting closes",
  "deadline": "2025-12-20T17:00:00Z"
}
```

**404 Not Found**:
```json
{
  "error": "Poll not found"
}
```

### Visibility Rules

Results are visible when:
1. Poll is configured with `showRealtimeResults: true`, OR
2. Current time is past the poll deadline

---

## Real-time Updates (Supabase Realtime)

For live result updates on the results page, clients subscribe to Supabase Realtime channels instead of polling the API.

### Channel Subscription

```typescript
const channel = supabase
  .channel(`poll:${pollId}`)
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'votes',
      filter: `poll_id=eq.${pollId}`
    },
    (payload) => {
      // Refresh results display
    }
  )
  .subscribe()
```

### Event Payload

```typescript
{
  eventType: 'INSERT',
  new: {
    id: string,
    poll_id: string,
    poll_option_id: string,
    voter_name: string,
    voter_email: string,  // Obfuscated: "j***@example.com"
    submitted_at: string
  },
  old: null,
  errors: null
}
```

**Note**: Voter email is obfuscated in real-time events for privacy.

---

## Common Response Headers

All API responses include:

```
Content-Type: application/json
Cache-Control: no-store (for dynamic data)
X-Poll-Version: 1.0
```

---

## Rate Limiting (Future Enhancement)

Not implemented in initial version. Future implementation should limit:
- Poll creation: 10 polls per IP per hour
- Vote submission: 1 vote per poll per email (enforced by database)
- Results fetching: 100 requests per minute per IP

---

## Error Response Format

All errors follow this structure:

```typescript
{
  error: string          // Error type/category
  message?: string       // Human-readable message
  details?: object       // Validation details (optional)
  code?: string          // Error code (optional)
}
```

---

## Implementation Notes

1. **Validation**: Use Zod for all request validation (shared client/server)
2. **Error Handling**: Consistent error responses across all endpoints
3. **Logging**: Log all API requests with anonymized voter info
4. **CORS**: Configure for production domain
5. **Type Safety**: Generate OpenAPI spec from Zod schemas for documentation
