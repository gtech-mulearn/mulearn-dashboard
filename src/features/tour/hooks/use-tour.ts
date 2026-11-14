"use client";

/**
 * useTour
 *
 * 📍 src/features/tour/hooks/use-tour.ts
 *
 * Core launch/skip/complete logic (§6.1, §7.6 of docs/features/tour.md).
 * Reuses the same client-side hooks `useFilteredNav`/`app-sidebar.tsx`
 * already use for role/verification state, instead of re-deriving it —
 * mentor/company verification live behind their own queries, not on the
 * server-fetched user object.
 */

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSidebar } from "@/components/ui/sidebar";
import { useUserInfo } from "@/features/auth";
import { useCompanyProfile } from "@/features/company-jobs/hooks";
import { useMentorApplicationStatus } from "@/features/mentor/onboarding/hooks/use-onboarding";
import { useFilteredNav } from "@/hooks/use-filtered-nav";
import { usePermissions } from "@/hooks/use-permissions";
import { ROLES } from "@/lib/auth/roles";
import { recordTourOutcome } from "../actions";
import { TOUR_VERSIONS } from "../constants";
import { buildSteps } from "../lib/build-steps";
import { isAnyTourActive, launchDriver } from "../lib/driver-adapter";
import { PAGE_TOUR_REGISTRY } from "../lib/page-tour-registry";
import { resolveTourKey, TOUR_HOME_ROUTE } from "../lib/resolve-tour-key";
import { TOUR_STEP_REGISTRY } from "../lib/step-registry";
import { waitForMobileSheet } from "../lib/wait-for-sheet";
import type {
  PageTourKey,
  TourCookiePayload,
  TourKey,
  TourOutcome,
  TourStep,
  TourStepContext,
} from "../types";

/**
 * Shared role/verification-derived context, used by both the auto-launch
 * hook and the manual-replay hook so they resolve the exact same tour key
 * and step list without duplicating the mentor/company query wiring.
 */
function useTourResolution() {
  const { data: user } = useUserInfo();
  const { can, roles, hasRole } = usePermissions();

  const isMentor = hasRole([ROLES.MENTOR]);
  const { data: mentorStatus } = useMentorApplicationStatus(isMentor);
  const isMentorVerified = isMentor && mentorStatus?.status === "APPROVED";

  const isCompany = hasRole([ROLES.COMPANY]);
  const { profile: companyProfile } = useCompanyProfile({
    enabled: isCompany,
  });
  const isCompanyVerified = companyProfile?.status === "verified";

  const tourKey: TourKey | null = user ? resolveTourKey(user.roles) : null;

  const ctx: TourStepContext = useMemo(
    () => ({ roles, can, isMentorVerified, isCompanyVerified }),
    [roles, can, isMentorVerified, isCompanyVerified],
  );

  return { user, tourKey, ctx };
}

/**
 * Same source of truth `AppSidebar` renders from — a step whose `navId`
 * isn't in this set has no nav item for this user (role/company-gated out)
 * and must be dropped, independent of the sidebar's open/collapsed state.
 */
function useVisibleNavIds() {
  const { mainItems, managementItems, bottomItems } = useFilteredNav();
  return useMemo(
    () =>
      new Set(
        [...mainItems, ...managementItems, ...bottomItems].map((i) => i.id),
      ),
    [mainItems, managementItems, bottomItems],
  );
}

function useCommitOutcome() {
  return useCallback(
    async (
      key: TourKey | PageTourKey,
      version: number,
      outcome: TourOutcome,
    ) => {
      await recordTourOutcome(key, version, outcome);
    },
    [],
  );
}

/**
 * Mobile-only: open/close the off-canvas sidebar sheet to match whatever
 * step is being shown next, waiting for it to visually settle before
 * driver.js measures the target. No-op on desktop, where the sidebar is
 * always on-screen and every step's element is already reachable.
 */
