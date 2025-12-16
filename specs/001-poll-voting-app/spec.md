# Feature Specification: Poll Voting Web Application

**Feature Branch**: `001-poll-voting-app`  
**Created**: December 16, 2025  
**Status**: Draft  
**Input**: User description: "Tạo ra spec cho ứng dụng web có responsive tạo Poll - Voting. Có tính năng cơ bản là mời người khác vote, chốt kết quả theo deadline. Cụ thể: Chủ poll tạo câu hỏi, lựa chọn, đặt deadline; người dùng nhận link/mã tham gia, vote một lần; kết quả hiển thị thời gian thực (ẩn/hiện theo cấu hình). Không cần tính năng đăng ký đăng nhập, người dùng muốn tạo vote hay muốn vote chỉ cần nhập tên và email."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create Poll (Priority: P1)

A poll creator wants to set up a new poll with a question, multiple choice options, and a deadline for voting. They enter their name and email, define the poll question, add choice options, set the deadline, and configure result visibility (show real-time or hide until closed). The system generates a unique link and access code that can be shared with voters.

**Why this priority**: This is the foundation of the application - without the ability to create polls, no other functionality can exist. It delivers immediate value by enabling the core use case.

**Independent Test**: Can be fully tested by creating a poll with various questions and options, verifying the poll is saved correctly, and confirming a shareable link/code is generated. This delivers a complete poll creation experience.

**Acceptance Scenarios**:

1. **Given** I am on the poll creation page, **When** I enter my name "John Doe", email "john@example.com", question "What time works best?", add options "9 AM", "2 PM", "5 PM", set deadline "Dec 20, 2025 5:00 PM", and configure results as "show real-time", **Then** the system creates the poll and displays a unique shareable link and access code
2. **Given** I have created a poll, **When** I view the poll details, **Then** I see my question, all choice options, the deadline, and result visibility settings
3. **Given** I am creating a poll, **When** I try to submit without entering my name, **Then** the system shows an error "Name is required"
4. **Given** I am creating a poll, **When** I try to submit with an invalid email format, **Then** the system shows an error "Please enter a valid email address"
5. **Given** I am creating a poll, **When** I try to submit with less than 2 choice options, **Then** the system shows an error "At least 2 options are required"
6. **Given** I am creating a poll, **When** I try to set a deadline in the past, **Then** the system shows an error "Deadline must be in the future"

---

### User Story 2 - Vote on Poll (Priority: P1)

A voter receives a poll link or access code, opens it, enters their name and email, views the poll question and choices, selects one option, and submits their vote. The system confirms their vote was recorded and prevents them from voting again.

**Why this priority**: Voting is the other core functionality - it works together with poll creation to deliver the minimum viable product. Without voting capability, the poll creation feature has no value.

**Independent Test**: Can be fully tested by accessing a poll via link/code, submitting a vote, and verifying the vote is recorded and the voter cannot vote again. This delivers a complete voting experience.

**Acceptance Scenarios**:

1. **Given** I have received a poll link, **When** I open the link, **Then** I see the poll question, all available choices, the deadline, and the creator's name
2. **Given** I am viewing a poll, **When** I enter my name "Jane Smith", email "jane@example.com", select one option, and click submit, **Then** my vote is recorded and I see a confirmation message "Your vote has been recorded"
3. **Given** I have already voted on a poll, **When** I try to access the poll again using the same email, **Then** the system shows "You have already voted on this poll" and prevents me from voting again
4. **Given** I am voting on a poll, **When** I try to submit without entering my name, **Then** the system shows an error "Name is required"
5. **Given** I am voting on a poll, **When** I try to submit without selecting an option, **Then** the system shows an error "Please select an option"
6. **Given** I try to vote on a poll, **When** the current time is past the deadline, **Then** the system shows "Voting has closed" and prevents me from voting

---

### User Story 3 - View Real-time Results (Priority: P2)

