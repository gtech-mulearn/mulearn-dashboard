/**
 * Error Log Schemas
 *
 * 📍 src/features/error-log/schemas/error-log.schema.ts
 *
 * Zod schemas for the System Error Log feature.
 *
 * The raw API response has:
 *   - timestamp: number[]  (UTC parts: [year, month, day, hour, min, sec, ...])
 *   - auth: { muid: string }[]
 *
 * Flattening happens in useQuery `select`, NOT in the API layer.
 */

import { z } from "zod";

// ============================================
// Generic empty-response schema (for mutations)
// ============================================

export const EmptyResponseSchema = z
  .object({
    hasError: z.boolean().optional(),
    statusCode: z.number().optional(),
    message: z.unknown().optional(),
    data: z.unknown().optional(),
    response: z.unknown().optional(),
  })
  .passthrough();

// ============================================
// Log type literal
// ============================================

export const LogTypeSchema = z.enum(["error", "root", "request"]);
export type LogType = z.infer<typeof LogTypeSchema>;

// ============================================
// Raw API entry (nested timestamp + auth)
// ============================================

export const ErrorLogRawEntrySchema = z.object({
  id: z.string(),
  type: z.string(),
  message: z.string(),
  method: z.string(),
  path: z.string(),
  /** UTC component array: [year, month, day, hour, minute, second, nanosecond] */
  timestamp: z.array(z.number()),
  /** Authenticated users associated with the request */
  auth: z.array(z.object({ muid: z.string() })),
});
export type ErrorLogRawEntry = z.infer<typeof ErrorLogRawEntrySchema>;

/** Full list response: array of raw entries */
export const ErrorLogListResponseSchema = z.array(ErrorLogRawEntrySchema);

// ============================================
// Flattened display entry (for table rows)
// ============================================

export const ErrorLogEntrySchema = z.object({
  id: z.string(),
  type: z.string(),
  message: z.string(),
  method: z.string(),
  path: z.string(),
  /** Human-readable date-time string */
  timestamp: z.string(),
  /** Comma-separated MUIDs from auth array */
  muid: z.string(),
});
export type ErrorLogEntry = z.infer<typeof ErrorLogEntrySchema>;

// ============================================
// Transform utility (schema layer, not API layer)
// ============================================

/**
 * Convert raw timestamp number array to a human-readable string.
 * Array format: [year, month (1-based), day, hour, minute, second, nanosecond?]
 */
export function formatTimestamp(ts: number[]): string {
  if (!ts || ts.length < 6) return "—";
  const [year, month, day, hour, minute, second] = ts;
  // month is 1-based in the Django response
  const date = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
  return date.toLocaleString("en-IN", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

/**
 * Transform a raw API entry into the flat display shape.
 * Called in useQuery `select` — never in the API layer.
 */
export function transformErrorLogEntry(raw: ErrorLogRawEntry): ErrorLogEntry {
  return {
    id: raw.id,
    type: raw.type,
    message: raw.message,
    method: raw.method,
    path: raw.path,
    timestamp: formatTimestamp(raw.timestamp),
    muid: raw.auth.map((a) => a.muid).join(", ") || "—",
  };
}
