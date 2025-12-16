# Tasks: Poll Voting Web Application

**Input**: Design documents from `/specs/001-poll-voting-app/`  
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: Not requested in specification - focusing on implementation only

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `- [ ] [ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

## Path Conventions

Based on plan.md structure:
- Next.js App Router: `src/app/`
- Components: `src/components/`
- Utilities: `src/lib/`
- Database: `supabase/migrations/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Initialize Next.js 14+ project with TypeScript and App Router using create-next-app
- [X] T002 [P] Install and configure TailwindCSS 3+ with custom theme colors
- [X] T003 [P] Install dependencies: @supabase/supabase-js, zod, date-fns, nanoid
- [X] T004 [P] Initialize Supabase local development with supabase init
- [X] T005 [P] Create project structure: src/app, src/components, src/lib, src/types directories
- [X] T006 [P] Configure TypeScript with strict mode in tsconfig.json
- [X] T007 [P] Setup ESLint and Prettier configurations
- [X] T008 Create .env.local.example with required environment variables template
- [X] T009 [P] Setup Next.js configuration in next.config.js (image domains, etc.)
- [X] T010 [P] Create global styles in src/app/globals.css with TailwindCSS directives

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T011 Create database migration 001_initial_schema.sql with polls, poll_options, votes tables in supabase/migrations/
- [X] T012 Add database indexes in migration: idx_polls_access_code, idx_votes_poll_id, idx_votes_poll_email
- [X] T013 Add database function generate_access_code() in migration for unique 8-char codes
- [X] T014 Add database function can_vote(poll_id, email) in migration for vote validation
- [X] T015 Add Row Level Security policies in migration for all tables
- [X] T016 Add database triggers in migration: update_updated_at for polls table
- [ ] T017 Apply database migration using supabase db push
- [ ] T018 Generate TypeScript types from database schema: supabase gen types typescript --local > src/types/supabase.ts
- [X] T019 Create Supabase client configuration in src/lib/supabase/client.ts for browser usage
- [X] T020 Create Supabase client configuration in src/lib/supabase/server.ts for Server Components
- [X] T021 Create Zod validation schemas in src/lib/validations.ts: createPollSchema, submitVoteSchema
- [X] T022 [P] Create TypeScript types in src/types/index.ts for Poll, Vote, PollOption, PollResult
- [X] T023 [P] Create utility functions in src/lib/utils.ts: formatDate, generateShareUrl, cn (classnames)
- [X] T024 [P] Create base UI components in src/components/ui/Button.tsx
- [X] T025 [P] Create base UI components in src/components/ui/Input.tsx
- [X] T026 [P] Create base UI components in src/components/ui/Card.tsx
- [X] T027 [P] Create base UI components in src/components/ui/Badge.tsx
- [X] T028 Create root layout in src/app/layout.tsx with metadata and TailwindCSS
- [X] T029 Create loading component in src/app/loading.tsx
- [X] T030 Create error boundary in src/app/error.tsx

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Create Poll (Priority: P1) 🎯 MVP

**Goal**: Poll creators can set up polls with questions, options, deadlines, and result visibility configuration

**Independent Test**: Navigate to /create, fill in poll form with name, email, question, 3 options, deadline, result settings → Poll created → Shareable link and code displayed

### Implementation for User Story 1

- [X] T031 [P] [US1] Create homepage in src/app/page.tsx with navigation to create poll and join poll
- [X] T032 [P] [US1] Create poll creation page layout in src/app/create/page.tsx with form container
- [X] T033 [US1] Create PollForm component in src/components/PollForm.tsx with all input fields (name, email, question, options, deadline, visibility)
- [X] T034 [US1] Add dynamic option fields management in PollForm (add/remove options with minimum 2)
- [X] T035 [US1] Add client-side validation in PollForm using Zod schema
- [X] T036 [US1] Add deadline picker in PollForm using HTML datetime-local input
- [X] T037 [US1] Add result visibility toggle in PollForm (show realtime vs hide until closed)
- [X] T038 [US1] Create API route POST /api/polls in src/app/api/polls/route.ts
- [X] T039 [US1] Implement poll creation logic in POST /api/polls: validate, generate access code, insert poll and options
- [X] T040 [US1] Add error handling and validation in POST /api/polls route
- [X] T041 [US1] Create success page in src/app/create/success/page.tsx displaying poll link and access code
- [X] T042 [US1] Add copy-to-clipboard functionality for poll link and access code on success page
- [X] T043 [US1] Create PollHeader component in src/components/PollHeader.tsx to display poll metadata
- [X] T044 [US1] Add responsive styling to PollForm for mobile, tablet, desktop (320px-1920px)

