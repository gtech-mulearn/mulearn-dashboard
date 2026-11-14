/**
 * Tour Types
 *
 * 📍 src/features/tour/types.ts
 */

import type { Permission } from "@/lib/auth/permissions";

export type TourKey =
  | "dashboard"
  | "intern"
  | "campus"
  | "zonal"
  | "district"
  | "mentor"
  | "company";

/**
 * Key for an in-page tour, keyed by the exact pathname it runs on (e.g.
 * `"page:/dashboard/learning-circle"`). Namespaced with a `page:` prefix so
 * it can never collide with a `TourKey` in the shared cookie payload.
 */
export type PageTourKey = `page:${string}`;

export type TourOutcome = "completed" | "skipped";

export interface TourState {
  version: number;
  outcome: TourOutcome;
}

/**
 * Loosened from `Partial<Record<TourKey, TourState>>` to also hold
 * `PageTourKey` entries — both are just string keys at the JSON level, and
 * `parseTourCookiePayload`/`serializeTourCookiePayload` are already generic.
 */
export type TourCookiePayload = Partial<
  Record<TourKey | PageTourKey, TourState>
>;

/**
 * Context passed to a step's `requiresFlag` check. Mirrors what
 * `useFilteredNav`/`usePermissions` already compute client-side — the tour
 * reuses those instead of re-deriving role/verification state.
 */
export interface TourStepContext {
  roles: readonly string[];
  can: (permission: Permission) => boolean;
  isMentorVerified: boolean;
  isCompanyVerified: boolean;
}

export interface TourStep {
  /** Unique step id (used as React key / debug label, not a DOM selector). */
  id: string;
  /**
   * Matches `NAV_ITEMS[].id` from `src/lib/nav-config.ts` — used by the
   * sidebar-shell (home) tours, whose targets are always nav links.
   */
  navId?: string;
  /**
   * Matches a `data-tour-id` attribute on an in-page element — used by
   * page tours, whose targets live in page content rather than the sidebar.
   * Exactly one of `navId`/`elementId` should be set (unless `centered`).
   */
  elementId?: string;
  title: string;
  description: string;
  /** Visible only if the user holds at least one of these roles. */
  requiresRole?: readonly string[];
  /** Visible only if this returns true. Evaluated in addition to `requiresRole`. */
  requiresFlag?: (ctx: TourStepContext) => boolean;
  /**
   * No sidebar element is highlighted — shown as a plain centered card over
   * whatever page it launches on (welcome/finish bookends). On mobile this
   * also means the off-canvas sidebar sheet is kept/left closed for it,
   * rather than opened just to point at the Home icon.
   */
  centered?: boolean;
}

/**
 * One page tour's full definition — route it launches on, its steps, and a
 * version to bump when step content changes materially (mirrors
 * `TOUR_VERSIONS` for home tours, but scoped per page instead of per role).
 */
export interface PageTourConfig {
  /** Exact pathname this tour launches on (e.g. `"/dashboard/learning-circle"`). */
  route: string;
  version: number;
  steps: readonly TourStep[];
}
