"use server";

/**
 * Tour Server Actions
 *
 * 📍 src/features/tour/actions.ts
 *
 * Mirrors `src/app/(dashboard)/whats-new-actions.ts` — same cookie-backed,
 * no-backend pattern. No retry/backoff: this is a same-origin Server Action
 * write, not a network call to an external API.
 */

import { cookies } from "next/headers";
import { TOUR_COOKIE_NAME, TOUR_COOKIE_OPTIONS } from "./constants";
import {
  parseTourCookiePayload,
  serializeTourCookiePayload,
} from "./lib/cookie-payload";
import type {
  PageTourKey,
  TourCookiePayload,
  TourKey,
  TourOutcome,
} from "./types";

async function readPayload(): Promise<TourCookiePayload> {
  const store = await cookies();
  return parseTourCookiePayload(store.get(TOUR_COOKIE_NAME)?.value);
}

export async function getTourState(): Promise<TourCookiePayload> {
  return readPayload();
}

/**
 * `version` is passed explicitly (rather than looked up here) so this same
 * action serves both home tours (`TOUR_VERSIONS[key]`) and page tours
 * (`PageTourConfig.version`), which live in separate version maps.
 */
export async function recordTourOutcome(
  key: TourKey | PageTourKey,
  version: number,
  outcome: TourOutcome,
): Promise<void> {
  const store = await cookies();
  const current = await readPayload();
  const next: TourCookiePayload = {
    ...current,
    [key]: { version, outcome },
  };
  store.set(
    TOUR_COOKIE_NAME,
    serializeTourCookiePayload(next),
    TOUR_COOKIE_OPTIONS,
  );
}

export async function clearTourCookie(): Promise<void> {
  const store = await cookies();
  store.delete({
    name: TOUR_COOKIE_NAME,
    httpOnly: true,
    secure: TOUR_COOKIE_OPTIONS.secure,
    sameSite: TOUR_COOKIE_OPTIONS.sameSite,
    path: TOUR_COOKIE_OPTIONS.path,
  });
}
