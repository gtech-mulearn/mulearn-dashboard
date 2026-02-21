/**
 * Error Log Schemas
 *
 * 📍 src/features/error-log/schemas/error-log.schema.ts
 *
 * Zod schemas for the System Error Log feature.
 *
 * The raw API response has:
 *   - timestamp: string[] (array of ISO datetime strings for multiple occurrences)
 *   - auth: { muid: string }[] (optional)
 *   - type, message, method, path: string[] (single-element arrays)
 *   - body, traceback: unknown[] (optional additional data)
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
  /** Backend returns as single-element array ["error"] */
  type: z.union([z.string(), z.array(z.string())]),
  /** Backend returns as single-element array ["message text"] */
  message: z.union([z.string(), z.array(z.string())]),
  /** Backend returns as single-element array ["GET"] */
  method: z.union([z.string(), z.array(z.string())]),
  /** Backend returns as single-element array ["/api/path"] */
  path: z.union([z.string(), z.array(z.string())]),
  /** Array of ISO datetime strings (multiple occurrences) */
  timestamp: z.array(z.string()),
  /** Authenticated users associated with the request */
  auth: z
    .array(z.object({ muid: z.string() }))
    .optional()
    .default([]),
  /** Request body data (optional) */
  body: z.unknown().optional(),
  /** Stack trace data (optional) */
  traceback: z.unknown().optional(),
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
 * Convert ISO timestamp array to a human-readable string.
 * Takes the first (most recent) timestamp from the array.
 * Array format: ["2026-02-21T10:20:22.010000", ...]
 */
export function formatTimestamp(timestamps: string[]): string {
  if (!timestamps || timestamps.length === 0) return "—";

  try {
    const isoString = timestamps[0];
    const date = new Date(isoString);

    return date.toLocaleString("en-IN", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  } catch {
    return "—";
  }
}

/**
 * Helper: extract string from string or single-element array
 */
function extractString(value: string | string[]): string {
  return Array.isArray(value) ? value[0] || "—" : value;
}

/**
 * Transform a raw API entry into the flat display shape.
 * Called in useQuery `select` — never in the API layer.
 */
export function transformErrorLogEntry(raw: ErrorLogRawEntry): ErrorLogEntry {
  return {
    id: raw.id,
    type: extractString(raw.type),
    message: extractString(raw.message),
    method: extractString(raw.method),
    path: extractString(raw.path),
    timestamp: formatTimestamp(raw.timestamp),
    muid: raw.auth?.map((a) => a.muid).join(", ") || "—",
  };
}
