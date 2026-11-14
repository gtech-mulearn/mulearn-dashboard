"use client";

/**
 * TourController
 *
 * 📍 src/features/tour/components/tour-controller.tsx
 *
 * Mounted once in the dashboard layout. Renders nothing itself — driver.js
 * manages its own overlay DOM; this just wires up the launch-condition hook.
 */

import { usePageTour, useTour } from "../hooks/use-tour";
import type { TourCookiePayload } from "../types";

interface TourControllerProps {
  initialState: TourCookiePayload;
  /** True while a blocking overlay (e.g. What's New) is open. */
  blocked?: boolean;
}

/**
 * Mounts both the sidebar-shell home tour (fires once, on `/dashboard`) and
 * the in-page tour (fires per-route, on whatever page has a
 * `PAGE_TOUR_REGISTRY` entry) off the same cookie payload. `useTour`'s
 * `isAnyTourActive()` guard keeps them from ever overlapping.
 */
export function TourController({ initialState, blocked }: TourControllerProps) {
  useTour({ initialState, blocked });
  usePageTour({ initialState, blocked });
  return null;
}
