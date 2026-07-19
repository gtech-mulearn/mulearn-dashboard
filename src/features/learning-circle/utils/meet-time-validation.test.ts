/**
 * Meet-Time Validation — Unit Tests
 *
 * 📍 src/features/learning-circle/utils/meet-time-validation.test.ts
 *
 * Covers every exported function including the boundary conditions called out
 * in the P2 review: exact buffer edge, one-minute under, NaN strings, and the
 * local-offset arithmetic inside getMinDateTimeLocalValue.
 *
 * Strategy: `vi.useFakeTimers` pins `Date.now()` to a known epoch so every
 * assertion is deterministic regardless of when the test suite runs.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  getEarliestAllowedMs,
  getMeetTimeErrorMessage,
  getMinDateTimeLocalValue,
  isMeetTimeValid,
  MIN_BUFFER_MINUTES,
} from "./meet-time-validation";

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Returns a UTC ISO string for `now + offsetMs` using the faked clock. */
function isoAt(offsetMs: number): string {
  return new Date(Date.now() + offsetMs).toISOString();
}

const BUFFER_MS = MIN_BUFFER_MINUTES * 60_000;

// ─── Test suite ─────────────────────────────────────────────────────────────

describe("meet-time-validation", () => {
  // Pin the clock to a fixed UTC instant so assertions never depend on wall time.
  // Chosen arbitrarily; must not be midnight to avoid date-rollover edge cases.
  const FIXED_NOW = new Date("2026-07-17T10:00:00.000Z").getTime();

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(FIXED_NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ── MIN_BUFFER_MINUTES ───────────────────────────────────────────────────

  describe("MIN_BUFFER_MINUTES", () => {
    it("is 1 (product decision 2026-07-18)", () => {
      expect(MIN_BUFFER_MINUTES).toBe(1);
    });
  });

  // ── getEarliestAllowedMs ─────────────────────────────────────────────────

  describe("getEarliestAllowedMs()", () => {
    it("returns Date.now() + 1 minute in milliseconds", () => {
      expect(getEarliestAllowedMs()).toBe(FIXED_NOW + BUFFER_MS);
    });

    it("recomputes on each call (not cached at module load)", () => {
      const first = getEarliestAllowedMs();
      vi.advanceTimersByTime(60_000); // advance 1 minute
      const second = getEarliestAllowedMs();
      expect(second).toBe(first + 60_000);
    });
  });

  // ── isMeetTimeValid ──────────────────────────────────────────────────────

  describe("isMeetTimeValid()", () => {
    it("returns true for a time well in the future (now + 30 min)", () => {
      expect(isMeetTimeValid(isoAt(30 * 60_000))).toBe(true);
    });

    it("returns true when meet_time is exactly at the 1-minute boundary", () => {
      // meet_time === getEarliestAllowedMs()  →  >= check passes
      expect(isMeetTimeValid(isoAt(BUFFER_MS))).toBe(true);
    });

    it("returns false when meet_time is 1 ms before the boundary", () => {
      expect(isMeetTimeValid(isoAt(BUFFER_MS - 1))).toBe(false);
    });

    it("returns false for a time 30 seconds from now (just under buffer)", () => {
      expect(isMeetTimeValid(isoAt(30 * 1000))).toBe(false);
    });

    it("returns false for current time (0 offset)", () => {
      expect(isMeetTimeValid(isoAt(0))).toBe(false);
    });

    it("returns false for a past time", () => {
      expect(isMeetTimeValid(isoAt(-60 * 60_000))).toBe(false);
    });

    it("returns false for an empty string (NaN date)", () => {
      expect(isMeetTimeValid("")).toBe(false);
    });

    it("returns false for a non-date string (NaN date)", () => {
      expect(isMeetTimeValid("not-a-date")).toBe(false);
    });

    it("returns false for a completely invalid ISO-like string", () => {
      expect(isMeetTimeValid("9999-99-99T99:99:99.000Z")).toBe(false);
    });
  });

  // ── getMeetTimeErrorMessage ──────────────────────────────────────────────

  describe("getMeetTimeErrorMessage()", () => {
    it("mentions the buffer duration so the user knows the constraint", () => {
      expect(getMeetTimeErrorMessage()).toContain(String(MIN_BUFFER_MINUTES));
    });

    it("returns the exact expected message string with proper grammar", () => {
      expect(getMeetTimeErrorMessage()).toBe(
        `Meeting time must be at least 1 minute in the future`,
      );
    });
  });

  // ── getMinDateTimeLocalValue ─────────────────────────────────────────────

  describe("getMinDateTimeLocalValue()", () => {
    it('returns a string in "YYYY-MM-DDTHH:mm" format (16 chars, no seconds)', () => {
      const result = getMinDateTimeLocalValue();
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
    });

    it("represents exactly now + 1 min shifted to local time", () => {
      // Compute the expected value independently using the same algorithm
      // so we verify the implementation without just re-implementing it.
      const earliestMs = FIXED_NOW + BUFFER_MS;
      const d = new Date(earliestMs);
      const localDate = new Date(d.getTime() - d.getTimezoneOffset() * 60_000);
      const expected = localDate.toISOString().slice(0, 16);

      expect(getMinDateTimeLocalValue()).toBe(expected);
    });

    it("advances by 1 minute when the clock advances by 1 minute", () => {
      const before = getMinDateTimeLocalValue();
      vi.advanceTimersByTime(60_000);
      const after = getMinDateTimeLocalValue();

      // Parse both values back to epoch ms (treating them as UTC for comparison)
      const beforeMs = new Date(`${before}:00Z`).getTime();
      const afterMs = new Date(`${after}:00Z`).getTime();

      // Should differ by exactly 60 s (minute-precision strings, so ±1 min tolerance)
      expect(afterMs - beforeMs).toBeGreaterThanOrEqual(60_000 - 1000);
      expect(afterMs - beforeMs).toBeLessThanOrEqual(60_000 + 1000);
    });
  });
});
