/**
 * Step Resolution
 *
 * 📍 src/features/tour/lib/build-steps.ts
 */

import { ROLES } from "@/lib/auth/roles";
import type { TourStep, TourStepContext } from "../types";

/**
 * `navId`s that render locked (nav-config visible, but disabled) for an
 * unverified Company account — mirrors `isRestrictedCompanyFeature` in
 * `src/components/dashboard/app-sidebar.tsx:75-84`. The tour must skip
 * these instead of spotlighting a disabled link.
 */
const COMPANY_RESTRICTED_NAV_IDS = new Set([
  "talent-pool",
  "company-jobs",
  "company-tasks",
  "company-mentors",
  "company-ig-requests",
  "company-analytics",
]);

export function buildSteps(
  allSteps: readonly TourStep[],
  ctx: TourStepContext,
): TourStep[] {
  const isCompany = ctx.roles.includes(ROLES.COMPANY);
  const isRestrictedCompany = isCompany && !ctx.isCompanyVerified;

  return allSteps.filter((step) => {
    if (
      isRestrictedCompany &&
      step.navId &&
      COMPANY_RESTRICTED_NAV_IDS.has(step.navId)
    ) {
      return false;
    }
    if (
      step.requiresRole &&
      !step.requiresRole.some((r) => ctx.roles.includes(r))
    ) {
      return false;
    }
    if (step.requiresFlag && !step.requiresFlag(ctx)) return false;
    return true;
  });
}