A voter or poll creator wants to see the current voting results. If the poll is configured to show real-time results, they can view the number of votes for each option, the percentage distribution visualized in both bar charts and pie charts, and a list of voters who selected each option. Results update automatically as new votes come in.

**Why this priority**: Real-time results add transparency and engagement to the voting process, making the application more interactive. However, the core voting functionality works without it.

**Independent Test**: Can be fully tested by creating a poll with "show real-time results" enabled, casting multiple votes, and verifying the results display updates in real-time with accurate vote counts, percentages, voter lists, and pie chart visualization.

**Acceptance Scenarios**:

1. **Given** I am viewing a poll configured to show real-time results, **When** I access the results page, **Then** I see the vote count and percentage for each option
2. **Given** I am viewing real-time results, **When** another user submits a vote, **Then** the results update automatically without refreshing the page
3. **Given** I am viewing a poll configured to hide results until closed, **When** I try to access the results before the deadline, **Then** I see "Results will be available after voting closes"
4. **Given** I am viewing a poll configured to hide results until closed, **When** the deadline has passed, **Then** I see the final vote counts and percentages
5. **Given** I am viewing poll results, **When** there are votes for an option, **Then** I see a list of voters who selected that option, including their names, emails, and submission timestamps
6. **Given** I am viewing poll results with voter lists, **When** voters are displayed, **Then** they are shown in chronological order from earliest to latest submission
7. **Given** I am viewing poll results, **When** the page loads, **Then** I see a pie chart displaying the percentage distribution of votes across all options
8. **Given** I am viewing the pie chart, **When** hovering over a segment, **Then** I see the option name and exact percentage for that segment
9. **Given** I am viewing poll results, **When** new votes are submitted, **Then** the pie chart updates automatically to reflect the new percentages

---

### User Story 4 - Access Poll via Code (Priority: P2)

A voter receives a poll access code (not a full link) and wants to participate. They navigate to the application, enter the access code, and are directed to the poll to cast their vote.

**Why this priority**: Provides an alternative access method that's easier to share in some contexts (e.g., verbally, in printed materials), enhancing accessibility. The link method alone is sufficient for basic functionality.

**Independent Test**: Can be fully tested by generating a poll, noting the access code, navigating to the code entry page, entering the code, and verifying access to the poll.

**Acceptance Scenarios**:

1. **Given** I am on the homepage, **When** I enter a valid poll code and click "Join Poll", **Then** I am directed to the poll page
2. **Given** I am on the code entry page, **When** I enter an invalid or non-existent code, **Then** I see an error "Poll not found. Please check the code and try again"

---

### User Story 5 - Responsive Design (Priority: P2)

Users access the poll application from various devices including desktop computers, tablets, and smartphones. The interface adapts to different screen sizes, ensuring all functionality is accessible and usable regardless of device.

**Why this priority**: Mobile access is important for modern web applications, but the core functionality can be tested and demonstrated on desktop first.

**Independent Test**: Can be fully tested by accessing the application on different screen sizes (desktop, tablet, mobile) and verifying all features (create poll, vote, view results) work properly and display appropriately.

**Acceptance Scenarios**:

1. **Given** I access the poll creation page on a mobile device, **When** I view the form, **Then** all input fields and buttons are properly sized and accessible
2. **Given** I access a poll on a tablet, **When** I view the voting options, **Then** the options are displayed in a readable format optimized for the tablet screen size
3. **Given** I view poll results on a smartphone, **When** I scroll through the results, **Then** the charts and vote counts are properly formatted for the small screen

---

### Edge Cases

