/**
 * Mentor page tours
 *
 * 📍 src/features/tour/steps/pages/mentor.ts
 *
 * In-page tours for `/dashboard/mentor/*` pages (mentees, opportunities,
 * sessions, task requests).
 *
 * `mentor/page.tsx` is skipped — a pure redirect with no page content to
 * point a tour at.
 */

import type { PageTourConfig } from "../../types";

export const mentorPageTours: readonly PageTourConfig[] = [
  {
    route: "/dashboard/mentor/mentees",
    version: 1,
    steps: [
      {
        id: "mentees-intro",
        title: "Your Mentees",
        description:
          "See everyone you're mentoring and track their progress from one place.",
        centered: true,
      },
      {
        id: "mentees-search",
        elementId: "page:mentor-mentees:search",
        title: "Find a Mentee",
        description: "Search by name or MU ID.",
      },
      {
        id: "mentees-table",
        elementId: "page:mentor-mentees:table",
        title: "Mentee Overview",
        description:
          "Check each mentee's last attendance status and session count, then leave feedback after a session.",
      },
    ],
  },
  {
    route: "/dashboard/mentor/sessions",
    version: 1,
    steps: [
      {
        id: "sessions-intro",
        title: "Mentoring Sessions",
        description:
          "Schedule and manage your mentoring sessions with mentees.",
        centered: true,
      },
      {
        id: "sessions-new",
        elementId: "page:mentor-sessions:new-session",
        title: "Schedule a Session",
        description: "Create a new mentoring session for your mentees.",
      },
      {
        id: "sessions-tabs",
        elementId: "page:mentor-sessions:tabs",
        title: "Browse Your Sessions",
        description:
          "Switch between upcoming, all, and student-requested sessions.",
      },
      {
        id: "sessions-upcoming",
        elementId: "page:mentor-sessions:upcoming",
        title: "Upcoming Sessions",
        description:
          "Join, edit, view participants, or update the status of a scheduled session.",
      },
      {
        id: "sessions-requests",
        elementId: "page:mentor-sessions:requests",
        title: "Student Requests",
        description:
          "Review session requests sent to you by students and respond to them.",
      },
    ],
  },
  {
    route: "/dashboard/mentor/task-requests",
    version: 1,
    steps: [
      {
        id: "task-requests-intro",
        title: "Task Requests",
        description:
          "Submit and track tasks you've requested for admin approval.",
        centered: true,
      },
      {
        id: "task-requests-submit",
        elementId: "page:mentor-task-requests:submit",
        title: "Submit a Task",
        description:
          "Create a new task for your mentees, tied to one of your assigned Interest Groups.",
      },
      {
        id: "task-requests-tabs",
        elementId: "page:mentor-task-requests:tabs",
        title: "Track Task Status",
        description:
          "Filter your tasks by all, pending, approved, or rejected.",
      },
      {
        id: "task-requests-table",
        elementId: "page:mentor-task-requests:all-tasks",
        title: "Task Requests",
        description:
          "Click a task to view details, or edit/delete it while it's still pending.",
      },
    ],
  },
  {
    route: "/dashboard/mentor/opportunities",
    version: 1,
    steps: [
      {
        id: "mentor-opportunities-intro",
        title: "Opportunities",
        description:
          "Create and manage mentoring opportunities for learners to apply to.",
        centered: true,
      },
      {
        id: "mentor-opportunities-header",
        elementId: "page:mentor-opportunities:header",
        title: "Search & Create",
        description:
          "Find an existing opportunity, or post a new one for learners to apply to.",
      },
      {
        id: "mentor-opportunities-tabs",
        elementId: "page:mentor-opportunities:tabs",
        title: "Filter by Status",
        description:
          "Switch between published, closed, archived, and all opportunities.",
      },
      {
        id: "mentor-opportunities-list",
        elementId: "page:mentor-opportunities:list",
        title: "Your Opportunities",
        description:
          "Publish a draft, close a published opportunity, or edit and archive any entry.",
      },
    ],
  },
];
