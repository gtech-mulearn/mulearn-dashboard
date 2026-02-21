/**
 * Error Log API Functions
 *
 * 📍 src/features/error-log/api/error-log.api.ts
 *
 * Raw fetch functions only — no data transformation here.
 * Transformation (timestamp formatting, auth flatten) is done
 * in useQuery `select` via transformErrorLogEntry().
 *
 * Rules followed:
 * - No `any` types
 * - No toast — handled by mutation callbacks
 * - No .then().catch() chains — async/await only
 * - downloadLogFile uses apiClient's native blob support (responseType: "blob")
 * - No DOM manipulation for blob download
 */

import type { z } from "zod";
import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import {
  EmptyResponseSchema,
  ErrorLogListResponseSchema,
  type ErrorLogRawEntry,
  type LogType,
} from "../schemas";

// ============================================
// Helper: extract inner payload (same pattern as dynamic-type)
// ============================================

function extractAndValidate<T>(raw: unknown, innerSchema: z.ZodType<T>): T {
  // 1. Direct parse
  const direct = innerSchema.safeParse(raw);
  if (direct.success) return direct.data;

  if (raw && typeof raw === "object") {
    const obj = raw as Record<string, unknown>;

    // 2. { data: [...] }
    if ("data" in obj) {
      const fromData = innerSchema.safeParse(obj.data);
      if (fromData.success) return fromData.data;
    }

    // 3. { response: [...] }
    if ("response" in obj) {
      const fromResponse = innerSchema.safeParse(obj.response);
      if (fromResponse.success) return fromResponse.data;
    }
  }

  console.error("❌ Error-log inner schema mismatch", {
    received: raw,
    directError: direct.error?.format(),
  });
  throw new Error("Unexpected API response shape from error-log endpoint");
}

// ============================================
// Fetch all error log entries (raw, unflattened)
// ============================================

export async function fetchErrorLog(): Promise<ErrorLogRawEntry[]> {
  const data = await apiClient.get(endpoints.admin.errorLog.list);
  return extractAndValidate(data, ErrorLogListResponseSchema);
}

// ============================================
// Download a log file as a Blob
// ============================================

/**
 * Returns the raw Blob for the given log type.
 * The caller (mutation hook) is responsible for triggering the browser download
 * using downloadBlob() utility.
 */
export async function downloadLogFile(type: LogType): Promise<Blob> {
  return apiClient.get<Blob>(
    endpoints.admin.errorLog.download(type),
    undefined,
    { responseType: "blob" },
  );
}

// ============================================
// Clear all logs of a given type
// ============================================

export async function clearLog(type: LogType): Promise<void> {
  await apiClient.post(
    endpoints.admin.errorLog.clear(type),
    {},
    EmptyResponseSchema,
  );
}

// ============================================
// Dismiss / delete a single log entry
// ============================================

export async function dismissLogEntry(id: string): Promise<void> {
  await apiClient.patch(
    endpoints.admin.errorLog.dismiss(id),
    {},
    EmptyResponseSchema,
  );
}
