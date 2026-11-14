/**
 * Intern Tour Steps
 *
 * 📍 src/features/tour/steps/intern.ts
 *
 * Tour key: `intern` — Intern, Intern Lead (§5.5).
 */

import { ROLES } from "@/lib/auth/roles";
import type { TourStep } from "../types";
import { baseNavSteps, finishStep, welcomeStep } from "./shared";

export const internSteps: TourStep[] = [
  welcomeStep,
  ...baseNavSteps,
  {
    id: "intern-dashboard",
    navId: "intern-dashboard",
    title: "Intern Dashboard",
    description: "Track your internship tasks, progress, and evaluations here.",
    requiresRole: [ROLES.INTERN, ROLES.INTERN_LEAD],
  },
  finishStep,
];
