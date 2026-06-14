# mulearn-dashboard

## 4.9.0

### Minor Changes

- [#136](https://github.com/gtech-mulearn/mulearn-dashboard/pull/136) [`d9bfd22`](https://github.com/awindsr/mulearn-dashboard/commit/d9bfd22dad87843b38e143f546c8a51df62a9d98) Thanks [@alvin-dennis](https://github.com/alvin-dennis)! - ## Task Management

  - Implemented full Task CRUD feature page
  - Refactored task form for better type handling and form validation
  - Enhanced error handling integration across task dialogs
  - Added creation and editing functionality with form and dialog interfaces
  - Added modal for task creation
  - Updated documentation for task creation flows

  ## Task Verification

  - Implemented Task Verification feature page
  - Updated source filtering logic
  - Refactored with improved API endpoints and event handling
  - Added admin verification workflow
  - Refactored verification API for better workflows

  ## Task Type Management

  - Implemented Task Type Management feature page
  - Enhanced type display and error handling
  - Added task type management dialog
  - Updated API with error handling improvements

  ## Task Bulk Import

  - Implemented Task Bulk Import feature page
  - Added batch task import functionality
  - Added dedicated bulk import route

  ## Misc

  - Added API response and task-specific error handling hooks
  - Updated route permissions for task management

## 4.8.0

### Minor Changes

- [#125](https://github.com/gtech-mulearn/mulearn-dashboard/pull/125) [`e116017`](https://github.com/awindsr/mulearn-dashboard/commit/e116017900651f2921dd899af0c95a979ad26f3b) Thanks [@vedhavk](https://github.com/vedhavk)! - **Company Branch** — a new suite of features connecting companies, learners, and admins.

  - **Manage Companies (Admin):** Review, verify, or reject company registration requests, with a detailed company profile view and approve/reject flow.
  - **Jobs (Company):** Post and manage job openings through a guided multi-step form, set eligibility rules, and track applicants through hiring stages.
  - **Tasks (Company):** Create and manage community tasks with karma points, submitted for admin approval.
  - **Mentors (Company):** Nominate mentors from the community for admin review.
  - **Jobs for Learners:** Browse open roles across all verified companies, apply with a resume and cover letter, and track application status from "My Applications."

## 4.7.0

### Minor Changes

- [#123](https://github.com/gtech-mulearn/mulearn-dashboard/pull/123) [`9c5f4bf`](https://github.com/awindsr/mulearn-dashboard/commit/9c5f4bf155668a5811de6483fa1abc9b178cbf21) Thanks [@Akshayvs-Tech](https://github.com/Akshayvs-Tech)! - ### Home Page

  - Added a status banner to display the mentor application status.
  - Shows a pending status when the application is under review.
  - Displays a verified badge once the application is approved by the admin.

  ### Session Page

  - Added functionality for mentors to create sessions using the **Create Session** button.
  - Mentors can view all created sessions in a table.
  - Added session actions including:

    - Add participants
    - Delete session
    - Copy session ID (available when the session status is scheduled)

  ### Task Request Page

  - Added functionality for mentors to create tasks.
  - Newly created tasks are displayed with a pending status until admin approval.
  - Once verified by the admin, the task status changes to approved.
  - Added options to edit and delete tasks.

  ### Mentees Page

  - Displays the list of mentees who have joined a session.
  - Added a **Join Session** option where mentees can join using the session ID.
  - Added view and feedback actions for each mentee.
  - The feedback option allows mentors to submit feedback for the completed session.

## 4.6.1

### Patch Changes

- [#116](https://github.com/gtech-mulearn/mulearn-dashboard/pull/116) [`acb27fc`](https://github.com/awindsr/mulearn-dashboard/commit/acb27fc7409784f1dd13a35d944dfde75e84c505) Thanks [@awindsr](https://github.com/awindsr)! - Fix campus role-route protection drift (Associates locked out of manage-interns),

## 4.6.0

### Minor Changes

- [#113](https://github.com/gtech-mulearn/mulearn-dashboard/pull/113) [`261df88`](https://github.com/awindsr/mulearn-dashboard/commit/261df88559e3427139e0c07ce7b9a29e7c1a6879) Thanks [@awindsr](https://github.com/awindsr)! - Add semantic versioning, changelog page, and automated release workflow
