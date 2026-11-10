import { describe, expect, it } from "vitest";
import {
  formatMentorHours,
  MENTOR_HOURS_OPTIONS,
  MentorHoursSchema,
  toMentorHours,
} from "./hours";

describe("mentor weekly hours (backend UserMentor.HoursCommitment)", () => {
  it("offers exactly the five backend ranges, in order", () => {
    expect(MENTOR_HOURS_OPTIONS.map((o) => o.value)).toEqual([
      "0-1",
      "1-2",
      "2-5",
      "5-10",
      "10+",
    ]);
  });

  it("uses the backend's display labels", () => {
    expect(MENTOR_HOURS_OPTIONS.map((o) => o.label)).toEqual([
      "0-1 hours",
      "1-2 hours",
      "2-5 hours",
      "5-10 hours",
      "10+ hours",
    ]);
  });

  it("accepts a valid range", () => {
    expect(MentorHoursSchema.parse("2-5")).toBe("2-5");
  });

  it("rejects the legacy numeric value the form used to send", () => {
    expect(MentorHoursSchema.safeParse(0).success).toBe(false);
    expect(MentorHoursSchema.safeParse("0").success).toBe(false);
  });

  it("formats a range for display", () => {
    expect(formatMentorHours("10+")).toBe("10+ hours");
  });

  it("converts a stored value to a range for form prefill", () => {
    expect(toMentorHours("5-10")).toBe("5-10");
    expect(toMentorHours(3)).toBeUndefined();
    expect(toMentorHours(null)).toBeUndefined();
  });

  it("returns null for legacy numbers and empty values", () => {
    expect(formatMentorHours(5)).toBeNull();
    expect(formatMentorHours(null)).toBeNull();
    expect(formatMentorHours(undefined)).toBeNull();
    expect(formatMentorHours("")).toBeNull();
  });
});
