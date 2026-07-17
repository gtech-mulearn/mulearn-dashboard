/**
 * Meet-Time Validation Utilities
 *
 * 📍 src/features/learning-circle/utils/meet-time-validation.ts
 *
 * Single source of truth for the "meeting must be in the future" rule.
 *
 * ─── Why a shared util? ──────────────────────────────────────────────────────
 * The rule is enforced at two distinct Zod layers:
 *   1. CreateMeetingRequestSchema  (schemas/meeting.schema.ts)  — catches any
 *      code path that builds a CreateMeetingRequest object.
 *   2. CreateMeetingFormSchema / EditMeetingFormSchema (modal components) —
 *      gives the user immediate, field-level feedback before the API call.
 *
 * Keeping the constant and helper here means changing the buffer (e.g. from 15
 * to 30 minutes) is a single-line edit — not a multi-file search-and-replace.
 *
 * ─── Timezone safety ─────────────────────────────────────────────────────────
 * `Date.now()` is the client's UTC epoch milliseconds. `new Date(isoString)`
 * parses ISO-8601 (which the backend always emits in UTC). Both sides are UTC,
 * so timezone differences cancel out automatically.
 *
 * The frontend form uses `datetime-local` input whose value is a *local-time*
 * string (e.g. "2026-07-17T18:30"). The existing `localDateTimeToUtc()` helper
 * in each modal converts it to a proper UTC ISO string via `new Date(value)`.
 * Validation must be applied *after* that conversion — both modals do this.
 *
 * ─── Clock-tampering / direct-API bypass ─────────────────────────────────────
 * Because `Date.now()` comes from the client clock, a user with a tampered
 * clock or a direct API call can bypass this frontend check.  The Django backend
 * MUST independently validate `meet_time > now()` server-side (BUG-013 backend
 * ticket).  This layer gives UX feedback; the backend is the authoritative gate.
 */

/**
 * Minimum number of minutes a meeting must be scheduled ahead of the current
 * time.  Change this value to adjust the rule globally.
 *
 * Product decision (approved 2026-07-17): 15 minutes.
 */
export const MIN_BUFFER_MINUTES = 15;

/**
 * Returns the earliest acceptable `meet_time` as a UTC epoch timestamp (ms).
 * Recomputed on every call so it reflects the current clock, not a stale value
 * captured at module-load time.
 */
export function getEarliestAllowedMs(): number {
  return Date.now() + MIN_BUFFER_MINUTES * 60_000;
}

/**
 * True when `utcIsoString` represents a datetime that is at least
 * `MIN_BUFFER_MINUTES` ahead of the current client time.
 *
 * @param utcIsoString - A UTC ISO-8601 string, e.g. `"2026-07-17T13:15:00.000Z"`
 */
export function isMeetTimeValid(utcIsoString: string): boolean {
  const meetMs = new Date(utcIsoString).getTime();
  return !Number.isNaN(meetMs) && meetMs >= getEarliestAllowedMs();
}

/**
 * Human-readable validation error to show under the Date & Time field.
 */
export function getMeetTimeErrorMessage(): string {
  return `Meeting time must be at least ${MIN_BUFFER_MINUTES} minutes in the future`;
}

/**
 * Formats the earliest acceptable local datetime as a `datetime-local` input
 * `min` attribute value (`"YYYY-MM-DDTHH:mm"`).
 *
 * Using `datetime-local` `min` as a native browser hint (not a security gate —
 * the Zod schema is the real gate).
 */
export function getMinDateTimeLocalValue(): string {
  const d = new Date(getEarliestAllowedMs());
  // Shift to local time by subtracting the UTC-offset so .toISOString() gives
  // the local representation.
  const localDate = new Date(d.getTime() - d.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 16); // "YYYY-MM-DDTHH:mm"
}
