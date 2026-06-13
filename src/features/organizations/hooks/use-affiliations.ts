"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createAffiliation,
  deleteAffiliation,
  editAffiliation,
  fetchAffiliationList,
  type FetchAffiliationsParams,
} from "../api/affiliations.api";

// ─── Query Keys ───────────────────────────────────────────────────────────────

const affiliationsManagementKeys = {
  all: ["affiliations-management"] as const,
  lists: () => [...affiliationsManagementKeys.all, "list"] as const,
  list: (params: FetchAffiliationsParams) =>
    [...affiliationsManagementKeys.lists(), params] as const,
};

// ─── List ─────────────────────────────────────────────────────────────────────

export function useAffiliationList(params: FetchAffiliationsParams) {
  return useQuery({
    queryKey: affiliationsManagementKeys.list(params),
    queryFn: () => fetchAffiliationList(params),
    placeholderData: keepPreviousData,
    staleTime: 2 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

// ─── Create ───────────────────────────────────────────────────────────────────

export function useCreateAffiliation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (title: string) => createAffiliation(title),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: affiliationsManagementKeys.lists(),
      });
      // Also invalidate the dropdown cache used by organizations form
      queryClient.invalidateQueries({
        queryKey: ["organizations", "affiliations"],
      });
      toast.success("Affiliation created successfully.");
    },
    onError: (err: Error) => {
      toast.error(err.message ?? "Failed to create affiliation.");
    },
  });
}

// ─── Edit ─────────────────────────────────────────────────────────────────────

export function useEditAffiliation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) =>
      editAffiliation(id, title),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: affiliationsManagementKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: ["organizations", "affiliations"],
      });
      toast.success("Affiliation updated successfully.");
    },
    onError: (err: Error) => {
      toast.error(err.message ?? "Failed to update affiliation.");
    },
  });
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export function useDeleteAffiliation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteAffiliation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: affiliationsManagementKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: ["organizations", "affiliations"],
      });
      toast.success("Affiliation deleted successfully.");
    },
    onError: (err: Error) => {
      toast.error(err.message ?? "Failed to delete affiliation.");
    },
  });
}
