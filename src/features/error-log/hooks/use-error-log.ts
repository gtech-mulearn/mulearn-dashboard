/**
 * Error Log Query Hook
 *
 * 📍 src/features/error-log/hooks/use-error-log.ts
 *
 * Fetches all error log entries and transforms them (raw → display)
 * inside TanStack Query's `select` option — NOT in the API layer.
 */

"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchErrorLog } from "../api";
import type { ErrorLogEntry, ErrorLogRawEntry } from "../schemas";
import { transformErrorLogEntry } from "../schemas";
import { errorLogKeys } from "./query-keys";

/**
 * Fetches all error log entries.
 * The raw nested API shape (timestamp number[], auth[]) is flattened
 * into display-ready ErrorLogEntry objects via `select`.
 */
export function useErrorLog() {
  return useQuery({
    queryKey: errorLogKeys.list(),
    queryFn: fetchErrorLog,
    select: (raw: ErrorLogRawEntry[]): ErrorLogEntry[] =>
      raw.map(transformErrorLogEntry),
    staleTime: 60 * 1000, // 1 minute — error logs don't change that often
  });
}
