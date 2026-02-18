# Ticket Feature Test Plan

## Application Overview

This test plan covers the Ticket feature of the Swiftly Helpdesk application. The Ticket feature allows users to create, view, search, edit, and manage support tickets. The system supports three user roles: regular users, support staff (support1), and administrators (admin). Each role has different permissions: regular users can create and view their own tickets, while staff/admins can view all tickets, assign tickets, change priority, status, and category.

## Test Scenarios

### 1. Create Ticket

**Seed:** `e2e/seed.spec.ts`

#### 1.1. Regular user creates a ticket with title and description

**File:** `tests/tickets/create-ticket-basic.spec.ts`

**Steps:**
  1. Navigate to the Create Ticket page
    - expect: The Create Ticket form should be displayed with Title and Description fields
  2. AI Assistant overlay should appear for regular users
    - expect: AI Assistant chat overlay is displayed asking user to describe their problem before creating a ticket
  3. Dismiss AI Assistant by clicking to proceed with ticket creation
    - expect: The Create Ticket form becomes accessible
  4. Enter a valid title in the Title field
    - expect: Title field accepts the input
  5. Enter a detailed description in the Description field
    - expect: Description field accepts the input
  6. Click the 'Create Ticket' button
    - expect: A success overlay appears with message 'Ticket created successfully!'
    - expect: The form is reset to empty state

#### 1.2. Create ticket with file attachment

**File:** `tests/tickets/create-ticket-attachment.spec.ts`

**Steps:**
  1. Navigate to the Create Ticket page and proceed past AI Assistant
    - expect: The Create Ticket form is displayed
  2. Fill in the Title and Description fields with valid data
    - expect: Fields accept the input
  3. Click on the file upload input and select a file
    - expect: The file is selected and filename is displayed
  4. Click the 'Create Ticket' button
    - expect: Ticket is created successfully with the attachment
    - expect: Success message is displayed

#### 1.3. Staff user creates a ticket with priority and category

**File:** `tests/tickets/create-ticket-staff.spec.ts`

**Steps:**
  1. Login as a staff user (admin or support1 role)
    - expect: User is logged in and redirected to dashboard
  2. Navigate to the Create Ticket page
    - expect: The Create Ticket form is displayed with additional Priority and Category fields
    - expect: AI Assistant overlay is NOT shown for staff users
  3. Enter a valid title in the Title field
    - expect: Title field accepts the input
  4. Select a priority from the Priority dropdown (Low/Medium/High)
    - expect: Priority is selected and displayed
  5. Enter a detailed description in the Description field
    - expect: Description field accepts the input
  6. Select a category from the Category dropdown
    - expect: Category is selected from options: Hardware, Software, Network, Account, Email, Other
  7. Click the 'Create Ticket' button
    - expect: Ticket is created with the selected priority and category
    - expect: Success overlay is displayed

#### 1.4. Validation - Cannot create ticket without required fields

**File:** `tests/tickets/create-ticket-validation.spec.ts`

**Steps:**
  1. Navigate to the Create Ticket page and proceed past AI Assistant
    - expect: The Create Ticket form is displayed
  2. Leave the Title field empty and click 'Create Ticket'
    - expect: Form is not submitted
    - expect: Validation error is shown for Title field
  3. Fill in Title but leave Description empty and click 'Create Ticket'
    - expect: Form is not submitted
    - expect: Validation error is shown for Description field

### 2. View My Tickets

**Seed:** `e2e/seed.spec.ts`

#### 2.1. User views their own tickets list

**File:** `tests/tickets/my-tickets-list.spec.ts`

**Steps:**
  1. Login as a regular user who has created tickets
    - expect: User is logged in successfully
  2. Navigate to the My Tickets page
    - expect: A table displaying user's tickets is shown
    - expect: Table includes columns: Ticket ID, Title, Owner, Priority, Status, Assignee, Created
  3. Verify ticket data is displayed correctly
    - expect: Each ticket shows its ID (first 8 characters), title, owner name with avatar, priority badge, status badge, assignee, and creation date

#### 2.2. Search tickets in My Tickets list

**File:** `tests/tickets/my-tickets-search.spec.ts`

**Steps:**
  1. Navigate to the My Tickets page
    - expect: My Tickets page is displayed with search bar
  2. Enter a search query in the search bar
    - expect: Tickets are filtered based on the search query
    - expect: The description updates to show number of results found for the search term
  3. Clear the search query
    - expect: All user's tickets are displayed again

#### 2.3. Click on ticket to view details

