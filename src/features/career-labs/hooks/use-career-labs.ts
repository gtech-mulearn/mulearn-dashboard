"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { getApiResponseError } from "@/hooks/use-get-error";
import {
  createHiring,
  deleteHiring,
  downloadHiringCsvBlob,
  fetchHiring,
  importHiringCsv,
  updateHiring,
} from "../api";
import type { HiringFormValues, HiringStatusFilter } from "../schemas";
import { careerLabsKeys } from "./query-keys";

interface UseHiringListParams {
  pageIndex: number;
  perPage: number;
  search: string;
  sortBy: string;
  status: HiringStatusFilter;
}

export function useHiringList(params: UseHiringListParams) {
  return useQuery({
    queryKey: careerLabsKeys.list(params),
    queryFn: () => fetchHiring(params),
    placeholderData: keepPreviousData,
    staleTime: 2 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useCreateHiring() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: HiringFormValues) => createHiring(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: careerLabsKeys.lists() });
      toast.success("Hiring posting created successfully");
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to create hiring posting",
        }),
      );
    },
  });
}

export function useUpdateHiring() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: HiringFormValues }) =>
      updateHiring(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: careerLabsKeys.lists() });
      toast.success("Hiring posting updated successfully");
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to update hiring posting",
        }),
      );
    },
  });
}

export function useDeleteHiring() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteHiring(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: careerLabsKeys.lists() });
      toast.success("Hiring posting deleted successfully");
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to delete hiring posting",
        }),
      );
    },
  });
}

export function useHiringCsvDownload() {
  const [isDownloading, setIsDownloading] = useState(false);

  const downloadCsv = useCallback(async () => {
    setIsDownloading(true);
    try {
      await downloadHiringCsvBlob();
    } finally {
      setIsDownloading(false);
    }
  }, []);

  return { downloadCsv, isDownloading };
}

export function useHiringCsvImport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => importHiringCsv(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: careerLabsKeys.lists() });
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, { fallback: "Failed to import CSV" }),
      );
    },
  });
}