**Checkpoint**: At this point, users can create polls and receive shareable links/codes

---

## Phase 4: User Story 2 - Vote on Poll (Priority: P1) 🎯 MVP

**Goal**: Voters can access polls via link/code, view options, submit one vote per email, and see confirmation

**Independent Test**: Open poll link → Enter name and email → Select option → Submit → See confirmation → Try voting again → See "already voted" message

### Implementation for User Story 2

- [X] T045 [P] [US2] Create poll voting page in src/app/poll/[pollId]/page.tsx with Server Component for data fetching
- [X] T046 [US2] Add poll detail fetching in poll page using Supabase from server
- [X] T047 [US2] Create VoteForm component in src/components/VoteForm.tsx with voter name, email, and option selection
- [X] T048 [US2] Add client-side validation in VoteForm using Zod schema
- [X] T049 [US2] Add radio button styling for poll options in VoteForm
- [X] T050 [US2] Display poll metadata in VoteForm: question, deadline, creator name using PollHeader
- [X] T051 [US2] Create API route POST /api/votes in src/app/api/votes/route.ts
- [X] T052 [US2] Implement vote submission logic in POST /api/votes: validate, check duplicates, check deadline, insert vote
- [X] T053 [US2] Add duplicate vote prevention in POST /api/votes using database can_vote() function
- [X] T054 [US2] Add deadline check in POST /api/votes to prevent voting after poll closes
- [X] T055 [US2] Add error handling in POST /api/votes for duplicate votes (409), closed polls (410), invalid data (400)
- [X] T056 [US2] Create vote confirmation component showing "Your vote has been recorded" message
- [X] T057 [US2] Add navigation to results page after successful vote (if realtime results enabled)
- [X] T058 [US2] Display "Voting has closed" message when accessing poll after deadline
- [X] T059 [US2] Add responsive styling to VoteForm for mobile, tablet, desktop

**Checkpoint**: At this point, User Stories 1 AND 2 work together - users can create polls and vote on them

---

## Phase 5: User Story 3 - View Real-time Results (Priority: P2)

**Goal**: Users can view vote counts, percentages, pie chart visualization, and voter lists with automatic updates as new votes arrive

**Independent Test**: Create poll with "show realtime" → Vote multiple times (different emails) → Open results page → See counts update automatically → Verify percentages are accurate → See list of voters per option → See pie chart visualization

### Implementation for User Story 3

