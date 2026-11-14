/**
 * Intern page tours
 *
 * 📍 src/features/tour/steps/pages/intern.ts
 *
 * In-page tours for `/dashboard/intern/*` pages (tasks, timesheet, leave,
 * minutes, weekly review, leaderboard).
 *
 * `intern/quest-log/page.tsx` is skipped — it renders `QuestLogHistory`, a
 * shared component that lives outside this page's folder
 * (`src/features/intern/components/activity-log-history.tsx`), so there's no
 * in-scope element to point multiple real steps at without editing that
 * shared component.
 */

import { ROLES } from "@/lib/auth/roles";
import type { PageTourConfig } from "../../types";

export const internPageTours: readonly PageTourConfig[] = [
  {
    route: "/dashboard/intern",
    version: 1,
    steps: [
      {
        id: "intern-dashboard-intro",
        title: "Intern Dashboard",
        description:
          "Your home base for the internship — quests, progress, and the leaderboard, all in one place.",
        centered: true,
      },
      {
        id: "intern-dashboard-header",
        elementId: "page:intern-dashboard:header",
        title: "Your Overview",
        description:
          "A quick snapshot of who you are and where you stand in the program.",
      },
      {
        id: "intern-dashboard-stats",
        elementId: "page:intern-dashboard:stats",
        title: "Key Stats",
        description:
          "Track your karma, streak, and other core metrics at a glance.",
      },
      {
        id: "intern-dashboard-active-quests",
        elementId: "page:intern-dashboard:active-quests",
        title: "Active Quests",
        description:
          "Jump straight into your current tasks and quick actions from here.",
      },
      {
        id: "intern-dashboard-leaderboard-preview",
        elementId: "page:intern-dashboard:leaderboard-preview",
        title: "Elite Leaders",
        description: "See how the top performers are ranking this cycle.",
      },
      {
        id: "intern-dashboard-quest-log",
        elementId: "page:intern-dashboard:quest-log",
        title: "Quest Log",
        description: "A running feed of your recent activity and milestones.",
      },
    ],
  },
  {
    route: "/dashboard/intern/leaderboard",
    version: 1,
    steps: [
      {
        id: "intern-leaderboard-intro",
        title: "Reward Leaderboard",
        description:
          "See how you stack up against other interns and what it takes to climb.",
        centered: true,
      },
      {
        id: "intern-leaderboard-header",
        elementId: "page:intern-leaderboard:header",
        title: "Reward Leaderboard",
        description: "Compete with others and earn rewards for your rank.",
      },
      {
        id: "intern-leaderboard-podium",
        elementId: "page:intern-leaderboard:podium",
        title: "Top 3 Podium",
        description: "The current top scorers, front and center.",
      },
      {
        id: "intern-leaderboard-your-rank",
        elementId: "page:intern-leaderboard:your-rank",
        title: "Your Rank",
        description: "Your current rank and score, always visible here.",
      },
      {
        id: "intern-leaderboard-search",
        elementId: "page:intern-leaderboard:search",
        title: "Find Someone",
        description: "Search the rankings by name to see where they stand.",
      },
      {
        id: "intern-leaderboard-rankings",
        elementId: "page:intern-leaderboard:rankings",
        title: "Full Rankings",
        description:
          "Browse the complete list of interns, sorted by score and streak.",
      },
    ],
  },
  {
    route: "/dashboard/intern/leave",
    version: 1,
    steps: [
      {
        id: "intern-leave-intro",
        title: "Leave Management",
        description:
          "Track your leave balances, review past requests, and apply for new leave — all from here.",
        centered: true,
      },
      {
        id: "intern-leave-header",
        elementId: "page:intern-leave:header",
        title: "Leave Desk",
        description:
          "Track your leave balances, history of requests, and submit new leaves.",
      },
      {
        id: "intern-leave-tabs",
        elementId: "page:intern-leave:tabs",
        title: "Balance and History",
        description:
          "Switch between your remaining leave balance and your request history.",
      },
      {
        id: "intern-leave-balance",
        elementId: "page:intern-leave:balance",
        title: "Leave Balance",
        description:
          "See how much casual, sick, and emergency leave you've used.",
      },
      {
        id: "intern-leave-history",
        elementId: "page:intern-leave:history",
        title: "Request History",
        description:
          "Review past leave requests and their approval status, or cancel a pending one.",
      },
      {
        id: "intern-leave-apply-form",
        elementId: "page:intern-leave:apply-form",
        title: "Apply for Leave",
        description:
          "Submit a new leave request here — your campus lead will review it.",
      },
    ],
  },
  {
    route: "/dashboard/intern/minutes",
    version: 1,
    steps: [
      {
        id: "intern-minutes-intro",
        title: "Guild Minutes",
        description: "Keep track of your guild's daily meeting minutes here.",
        centered: true,
      },
      {
        id: "intern-minutes-header",
        elementId: "page:intern-minutes:header",
        title: "Guild Minutes",
        description: "Track your guild's daily meeting minutes.",
      },
      {
        id: "intern-minutes-upload",
        elementId: "page:intern-minutes:upload",
        title: "Upload Minutes",
        description:
          "Intern leads can submit today's meeting notes link or a brief summary here.",
        requiresRole: [ROLES.INTERN_LEAD],
      },
      {
        id: "intern-minutes-search",
        elementId: "page:intern-minutes:search",
        title: "Search Minutes",
        description: "Quickly find a past entry by title or content.",
      },
      {
        id: "intern-minutes-history",
        elementId: "page:intern-minutes:history",
        title: "Minutes History",
        description: "Browse and view details of previously logged minutes.",
      },
    ],
  },
  {
    route: "/dashboard/intern/tasks",
    version: 1,
    steps: [
      {
        id: "intern-tasks-intro",
        title: "Task Tracker",
        description:
          "View your assigned guild duties and update your progress on each.",
        centered: true,
      },
      {
        id: "intern-tasks-header",
        elementId: "page:intern-tasks:header",
        title: "Task Tracker",
        description: "View your assigned guild duties and track progress.",
      },
      {
        id: "intern-tasks-filters",
        elementId: "page:intern-tasks:filters",
        title: "Search and Filter",
        description:
          "Find a specific task by name, or filter by its current status.",
      },
      {
        id: "intern-tasks-board",
        elementId: "page:intern-tasks:board",
        title: "Your Tasks",
        description:
          "Open a task for details, or update its status directly from the card.",
      },
    ],
  },
  {
    route: "/dashboard/intern/timesheet",
    version: 1,
    steps: [
      {
        id: "intern-timesheet-intro",
        title: "Daily Timesheet",
        description:
          "Log your daily activities to maintain your streak and earn multipliers.",
        centered: true,
      },
      {
        id: "intern-timesheet-header",
        elementId: "page:intern-timesheet:header",
        title: "Daily Timesheet",
        description:
          "Log your daily activities to maintain your legendary streak.",
      },
      {
        id: "intern-timesheet-submit-form",
        elementId: "page:intern-timesheet:submit-form",
        title: "Submit Progress",
        description:
          "Log today's hours, link them to a task, and describe what you got done.",
      },
      {
        id: "intern-timesheet-calendar",
        elementId: "page:intern-timesheet:calendar",
        title: "Daily History",
        description:
          "See which days you've submitted, missed, or are still pending this month.",
      },
      {
        id: "intern-timesheet-streak",
        elementId: "page:intern-timesheet:streak",
        title: "Streak Bonus",
        description:
          "Keep your streak going to unlock higher point multipliers.",
      },
    ],
  },
  {
    route: "/dashboard/intern/weekly-review",
    version: 1,
    steps: [
      {
        id: "intern-weekly-review-intro",
        title: "Weekly Review",
        description:
          "Reflect on your week — achievements, challenges, and what's next.",
        centered: true,
      },
      {
        id: "intern-weekly-review-header",
        elementId: "page:intern-weekly-review:header",
        title: "Weekly Timesheet",
        description:
          "Reflect on your progress and achievements. Submissions close Sunday at 23:59 UTC.",
      },
      {
        id: "intern-weekly-review-status",
        elementId: "page:intern-weekly-review:status",
        title: "This Week's Status",
        description:
          "See the current week number and whether you've already submitted.",
      },
      {
        id: "intern-weekly-review-form",
        elementId: "page:intern-weekly-review:form",
        title: "Submit Your Review",
        description:
          "Share your key achievements, challenges, and plan for next week.",
      },
    ],
  },
];