function useMobileStepPreparer() {
  const { isMobile, openMobile, setOpenMobile } = useSidebar();
  const isMobileRef = useRef(isMobile);
  const openMobileRef = useRef(openMobile);
  const openedByTourRef = useRef(false);

  useEffect(() => {
    isMobileRef.current = isMobile;
  }, [isMobile]);
  useEffect(() => {
    openMobileRef.current = openMobile;
  }, [openMobile]);

  const prepareStep = useCallback(
    async (step: TourStep) => {
      if (!isMobileRef.current) return;
      const needsSidebar = !step.centered;

      if (needsSidebar) {
        if (!openMobileRef.current) {
          openedByTourRef.current = true;
          setOpenMobile(true);
        }
        await waitForMobileSheet(true);
      } else if (openMobileRef.current && openedByTourRef.current) {
        openedByTourRef.current = false;
        setOpenMobile(false);
        await waitForMobileSheet(false);
      }
    },
    [setOpenMobile],
  );

  return prepareStep;
}

interface UseTourOptions {
  initialState: TourCookiePayload;
  /**
   * True while a blocking overlay (e.g. the What's New popup) is open.
   * Kept as an explicit dep — rather than a one-off DOM query at effect-run
   * time — so closing that overlay re-fires this effect and the tour
   * launches right after, instead of never launching this session.
   */
  blocked?: boolean;
}

/**
 * Auto-launch hook — mount exactly once (in `TourController`, itself
 * mounted once in the dashboard layout). A second mounted instance would
 * run a second, independent launch effect and double-init driver.js.
 */
export function useTour({ initialState, blocked = false }: UseTourOptions) {
  const pathname = usePathname();
  const { user, tourKey, ctx } = useTourResolution();
  const visibleNavIds = useVisibleNavIds();
  const prepareStep = useMobileStepPreparer();

  const [state, setState] = useState<TourCookiePayload>(initialState);
  const hasLaunchedRef = useRef(false);

  const commitOutcomeBase = useCommitOutcome();
  const commitOutcome = useCallback(
    async (key: TourKey, outcome: TourOutcome) => {
      setState((prev) => ({
        ...prev,
        [key]: { version: TOUR_VERSIONS[key], outcome },
      }));
      await commitOutcomeBase(key, TOUR_VERSIONS[key], outcome);
    },
    [commitOutcomeBase],
  );

  useEffect(() => {
    if (!tourKey || hasLaunchedRef.current || !user) return;
    if (pathname !== TOUR_HOME_ROUTE[tourKey]) return;
    if (blocked) return;
    // Radix primitives (used throughout this codebase) set this attribute.
    if (document.querySelector('[role="dialog"][data-state="open"]')) return;
    if (isAnyTourActive()) return;

    const seen = state[tourKey];
    if (seen && seen.version >= TOUR_VERSIONS[tourKey]) return;

    const resolvedSteps = buildSteps(TOUR_STEP_REGISTRY[tourKey], ctx).filter(
      (s) => {
        if (s.centered) return true;
        if (s.navId) return visibleNavIds.has(s.navId);
        if (s.elementId) {
          return !!document.querySelector(`[data-tour-id="${s.elementId}"]`);
        }
        return false;
      },
    );
    if (resolvedSteps.length === 0) return;

    hasLaunchedRef.current = true;
    launchDriver(resolvedSteps, {
      onSkip: () => void commitOutcome(tourKey, "skipped"),
      onComplete: () => void commitOutcome(tourKey, "completed"),
      prepareStep,
    });
  }, [
    tourKey,
    pathname,
    state,
    user,
    ctx,
    visibleNavIds,
    commitOutcome,
    blocked,
    prepareStep,
  ]);

  return { tourKey };
}

/**
 * Manual-replay hook — used by `ReplayTourButton`. Independent of `useTour`
 * (no shared state, no launch effect) so mounting it alongside the
 * auto-launch controller never causes a double `driver.js` init; it always
 * launches the full current-version step list, ignoring the stored cookie
 * version (§6.3), and only writes the cookie on Finish.
 */