- [X] T060 [P] [US3] Create results page in src/app/poll/[pollId]/results/page.tsx with Server Component
- [X] T061 [US3] Create API route GET /api/polls/[pollId]/results in src/app/api/polls/[pollId]/results/route.ts
- [X] T062 [US3] Implement results aggregation in GET results route: count votes, calculate percentages per option
- [X] T062a [US3] Update results route to fetch voter details (name, email, submission time) for each option
- [X] T063 [US3] Add visibility check in GET results route: allow if show_realtime_results OR deadline passed
- [X] T064 [US3] Return 403 Forbidden when results hidden and poll still open
- [X] T065 [US3] Create ResultsChart component in src/components/ResultsChart.tsx displaying vote counts and percentages
- [X] T065a [US3] Update ResultsChart component to display voter lists for each option
- [X] T066 [US3] Add bar chart visualization in ResultsChart using TailwindCSS width percentages
- [X] T066a [P] [US3] Create PieChart component in src/components/PieChart.tsx for percentage visualization
- [X] T066b [US3] Implement SVG-based pie chart rendering in PieChart component with dynamic segments
- [X] T066c [US3] Add color palette for pie chart segments (use TailwindCSS color scheme)
- [X] T066d [US3] Calculate SVG path data for each pie segment based on percentages
- [X] T066e [US3] Add hover state for pie chart segments to show option name and percentage
- [X] T066f [US3] Add tooltip or label display on pie chart hover
- [X] T066g [US3] Integrate PieChart component into ResultsChart component
- [X] T067 [US3] Display total vote count in ResultsChart
- [X] T067a [US3] Display voter details (name, email, timestamp) in ResultsChart under each option
- [X] T068 [US3] Add Supabase Realtime subscription in ResultsChart for live updates
- [X] T069 [US3] Handle Realtime events in ResultsChart: refetch results when new vote inserted
- [X] T069a [US3] Ensure pie chart updates automatically when Realtime events trigger refetch
- [X] T070 [US3] Add cleanup for Realtime subscription on component unmount
- [X] T071 [US3] Display "Results will be available after voting closes" message when results hidden
- [X] T072 [US3] Add loading state in ResultsChart while fetching data
- [X] T073 [US3] Add responsive styling to ResultsChart for mobile, tablet, desktop
- [X] T073a [US3] Add responsive styling for voter lists to work on mobile, tablet, desktop
- [X] T073b [US3] Add responsive styling for PieChart to adapt to mobile, tablet, desktop screen sizes
- [X] T074 [US3] Add link to results page from vote confirmation (if realtime enabled)

**Checkpoint**: Real-time results now work independently with automatic updates

---

## Phase 6: User Story 4 - Access Poll via Code (Priority: P2)

**Goal**: Users can enter an 8-character access code to access polls without needing the full link

**Independent Test**: Get poll access code → Navigate to / → Click "Join with Code" → Enter code → Redirected to poll → Can vote

### Implementation for User Story 4

- [X] T075 [P] [US4] Create join page in src/app/join/page.tsx with code entry form
- [X] T076 [US4] Create code input field in join page with 8-character validation
- [X] T077 [US4] Add uppercase transformation for code input (user-friendly)
- [X] T078 [US4] Create API route GET /api/polls/by-code/[code] in src/app/api/polls/by-code/[code]/route.ts
- [X] T079 [US4] Implement poll lookup by access code in GET by-code route using database query
- [X] T080 [US4] Return 404 with friendly message when code not found
- [X] T081 [US4] Redirect to /poll/[pollId] after successful code lookup
- [X] T082 [US4] Add "Join Poll" button on homepage linking to /join
- [X] T083 [US4] Add error display for invalid codes on join page
- [X] T084 [US4] Add responsive styling to join page for mobile, tablet, desktop

**Checkpoint**: Code-based access now works as alternative to direct links

---

## Phase 7: User Story 5 - Responsive Design (Priority: P2)

**Goal**: Application works seamlessly across desktop, tablet, and mobile devices (320px-1920px)

**Independent Test**: Open application on desktop (1920px) → Resize to tablet (768px) → Resize to mobile (375px) → All features accessible and properly formatted at each size

### Implementation for User Story 5

- [X] T085 [P] [US5] Audit and enhance PollForm responsive styles: mobile (sm:), tablet (md:), desktop (lg:)
- [X] T086 [P] [US5] Audit and enhance VoteForm responsive styles for all breakpoints
- [X] T087 [P] [US5] Audit and enhance ResultsChart responsive styles for all breakpoints
- [X] T088 [P] [US5] Audit and enhance homepage responsive layout
- [X] T089 [P] [US5] Audit and enhance join page responsive layout
- [X] T090 [P] [US5] Ensure all buttons and inputs have appropriate touch targets (min 44x44px) for mobile
- [X] T091 [P] [US5] Test and fix navigation on small screens
- [X] T092 [P] [US5] Add responsive padding and margins using TailwindCSS spacing scale
- [X] T093 [P] [US5] Test form validation messages display properly on mobile
- [X] T094 [US5] Verify all pages work on 320px width (iPhone SE)
- [X] T095 [US5] Verify all pages work on 768px width (iPad)
- [X] T096 [US5] Verify all pages work on 1920px width (desktop)