**File:** `tests/tickets/my-tickets-navigate-to-detail.spec.ts`

**Steps:**
  1. Navigate to the My Tickets page
    - expect: My Tickets list is displayed
  2. Click on a ticket title in the table
    - expect: User is navigated to the Ticket Detail page for that ticket

#### 2.4. Create new ticket from My Tickets page

**File:** `tests/tickets/my-tickets-create-new.spec.ts`

**Steps:**
  1. Navigate to the My Tickets page
    - expect: My Tickets page is displayed with 'New Ticket' button
  2. Click the 'New Ticket' button
    - expect: User is navigated to the Create Ticket page

### 3. View All Tickets (Staff Only)

**Seed:** `e2e/seed.spec.ts`

#### 3.1. Staff user views all tickets list

**File:** `tests/tickets/all-tickets-list.spec.ts`

**Steps:**
  1. Login as a staff user (admin or support1 role)
    - expect: User is logged in successfully
  2. Navigate to the All Tickets page
    - expect: A table displaying all tickets in the system is shown
    - expect: Table includes columns: Ticket ID, Title, Owner, Priority, Status, Assignee, Created

#### 3.2. Regular user cannot access All Tickets

**File:** `tests/tickets/all-tickets-access-denied.spec.ts`

**Steps:**
  1. Login as a regular user (user role)
    - expect: User is logged in successfully
  2. Attempt to navigate to the All Tickets page
    - expect: An 'Access restricted' message is displayed
    - expect: Message states 'You do not have permission to view all tickets.'

#### 3.3. Search tickets in All Tickets list

**File:** `tests/tickets/all-tickets-search.spec.ts`

**Steps:**
  1. Login as staff and navigate to the All Tickets page
    - expect: All Tickets page is displayed with search bar
  2. Enter a search query in the search bar
    - expect: Tickets are filtered based on the search query
    - expect: The description updates to show number of results found

#### 3.4. Admin clicks on owner name to view user profile

**File:** `tests/tickets/all-tickets-navigate-to-user.spec.ts`

**Steps:**
  1. Login as admin and navigate to the All Tickets page
    - expect: All Tickets page is displayed
  2. Click on a ticket owner's name in the table
    - expect: Admin is navigated to the user profile page for that owner

### 4. Ticket Detail View

**Seed:** `e2e/seed.spec.ts`

#### 4.1. View ticket detail page

**File:** `tests/tickets/ticket-detail-view.spec.ts`

**Steps:**
  1. Navigate to a ticket detail page
    - expect: Ticket detail page is displayed with ticket number, title, priority badge, status badge, and category badge
  2. Verify the Details tab content
    - expect: Details tab shows: Created date, Last updated date, Requester info with avatar, Category
  3. Verify the Description card
    - expect: Description card shows the full ticket description text
  4. Verify the Attachments card
    - expect: Attachments card shows list of attached files or 'No files attached.' message
  5. Verify the Workflow sidebar
    - expect: Sidebar shows Status, Assignee, Priority, and Category information
  6. Verify the Requester sidebar card
    - expect: Requester card shows owner's avatar, name, and email

#### 4.2. View ticket comments

**File:** `tests/tickets/ticket-detail-comments-view.spec.ts`

**Steps:**
  1. Navigate to a ticket detail page
    - expect: Ticket detail page is displayed
  2. Click on the 'Comments' tab
    - expect: Comments tab is selected and shows the comment count
  3. Verify comments display
    - expect: Each comment shows author avatar, name, email, timestamp, and content
    - expect: If no comments exist, 'No comments yet.' message is displayed

#### 4.3. Add a comment to a ticket

**File:** `tests/tickets/ticket-detail-add-comment.spec.ts`

**Steps:**
  1. Navigate to a ticket detail page and switch to Comments tab
    - expect: Comments section is displayed with 'Add comment' form
  2. Enter comment text in the Message textarea
    - expect: Text is entered in the textarea
  3. Click the 'Post comment' button
    - expect: Comment is added to the ticket
    - expect: New comment appears in the comments list with author info and timestamp

#### 4.4. Cannot add empty comment

**File:** `tests/tickets/ticket-detail-empty-comment.spec.ts`

**Steps:**
  1. Navigate to a ticket detail page and switch to Comments tab
    - expect: Comments section is displayed
  2. Leave the comment textarea empty and click 'Post comment'
    - expect: Comment is not posted
    - expect: Form validation prevents submission

#### 4.5. Navigate back from ticket detail

**File:** `tests/tickets/ticket-detail-back-navigation.spec.ts`

