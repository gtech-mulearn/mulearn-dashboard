/**
 * Tour Constants
 *
 * 📍 src/features/tour/constants.ts
 */

import type { TourKey } from "./types";

/**
 * Bump the relevant key to force a full replay for every user whose stored
 * cookie version is lower (e.g. after a step-list content change).
 */
export const TOUR_VERSIONS: Record<TourKey, number> = {
  dashboard: 1,
  intern: 1,
  campus: 1,
  zonal: 1,
  district: 1,
  mentor: 1,
  company: 1,
};

export const TOUR_COOKIE_NAME = "mulearn-tour";

/** One entry for all page tours: skipping or finishing any page tour stops them all. */
export const PAGE_TOURS_SKIP_KEY = "page:*" as const;

/** Mirrors `whats-new-actions.ts`'s `COOKIE_OPTIONS` shape exactly. */
export const TOUR_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 365,
};