export function useReplayTour() {
  const { tourKey, ctx } = useTourResolution();
  const visibleNavIds = useVisibleNavIds();
  const prepareStep = useMobileStepPreparer();
  const commitOutcome = useCommitOutcome();

  const replay = useCallback(() => {
    if (!tourKey) return;
    const resolvedSteps = buildSteps(TOUR_STEP_REGISTRY[tourKey], ctx).filter(
      (s) => {
        if (s.centered) return true;
        if (s.navId) return visibleNavIds.has(s.navId);
        if (s.elementId) {
          return !!document.querySelector(`[data-tour-id="${s.elementId}"]`);
        }
        return false;
      },
    );
    if (resolvedSteps.length === 0) return;

    launchDriver(resolvedSteps, {
      // Manual replay must not write the cookie unless Finish is reached
      // (§6.3) — an abandoned replay must not suppress an auto tour that
      // hadn't fired yet.
      onSkip: () => {},
      onComplete: () =>
        void commitOutcome(tourKey, TOUR_VERSIONS[tourKey], "completed"),
      prepareStep,
    });
  }, [tourKey, ctx, visibleNavIds, commitOutcome, prepareStep]);

  return { replay, canReplay: !!tourKey };
}

/**
 * Auto-launch hook for in-page tours — mirrors `useTour` but keys off the
 * current pathname against `PAGE_TOUR_REGISTRY` instead of role -> tour key,
 * and targets page-body elements (`elementId`) rather than sidebar nav
 * items. Mounted once alongside `useTour` in `TourController`; a route
 * change re-runs the effect (new `pathname`) rather than remounting.
 *
 * No mobile-sidebar-sheet prep here — page-tour targets live in page
 * content, which is on-screen regardless of sidebar open/collapsed state.
 */
export function usePageTour({ initialState, blocked = false }: UseTourOptions) {
  const pathname = usePathname();
  const { user, ctx } = useTourResolution();

  const [state, setState] = useState<TourCookiePayload>(initialState);
  const launchedForPathRef = useRef<string | null>(null);

  const commitOutcomeBase = useCommitOutcome();
  const commitOutcome = useCallback(
    async (key: PageTourKey, version: number, outcome: TourOutcome) => {
      setState((prev) => ({ ...prev, [key]: { version, outcome } }));
      await commitOutcomeBase(key, version, outcome);
    },
    [commitOutcomeBase],
  );

  useEffect(() => {
    const config = PAGE_TOUR_REGISTRY[pathname];
    if (!config || !user) return;
    if (launchedForPathRef.current === pathname) return;
    if (blocked) return;
    if (document.querySelector('[role="dialog"][data-state="open"]')) return;
    if (isAnyTourActive()) return;

    const key: PageTourKey = `page:${pathname}`;
    const seen = state[key];
    if (seen && seen.version >= config.version) return;

    const resolvedSteps = buildSteps(config.steps, ctx).filter((s) => {
      if (s.centered) return true;
      const selector = s.navId ?? s.elementId;
      return (
        !!selector && !!document.querySelector(`[data-tour-id="${selector}"]`)
      );
    });
    if (resolvedSteps.length === 0) return;

    launchedForPathRef.current = pathname;
    launchDriver(resolvedSteps, {
      onSkip: () => void commitOutcome(key, config.version, "skipped"),
      onComplete: () => void commitOutcome(key, config.version, "completed"),
    });
  }, [pathname, user, ctx, state, blocked, commitOutcome]);
}

/**
 * Manual "Tour this page" trigger — same ignore-cookie-version, only-write-
 * on-Finish contract as `useReplayTour`, scoped to whatever page config
 * matches the current pathname.
 */
export function useReplayPageTour() {
  const pathname = usePathname();
  const { user, ctx } = useTourResolution();
  const commitOutcome = useCommitOutcome();

  const config = PAGE_TOUR_REGISTRY[pathname];

  const replay = useCallback(() => {
    if (!config || !user) return;
    const resolvedSteps = buildSteps(config.steps, ctx).filter((s) => {
      if (s.centered) return true;
      const selector = s.navId ?? s.elementId;
      return (
        !!selector && !!document.querySelector(`[data-tour-id="${selector}"]`)
      );
    });
    if (resolvedSteps.length === 0) return;

    const key: PageTourKey = `page:${pathname}`;
    launchDriver(resolvedSteps, {
      onSkip: () => {},
      onComplete: () => void commitOutcome(key, config.version, "completed"),
    });
  }, [config, user, ctx, pathname, commitOutcome]);

  return { replay, canReplay: !!config && !!user };
}
