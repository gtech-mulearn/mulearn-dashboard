/**
 * Media content zones.
 *
 * Release 1.91 upper-cased `MediaContent.Zone` (NORTH / CENTRAL / SOUTH) and
 * its write serializer matches case-sensitively, so "north" is rejected with
 * `"north" is not a valid choice.`. Responses cached from before the release
 * can still carry lower-case values, so reads normalize instead of failing.
 */
import { z } from "zod";

export const ZONE_VALUES = ["NORTH", "CENTRAL", "SOUTH"] as const;

export type ContentZone = (typeof ZONE_VALUES)[number];

export const ZONE_OPTIONS: ReadonlyArray<{
  value: ContentZone;
  label: string;
}> = [
  { value: "NORTH", label: "North" },
  { value: "CENTRAL", label: "Central" },
  { value: "SOUTH", label: "South" },
];

/** A zone in the backend's casing, or `undefined` when unset or unknown. */
export function normalizeZone(value: unknown): ContentZone | undefined {
  if (typeof value !== "string") return undefined;
  const upper = value.trim().toUpperCase();
  return (ZONE_VALUES as readonly string[]).includes(upper)
    ? (upper as ContentZone)
    : undefined;
}

/** Human label for a stored zone, or `null` when there is none. */
export function zoneLabel(value: unknown): string | null {
  const zone = normalizeZone(value);
  return ZONE_OPTIONS.find((option) => option.value === zone)?.label ?? null;
}

/**
 * For forms: exactly the backend's values. The form only ever holds these
 * (prefill goes through `normalizeZone`), and a strict input type keeps
 * react-hook-form's resolver typing intact.
 */
export const ZoneWriteSchema = z.enum(ZONE_VALUES);

/** For responses: tolerates pre-1.91 lower-case values. */
export const ZoneSchema = z.preprocess(
  (value) => normalizeZone(value) ?? value,
  z.enum(ZONE_VALUES),
);