**Steps:**
  1. Navigate to a ticket detail page from the tickets list
    - expect: Ticket detail page is displayed
  2. Click the 'Back' button
    - expect: User is navigated back to the previous page (tickets list)

### 5. Edit Ticket

**Seed:** `e2e/seed.spec.ts`

#### 5.1. Ticket owner edits their own ticket

**File:** `tests/tickets/ticket-edit-owner.spec.ts`

**Steps:**
  1. Login as a regular user and navigate to their own ticket detail page
    - expect: Ticket detail page is displayed with 'Edit' button visible
  2. Click the 'Edit' button
    - expect: Edit form is displayed with Title and Description fields
    - expect: Save and Cancel buttons appear
  3. Modify the title text
    - expect: Title field accepts the new input
  4. Modify the description text
    - expect: Description field accepts the new input
  5. Click the 'Save' button
    - expect: Changes are saved
    - expect: Edit mode is closed
    - expect: Updated title and description are displayed

#### 5.2. Cancel ticket edit

**File:** `tests/tickets/ticket-edit-cancel.spec.ts`

**Steps:**
  1. Navigate to a ticket detail page and click 'Edit'
    - expect: Edit form is displayed
  2. Make changes to title and description
    - expect: Changes are entered in the form
  3. Click the 'Cancel' button
    - expect: Edit mode is closed
    - expect: Original ticket data is displayed (changes are discarded)

#### 5.3. Staff user edits ticket with priority and category

**File:** `tests/tickets/ticket-edit-staff.spec.ts`

**Steps:**
  1. Login as a staff user and navigate to any ticket detail page
    - expect: Ticket detail page is displayed with 'Edit' button visible
  2. Click the 'Edit' button
    - expect: Edit form is displayed with Title, Description, Priority dropdown, and Category field
  3. Modify the title and description
    - expect: Fields accept the new input
  4. Select a different priority from the dropdown
    - expect: New priority is selected
  5. Enter or modify the category
    - expect: Category field accepts the input
  6. Click the 'Save' button
    - expect: All changes are saved
    - expect: Updated values are displayed in the ticket detail view

#### 5.4. User cannot edit another user's ticket

**File:** `tests/tickets/ticket-edit-not-owner.spec.ts`

**Steps:**
  1. Login as a regular user and navigate to a ticket owned by another user
    - expect: Ticket detail page is displayed
    - expect: 'Edit' button is NOT visible

### 6. Ticket Workflow Management (Staff Only)

**Seed:** `e2e/seed.spec.ts`

#### 6.1. Staff changes ticket status

**File:** `tests/tickets/ticket-workflow-status.spec.ts`

**Steps:**
  1. Login as a staff user and navigate to a ticket detail page
    - expect: Ticket detail page is displayed with Status dropdown in the Workflow sidebar
  2. Click on the Status dropdown
    - expect: Dropdown opens showing options: open, in-progress, resolved, closed
  3. Select a different status (e.g., 'in-progress')
    - expect: Status is updated immediately
    - expect: Status badge reflects the new status with appropriate color

#### 6.2. Staff assigns ticket to themselves

**File:** `tests/tickets/ticket-workflow-assign-self.spec.ts`

**Steps:**
  1. Login as a staff user and navigate to an unassigned ticket detail page
    - expect: Ticket detail page shows Assignee dropdown with 'Unassigned' placeholder
  2. Click on the Assignee dropdown
    - expect: Dropdown opens showing 'Assign to me' option and list of other staff users
  3. Select 'Assign to me'
    - expect: Ticket is assigned to the current user
    - expect: Assignee field shows the current user's name

#### 6.3. Staff assigns ticket to another staff member

**File:** `tests/tickets/ticket-workflow-assign-other.spec.ts`

**Steps:**
  1. Login as a staff user and navigate to a ticket detail page
    - expect: Ticket detail page shows Assignee dropdown
  2. Click on the Assignee dropdown and select another staff member
    - expect: Ticket is assigned to the selected staff member
    - expect: Assignee field shows their name

#### 6.4. Staff changes ticket priority

**File:** `tests/tickets/ticket-workflow-priority.spec.ts`

**Steps:**
  1. Login as a staff user and navigate to a ticket detail page
    - expect: Ticket detail page shows Priority dropdown in the Workflow sidebar
  2. Click on the Priority dropdown
    - expect: Dropdown opens showing options: Low, Medium, High
  3. Select a different priority (e.g., 'High')
    - expect: Priority is updated immediately
    - expect: Priority badge reflects the new priority with appropriate color

#### 6.5. Staff changes ticket category

