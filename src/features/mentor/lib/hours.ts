/**
 * Mentor weekly availability ("hours").
 *
 * Mirrors the backend's `UserMentor.HoursCommitment` choices (release 1.91):
 * the column stores a range string, not a number. Any other value — including
 * the `0` the onboarding form used to send — is rejected with
 * `"<value>" is not a valid choice.`
 */
import { z } from "zod";

export const MENTOR_HOURS_VALUES = [
  "0-1",
  "1-2",
  "2-5",
  "5-10",
  "10+",
] as const;

export type MentorHours = (typeof MENTOR_HOURS_VALUES)[number];

export const MentorHoursSchema = z.enum(MENTOR_HOURS_VALUES);

/** Labels match the backend choice labels so every surface reads the same. */
export const MENTOR_HOURS_OPTIONS: ReadonlyArray<{
  value: MentorHours;
  label: string;
}> = MENTOR_HOURS_VALUES.map((value) => ({ value, label: `${value} hours` }));

/** A stored value as a valid range, or `undefined` (unset or pre-1.91 number). */
export function toMentorHours(value: unknown): MentorHours | undefined {
  const parsed = MentorHoursSchema.safeParse(value);
  return parsed.success ? parsed.data : undefined;
}

/**
 * Display label for a stored hours value, or `null` when there is nothing
 * meaningful to show (unset, or a pre-1.91 numeric value).
 */
export function formatMentorHours(value: unknown): string | null {
  const hours = toMentorHours(value);
  return hours ? `${hours} hours` : null;
}
