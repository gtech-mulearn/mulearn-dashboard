/**
 * Page Tour Registry
 *
 * 📍 src/features/tour/lib/page-tour-registry.ts
 *
 * One entry per route that has an in-page tour, keyed by exact pathname.
 * Each entry's `steps` come from `src/features/tour/steps/pages/*` — new
 * page tours are added by importing their config here, not by editing
 * consumers of this registry (`usePageTour`, `useReplayPageTour`).
 *
 * `/dashboard` is intentionally never a key here — that route is owned by
 * the sidebar-shell home tour (`TOUR_STEP_REGISTRY`/`useTour`).
 */

import { campusPageTours } from "../steps/pages/campus";
import { companyPageTours } from "../steps/pages/company";
import { igLeadPageTours } from "../steps/pages/ig-lead";
import { internPageTours } from "../steps/pages/intern";
import { mentorPageTours } from "../steps/pages/mentor";
import { studentPageTours } from "../steps/pages/student";
import type { PageTourConfig } from "../types";

const ALL_PAGE_TOURS: readonly PageTourConfig[] = [
  ...studentPageTours,
  ...mentorPageTours,
  ...companyPageTours,
  ...igLeadPageTours,
  ...internPageTours,
  ...campusPageTours,
];

export const PAGE_TOUR_REGISTRY: Record<string, PageTourConfig> =
  Object.fromEntries(ALL_PAGE_TOURS.map((c) => [c.route, c]));