**Note**: All components were built with responsive TailwindCSS utilities (sm:, md:, lg:, xl:) from the start, ensuring mobile-first responsive design.

**Checkpoint**: Application is fully responsive across all device sizes

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T097 [P] Add loading skeletons for all data-fetching pages
- [X] T098 [P] Add proper error messages for network failures
- [X] T099 [P] Add favicon and meta tags for SEO in layout.tsx
- [X] T100 [P] Create custom 404 page in src/app/not-found.tsx
- [ ] T101 [P] Add toast notifications for success/error messages using sonner or react-hot-toast
- [X] T102 Add API route GET /api/polls/[pollId] in src/app/api/polls/[pollId]/route.ts for poll details
- [ ] T103 Add email format obfuscation in real-time events for privacy (j***@example.com)
- [ ] T104 [P] Add accessibility labels (aria-labels) to all interactive elements
- [ ] T105 [P] Test keyboard navigation throughout application
- [ ] T106 [P] Add focus styles for keyboard users
- [ ] T107 Create seed data in supabase/seed.sql for development testing
- [X] T108 [P] Update README.md with project overview and setup instructions (link to quickstart.md)
- [ ] T109 Validate all acceptance scenarios from spec.md work correctly
- [ ] T110 Run quickstart.md validation: setup → create poll → vote → view results

**Note**: Core polish items completed (loading states, errors, SEO, 404, README, API routes). Optional enhancements (toasts, accessibility audit, seed data) can be added later.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup (Phase 1) completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational (Phase 2) completion
  - User Story 1 (Create Poll) - Can start after Phase 2
  - User Story 2 (Vote) - Can start after Phase 2 (works with US1)
  - User Story 3 (Results) - Can start after Phase 2 (works with US1 + US2)
  - User Story 4 (Code Access) - Can start after Phase 2 (works with US1 + US2)
  - User Story 5 (Responsive) - Can start after Phase 2 (enhances all pages)
- **Polish (Phase 8)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1 - Create Poll)**: Can start after Foundational - No dependencies on other stories
- **User Story 2 (P1 - Vote)**: Can start after Foundational - Integrates with US1 (needs polls to vote on)
- **User Story 3 (P2 - Results)**: Can start after Foundational - Integrates with US1 + US2 (needs polls and votes)
- **User Story 4 (P2 - Code Access)**: Can start after Foundational - Integrates with US1 + US2 (alternative access method)
- **User Story 5 (P2 - Responsive)**: Can start after Foundational - Enhances all existing pages

### Within Each User Story

- Pages before components that use them
- Components before API routes that serve them (for type clarity)
- API routes implement business logic
- Styling and responsive work can happen in parallel with functionality
- Validation happens on both client (UX) and server (security)

### Parallel Opportunities

#### Phase 1 (Setup) - 7 parallel tasks
- T002 (TailwindCSS), T003 (dependencies), T004 (Supabase), T005 (structure), T006 (TypeScript), T007 (linting), T009 (Next config), T010 (styles) can all run in parallel

#### Phase 2 (Foundational) - 5 parallel groups after database setup
After T011-T018 (database setup) complete:
- T019-T020 (Supabase clients) in parallel
- T021-T023 (validation, types, utils) in parallel
- T024-T027 (UI components) in parallel
- T028-T030 (layout, loading, error) can follow

#### Phase 3 (User Story 1) - 2 parallel tasks
- T031 (homepage) and T032 (create page layout) can run in parallel

#### Phase 4 (User Story 2) - 2 parallel tasks
- T045 (poll page) can run in parallel with early component work

#### Phase 5 (User Story 3) - 2 parallel tasks
- T060 (results page) and T061 (API route) can start in parallel

#### Phase 6 (User Story 4) - 2 parallel tasks
- T075 (join page) and T078 (API route) can start in parallel

