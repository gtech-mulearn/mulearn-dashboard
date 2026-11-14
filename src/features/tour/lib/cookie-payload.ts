/**
 * Tour Cookie Payload — parse/serialize
 *
 * 📍 src/features/tour/lib/cookie-payload.ts
 *
 * Pure functions, kept separate from `actions.ts` (the `"use server"`
 * boundary) so they're testable without mocking `next/headers`.
 */

import type { TourCookiePayload } from "../types";

export function parseTourCookiePayload(
  raw: string | undefined,
): TourCookiePayload {
  if (!raw) return {};
  try {
    return JSON.parse(raw) as TourCookiePayload;
  } catch {
    return {}; // corrupt/tampered cookie -> treat as never-seen, never throw
  }
}

export function serializeTourCookiePayload(payload: TourCookiePayload): string {
  return JSON.stringify(payload);
}
