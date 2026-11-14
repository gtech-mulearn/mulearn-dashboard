/**
 * Mentor Tour Steps
 *
 * 📍 src/features/tour/steps/mentor.ts
 *
 * Tour key: `mentor` — Mentor (§5.2). Split out of `dashboardSteps` so a
 * Mentor-only step edit bumps `TOUR_VERSIONS.mentor` without force-replaying
 * every other persona on `TOUR_VERSIONS.dashboard`.
 */

import type { TourStep } from "../types";
import {
  baseNavSteps,
  finishStep,
  manageEventsStep,
  welcomeStep,
} from "./shared";

export const mentorSteps: TourStep[] = [
  welcomeStep,
  ...baseNavSteps,

  {
    id: "talent-pool",
    navId: "talent-pool",
    title: "Talent Pool",
    description:
      "Browse verified learners to mentor, hire, or bring onto your team.",
  },
  {
    id: "mentor-sessions",
    navId: "mentor-sessions",
    title: "Sessions",
    description: "Schedule and manage your mentoring sessions with mentees.",
    requiresFlag: (ctx) => ctx.isMentorVerified,
  },
  {
    id: "mentor-task-requests",
    navId: "mentor-task-requests",
    title: "Task Requests",
    description:
      "Review and respond to task submissions waiting on your approval.",
    requiresFlag: (ctx) => ctx.isMentorVerified,
  },
  {
    id: "mentor-mentees",
    navId: "mentor-mentees",
    title: "Mentees",
    description: "See everyone you're mentoring and track their progress.",
  },

  manageEventsStep,
  finishStep,
];