**File:** `tests/tickets/ticket-workflow-category.spec.ts`

**Steps:**
  1. Login as a staff user and navigate to a ticket detail page
    - expect: Ticket detail page shows Category dropdown in the Workflow sidebar
  2. Click on the Category dropdown
    - expect: Dropdown opens showing options: Hardware, Software, Network, Account, Email, Other
  3. Select a category
    - expect: Category is updated immediately
    - expect: Category badge is displayed with the new value

#### 6.6. Regular user cannot change workflow fields

**File:** `tests/tickets/ticket-workflow-user-readonly.spec.ts`

**Steps:**
  1. Login as a regular user and navigate to their ticket detail page
    - expect: Ticket detail page is displayed
  2. Verify the Workflow sidebar
    - expect: Status is displayed as a badge (not a dropdown)
    - expect: Assignee is displayed as text (not a dropdown)
    - expect: Priority is displayed as a badge (not a dropdown)
    - expect: Category is displayed as a badge (not a dropdown)

### 7. AI Assistant (Regular Users)

**Seed:** `e2e/seed.spec.ts`

#### 7.1. AI Assistant appears when creating ticket as regular user

**File:** `tests/tickets/ai-assistant-display.spec.ts`

**Steps:**
  1. Login as a regular user and navigate to Create Ticket page
    - expect: AI Assistant overlay appears with greeting message
    - expect: Chat interface is displayed with input field

#### 7.2. User interacts with AI Assistant

**File:** `tests/tickets/ai-assistant-chat.spec.ts`

**Steps:**
  1. Login as a regular user and navigate to Create Ticket page
    - expect: AI Assistant overlay is displayed
  2. Enter a problem description in the chat input
    - expect: Message is entered in the input field
  3. Click the send button
    - expect: User message appears in the chat
    - expect: AI responds with potential solutions or follow-up questions

#### 7.3. User proceeds to create ticket after AI Assistant

**File:** `tests/tickets/ai-assistant-proceed-to-ticket.spec.ts`

**Steps:**
  1. Login as a regular user and navigate to Create Ticket page
    - expect: AI Assistant overlay is displayed
  2. Interact with AI and choose to proceed with ticket creation
    - expect: AI Assistant overlay closes
    - expect: Create Ticket form becomes accessible

#### 7.4. User navigates away from AI Assistant

**File:** `tests/tickets/ai-assistant-navigate-away.spec.ts`

**Steps:**
  1. Login as a regular user and navigate to Create Ticket page
    - expect: AI Assistant overlay is displayed
  2. Click to navigate back to dashboard without creating ticket
    - expect: User is redirected to the dashboard page

### 8. Ticket Attachments

**Seed:** `e2e/seed.spec.ts`

#### 8.1. View ticket with attachments

**File:** `tests/tickets/ticket-attachments-view.spec.ts`

**Steps:**
  1. Navigate to a ticket detail page that has attachments
    - expect: Attachments card displays list of attached files
    - expect: Each attachment shows filename and upload date
  2. Click the 'Open' button on an attachment
    - expect: Attachment opens in a new tab or downloads

#### 8.2. View ticket without attachments

**File:** `tests/tickets/ticket-attachments-empty.spec.ts`

**Steps:**
  1. Navigate to a ticket detail page that has no attachments
    - expect: Attachments card displays 'No files attached.' message

### 9. Error Handling

**Seed:** `e2e/seed.spec.ts`

#### 9.1. Handle ticket not found

**File:** `tests/tickets/error-ticket-not-found.spec.ts`

**Steps:**
  1. Navigate to a ticket detail page with an invalid ticket ID
    - expect: Error message 'Ticket not found' is displayed

#### 9.2. Handle failed ticket creation

**File:** `tests/tickets/error-create-ticket-failed.spec.ts`

**Steps:**
  1. Attempt to create a ticket when the API returns an error
    - expect: Error message is displayed to the user
    - expect: Form remains filled so user can retry

#### 9.3. Handle failed ticket list loading

**File:** `tests/tickets/error-tickets-load-failed.spec.ts`

**Steps:**
  1. Navigate to All Tickets when API returns an error
    - expect: Error message 'Failed to load tickets' is displayed
    - expect: Search bar remains functional

#### 9.4. Handle attachment upload failure

**File:** `tests/tickets/error-attachment-upload.spec.ts`

**Steps:**
  1. Create a ticket with an attachment when attachment upload fails
    - expect: Ticket is created successfully
    - expect: Warning message indicates 'Attachment upload failed. Ticket created without it.'