- What happens when a voter tries to vote exactly at the deadline timestamp?
- How does the system handle multiple voters with the same email address?
- What happens if a poll creator shares the link but the deadline has already passed?
- How does the system handle polls with very long questions or option text?
- What happens when there are no votes submitted by the deadline?
- How does the system handle special characters in poll questions or options?
- What happens if a voter closes the browser mid-vote?
- How does the system handle a very large number of simultaneous voters (e.g., 100+ at once)?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow users to create polls by entering their name, email, poll question, at least 2 choice options, a deadline, and result visibility preference
- **FR-002**: System MUST validate email addresses using standard email format validation
- **FR-003**: System MUST generate a unique shareable link for each poll created
- **FR-004**: System MUST generate a unique access code for each poll created
- **FR-005**: System MUST allow voters to access polls using either the shareable link or access code
- **FR-006**: System MUST allow voters to submit a vote by entering their name, email, and selecting one option
- **FR-007**: System MUST prevent voters from voting more than once on the same poll (identified by email address)
- **FR-008**: System MUST prevent voting after the poll deadline has passed
- **FR-009**: System MUST display real-time voting results when the poll is configured to show results
- **FR-010**: System MUST hide voting results until after the deadline when the poll is configured to hide results
- **FR-011**: System MUST display vote counts and percentages for each option in the results
- **FR-011a**: System MUST display a list of voters (name, email, submission time) for each option in the results
- **FR-011b**: System MUST display a pie chart visualization showing percentage distribution of votes across all options
- **FR-011c**: System MUST display option name and percentage when hovering over pie chart segments
- **FR-012**: System MUST update results automatically as new votes are submitted (for real-time results)
- **FR-012a**: System MUST update pie chart visualization automatically when new votes are submitted (for real-time results)
- **FR-013**: System MUST validate that poll creators enter a deadline in the future
- **FR-014**: System MUST validate that poll creators provide at least 2 choice options
- **FR-015**: System MUST display the poll question, all options, and deadline to voters
- **FR-016**: System MUST display the poll creator's name to voters
- **FR-017**: System MUST show confirmation message after a vote is successfully submitted
- **FR-018**: System MUST show appropriate error messages for validation failures
- **FR-019**: System MUST adapt the user interface for different screen sizes (desktop, tablet, mobile)
- **FR-020**: System MUST persist poll data including questions, options, deadline, and configuration settings
- **FR-021**: System MUST persist voter data including names, emails, and vote selections
- **FR-022**: System MUST display "Voting has closed" message when accessing a poll after the deadline

### Key Entities

- **Poll**: Represents a voting poll created by a user. Key attributes include unique identifier, creator name, creator email, poll question, list of choice options, deadline timestamp, result visibility setting (show real-time or hide until closed), creation timestamp, unique access code
- **Vote**: Represents a single vote submitted by a voter. Key attributes include unique identifier, poll identifier (links to the Poll), voter name, voter email, selected option, submission timestamp. Relationships: Each Vote belongs to exactly one Poll
- **Choice Option**: Represents one possible answer in a poll. Key attributes include option text, display order. Relationships: Multiple Choice Options belong to one Poll
- **Vote Count**: Represents aggregated voting statistics. Key attributes include option identifier, total vote count, percentage of total votes, list of voters (name, email, submission time). Relationships: Derived from Vote data for a specific Poll

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can create a complete poll with question, options, and deadline in under 3 minutes
- **SC-002**: Users can vote on a poll in under 1 minute from clicking the link to seeing confirmation
- **SC-003**: System displays real-time results with less than 2 seconds delay after a vote is submitted
- **SC-004**: System correctly prevents duplicate voting in 100% of attempts to vote twice with the same email
- **SC-005**: Application is fully usable on screen sizes ranging from 320px (mobile) to 1920px (desktop) width
- **SC-006**: System handles at least 100 concurrent voters on a single poll without performance degradation
- **SC-007**: Poll access via link succeeds in 100% of cases where the link is correctly copied
- **SC-008**: Poll access via code succeeds in 100% of cases where the code is correctly entered
- **SC-009**: 95% of users successfully complete their intended action (create poll or vote) on first attempt without errors
- **SC-010**: All validation errors display helpful messages that guide users to correct the issue