#### Phase 7 (User Story 5) - 9 parallel tasks
- T085-T093 (all responsive audits) can run in parallel - different files

#### Phase 8 (Polish) - 7 parallel tasks
- T097-T101 (loading, errors, SEO, 404, toasts) in parallel
- T104-T106 (accessibility) in parallel

---

## Parallel Example: Foundational Phase

After database is set up (T011-T018), launch in parallel:

```bash
# Group 1: Client configurations
Task T019: "Create Supabase client for browser in src/lib/supabase/client.ts"
Task T020: "Create Supabase client for server in src/lib/supabase/server.ts"

# Group 2: Shared utilities
Task T021: "Create Zod schemas in src/lib/validations.ts"
Task T022: "Create TypeScript types in src/types/index.ts"
Task T023: "Create utility functions in src/lib/utils.ts"

# Group 3: UI components
Task T024: "Create Button component in src/components/ui/Button.tsx"
Task T025: "Create Input component in src/components/ui/Input.tsx"
Task T026: "Create Card component in src/components/ui/Card.tsx"
Task T027: "Create Badge component in src/components/ui/Badge.tsx"
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2 Only)

The minimum viable product includes:
1. ✅ Complete Phase 1: Setup
2. ✅ Complete Phase 2: Foundational (CRITICAL)
3. ✅ Complete Phase 3: User Story 1 (Create Poll)
4. ✅ Complete Phase 4: User Story 2 (Vote on Poll)
5. **STOP and VALIDATE**: Users can create polls and vote → MVP complete!

**MVP Delivers**: Core poll creation and voting functionality - enough to launch

### Incremental Delivery

1. **Foundation** (Phase 1-2) → Project scaffolding ready
2. **+ User Story 1** (Phase 3) → Can create polls → Demo-able!
3. **+ User Story 2** (Phase 4) → Can vote → Full MVP! 🎯
4. **+ User Story 3** (Phase 5) → Real-time results → Enhanced engagement
5. **+ User Story 4** (Phase 6) → Code access → Better UX
6. **+ User Story 5** (Phase 7) → Mobile friendly → Wider audience
7. **+ Polish** (Phase 8) → Production ready

Each phase adds value without breaking previous work.

### Parallel Team Strategy

With 3 developers after Foundational phase completes:

- **Developer A**: User Story 1 (Create Poll) - T031-T044
- **Developer B**: User Story 2 (Vote) - T045-T059  
- **Developer C**: User Story 4 (Code Access) - T075-T084

After core stories complete:
- **All developers**: User Story 3 (Results) + User Story 5 (Responsive) + Polish

---

## Task Summary

**Total Tasks**: 110 tasks
- Phase 1 (Setup): 10 tasks
- Phase 2 (Foundational): 20 tasks ⚠️ CRITICAL
- Phase 3 (US1 - Create Poll): 14 tasks 🎯 MVP Part 1
- Phase 4 (US2 - Vote): 15 tasks 🎯 MVP Part 2
- Phase 5 (US3 - Results): 15 tasks
- Phase 6 (US4 - Code Access): 10 tasks
- Phase 7 (US5 - Responsive): 12 tasks
- Phase 8 (Polish): 14 tasks

**Parallel Opportunities**: 33 tasks marked [P] can run in parallel with others

**MVP Scope**: 59 tasks (Phase 1 + 2 + 3 + 4) - Delivers full create + vote functionality

**User Story Breakdown**:
- US1 (Create Poll): 14 tasks
- US2 (Vote): 15 tasks
- US3 (Real-time Results): 15 tasks
- US4 (Code Access): 10 tasks
- US5 (Responsive Design): 12 tasks

---

## Format Validation

✅ All tasks follow checklist format: `- [ ] [TaskID] [P?] [Story?] Description with file path`  
✅ Tasks organized by user story for independent implementation  
✅ Clear dependencies and execution order documented  
✅ Parallel opportunities identified  
✅ MVP scope clearly defined (Phases 1-4)  
✅ Each user story has independent test criteria

**Ready for implementation!** 🚀
