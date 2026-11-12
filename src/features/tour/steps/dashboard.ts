/**
 * Dashboard Tour Steps
 *
 * 📍 src/features/tour/steps/dashboard.ts
 *
 * Tour key: `dashboard` — Student, Pre Member, Fellow, IG Lead, plain
 * Enabler (§5.1, §5.4, §5.6's Enabler note). Mentor and Company have their
 * own tour keys (`steps/mentor.ts`, `steps/company.ts`, §5.2-§5.3).
 */

import { hasIgLeadRole } from "@/lib/auth/roles";
import type { TourStep } from "../types";
import {
  baseNavSteps,
  finishStep,
  manageEventsStep,
  welcomeStep,
} from "./shared";

export const dashboardSteps: TourStep[] = [
  welcomeStep,
  ...baseNavSteps,

  // IG Lead (§5.4) — dynamic "{code} IGLead" roles, not the static IG_LEAD
  // constant, so gated via `hasIgLeadRole` rather than `requiresRole`.
  {
    id: "ig-edit",
    navId: "interest-groups",
    title: "Manage Your Interest Group",
    description: "Edit your group's details and manage its members.",
    requiresFlag: (ctx) => hasIgLeadRole(ctx.roles),
  },
  {
    id: "ig-twitches-manage",
    navId: "weekly-twitches-manage",
    title: "Manage Weekly Twitches",
    description:
      "Create and publish the weekly challenge for your Interest Group.",
    requiresFlag: (ctx) => hasIgLeadRole(ctx.roles),
  },

  manageEventsStep,
  finishStep,
];
