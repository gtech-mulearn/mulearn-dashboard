/**
 * Company Tour Steps
 *
 * 📍 src/features/tour/steps/company.ts
 *
 * Tour key: `company` — Company (§5.3). Split out of `dashboardSteps` so a
 * Company-only step edit bumps `TOUR_VERSIONS.company` without
 * force-replaying every other persona on `TOUR_VERSIONS.dashboard`.
 */

import type { TourStep } from "../types";
import {
  baseNavSteps,
  finishStep,
  manageEventsStep,
  welcomeStep,
} from "./shared";

export const companySteps: TourStep[] = [
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
    id: "company-jobs",
    navId: "company-jobs",
    title: "Job Management",
    description: "Post openings and manage the jobs your company has listed.",
  },
  {
    id: "company-tasks",
    navId: "company-tasks",
    title: "Task Management",
    description: "Create tasks for learners and review their submissions.",
  },
  {
    id: "company-mentors",
    navId: "company-mentors",
    title: "Mentor Management",
    description: "Manage the mentors affiliated with your company.",
  },
  {
    id: "company-ig-requests",
    navId: "company-ig-requests",
    title: "IG Requests",
    description:
      "Review Interest Group collaboration requests sent to your company.",
  },
  {
    id: "company-analytics",
    navId: "company-analytics",
    title: "Analytics & Performance",
    description: "Track hiring, task, and engagement metrics for your company.",
  },

  manageEventsStep,
  finishStep,
];
