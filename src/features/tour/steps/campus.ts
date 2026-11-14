/**
 * Campus Tour Steps
 *
 * 📍 src/features/tour/steps/campus.ts
 *
 * Tour key: `campus` — Campus Lead, Lead Enabler (§5.6).
 */

import { ROLES } from "@/lib/auth/roles";
import type { TourStep } from "../types";
import {
  baseNavSteps,
  finishStep,
  manageEventsStep,
  welcomeStep,
} from "./shared";

const CAMPUS_ROLES = [ROLES.CAMPUS_LEAD, ROLES.LEAD_ENABLER];

export const campusSteps: TourStep[] = [
  welcomeStep,
  ...baseNavSteps,
  {
    id: "campus-overview",
    navId: "campus-manage",
    title: "Campus Overview",
    description: "Snapshot of your campus's students, activity, and standing.",
    requiresRole: CAMPUS_ROLES,
  },
  {
    id: "campus-manage-actions",
    navId: "campus-manage",
    title: "Manage Students",
    description: "Add, review, and manage the students on your campus.",
    requiresRole: CAMPUS_ROLES,
    requiresFlag: (ctx) => ctx.can("campus:manage"),
  },
  {
    id: "campus-view-dashboard",
    navId: "campus-manage",
    title: "Campus Metrics",
    description:
      "Dive into detailed engagement and karma metrics for your campus.",
    requiresRole: CAMPUS_ROLES,
    requiresFlag: (ctx) => ctx.can("campus:view_dashboard"),
  },
  manageEventsStep,
  finishStep,
];
