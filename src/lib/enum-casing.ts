import { z } from "zod";

/**
 * z.enum that upper-cases its input first. Backend enums are stored in
 * case-insensitive MySQL columns and some rows predate a casing change, so
 * "ig_session" and "IG_SESSION" must both read as the same value.
 */
export function upperEnum<T extends readonly [string, ...string[]]>(values: T) {
  return z.preprocess(
    (value) => (typeof value === "string" ? value.toUpperCase() : value),
    z.enum(values),
  );
}

const SESSION_TYPE_LABELS: Record<string, string> = {
  IG_SESSION: "Interest group",
  CAMPUS_SESSION: "Campus",
  COMPANY_SESSION: "Company",
};

/** "Company" for COMPANY_SESSION (any casing); "Session" when unknown. */
export function formatSessionType(type: string | null | undefined): string {
  if (!type) return "Session";
  return SESSION_TYPE_LABELS[type.toUpperCase()] ?? "Session";
}
