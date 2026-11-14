/**
 * District Tour Steps
 *
 * 📍 src/features/tour/steps/district.ts
 *
 * Tour key: `district` — District Campus Lead (§5.8).
 */

import { ROLES } from "@/lib/auth/roles";
import type { TourStep } from "../types";
import {
  baseNavSteps,
  finishStep,
  manageEventsStep,
  welcomeStep,
} from "./shared";

export const districtSteps: TourStep[] = [
  welcomeStep,
  ...baseNavSteps,
  {
    id: "district-dashboard",
    navId: "district",
    title: "District Dashboard",
    description:
      "See campus performance and activity across your entire district.",
    requiresRole: [ROLES.DISTRICT_CAMPUS_LEAD],
  },
  manageEventsStep,
  finishStep,
];
