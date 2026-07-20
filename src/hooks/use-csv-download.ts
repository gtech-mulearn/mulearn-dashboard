/**
 * useCsvDownload Hook
 *
 * 📍 src/hooks/use-csv-download.ts
 *
 * Shared CSV/blob download hook. Routes through the `apiClient` gateway so the
 * download benefits from the global Bearer-token attachment and the 401/403
 * token-refresh + retry flow — and throws a real `ApiError` on failure instead
 * of saving an error body as a `.csv`. Replaces the per-feature hand-rolled
 * `fetch` + anchor-click copies.
 */

"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { apiClient } from "@/api/client";
import { downloadBlob } from "@/lib/download";
import { getApiResponseError } from "@/hooks/use-get-error";

interface UseCsvDownloadReturn {
  /** Triggers the download. Rejects with an `ApiError` on failure. */
  downloadCsv: () => Promise<void>;
  isDownloading: boolean;
}

/**
 * @param path     API endpoint that returns a CSV/blob (relative to the Django base URL).
 * @param filename Name to save the downloaded file as.
 */
export function useCsvDownload(
  path: string,
  filename: string,
): UseCsvDownloadReturn {
  const [isDownloading, setIsDownloading] = useState(false);

  const downloadCsv = useCallback(async () => {
    setIsDownloading(true);
    try {
      const blob = await apiClient.get<Blob>(path, undefined, {
        responseType: "blob",
      });
      downloadBlob(blob, filename);
    } catch (error) {
      toast.error(
        getApiResponseError(error, { fallback: "Failed to download CSV" }),
      );
    } finally {
      setIsDownloading(false);
    }
  }, [path, filename]);

  return { downloadCsv, isDownloading };
}
