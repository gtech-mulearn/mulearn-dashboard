/**
 * Error Log Mutation Hooks
 *
 * 📍 src/features/error-log/hooks/use-error-log-mutations.ts
 *
 * Mutations:
 *  - useDownloadLogFile  → fetches Blob, triggers browser download
 *  - useClearLog         → POST /clear/{type}/, invalidates list, shows toast
 *  - useDismissLogEntry  → PATCH /patch/{id}, optimistic removal, shows toast
 *
 * Rules:
 *  - Toast is ONLY in onSuccess / onError callbacks — never in the API layer
 *  - Download uses Blob URL pattern (replaces DOM manipulation)
 *  - No `any` types
 */

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiResponseError } from "@/hooks/use-get-error";
import { clearLog, dismissLogEntry, downloadLogFile } from "../api";
import type { ErrorLogEntry, LogType } from "../schemas";
import { errorLogKeys } from "./query-keys";

// ============================================
// Download log file
// ============================================

/**
 * Triggers a blob download for the given log type.
 * Uses Blob URL approach instead of DOM manipulation.
 */
function triggerBlobDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function useDownloadLogFile() {
  return useMutation<Blob, Error, LogType>({
    mutationFn: downloadLogFile,
    onSuccess: (blob, type) => {
      triggerBlobDownload(blob, `${type}-log.log`);
      toast.success(`Downloaded ${type} log file`);
    },
    onError: (error: unknown, type: LogType) => {
      toast.error(
        getApiResponseError(error, {
          fallback: `Failed to download ${type} log file`,
        }),
      );
    },
  });
}

// ============================================
// Clear all logs of a given type
// ============================================

export function useClearLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (type: LogType) => clearLog(type),
    onSuccess: (_data, type: LogType) => {
      queryClient.invalidateQueries({ queryKey: errorLogKeys.list() });
      toast.success(`${capitalize(type)} logs cleared`);
    },
    onError: (error: unknown, type: LogType) => {
      toast.error(
        getApiResponseError(error, {
          fallback: `Failed to clear ${type} logs`,
        }),
      );
    },
  });
}

// ============================================
// Dismiss / delete a single log entry (optimistic)
// ============================================

export function useDismissLogEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => dismissLogEntry(id),

    // Optimistic removal from cache
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: errorLogKeys.list() });
      const previous = queryClient.getQueryData<ErrorLogEntry[]>(
        errorLogKeys.list(),
      );
      queryClient.setQueryData<ErrorLogEntry[]>(
        errorLogKeys.list(),
        (old: ErrorLogEntry[] | undefined) =>
          old?.filter((entry: ErrorLogEntry) => entry.id !== id) ?? [],
      );
      return { previous };
    },

    onError: (
      error: unknown,
      _id: string,
      context: { previous: ErrorLogEntry[] | undefined } | undefined,
    ) => {
      if (context?.previous) {
        queryClient.setQueryData(errorLogKeys.list(), context.previous);
      }
      toast.error(
        getApiResponseError(error, { fallback: "Failed to dismiss log entry" }),
      );
    },

    onSuccess: () => {
      toast.success("Log entry dismissed");
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: errorLogKeys.list() });
    },
  });
}

// ── Helpers ──────────────────────────────────────────────────
function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
