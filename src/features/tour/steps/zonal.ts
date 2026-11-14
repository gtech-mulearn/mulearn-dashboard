/**
 * Zonal Tour Steps
 *
 * 📍 src/features/tour/steps/zonal.ts
 *
 * Tour key: `zonal` — Zonal Campus Lead (§5.7).
 */

import { ROLES } from "@/lib/auth/roles";
import type { TourStep } from "../types";
import {
  baseNavSteps,
  finishStep,
  manageEventsStep,
  welcomeStep,
} from "./shared";

export const zonalSteps: TourStep[] = [
  welcomeStep,
  ...baseNavSteps,
  {
    id: "zonal-dashboard",
    navId: "zonal",
    title: "Zonal Dashboard",
    description:
      "Overview of campus and district performance across your zone.",
    requiresRole: [ROLES.ZONAL_CAMPUS_LEAD],
  },
  {
    id: "zonal-comparison",
    navId: "zonal",
    title: "Comparison Views",
    description:
      "Compare campuses and districts side by side within your zone.",
    requiresRole: [ROLES.ZONAL_CAMPUS_LEAD],
  },
  manageEventsStep,
  finishStep,
];
