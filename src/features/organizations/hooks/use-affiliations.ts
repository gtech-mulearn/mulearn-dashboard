"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiResponseError } from "@/hooks/use-get-error";
import {
  createAffiliation,
  deleteAffiliation,
  fetchAffiliations,
  updateAffiliation,
} from "../api/affiliation.api";
import type { AffiliationFormValues } from "../schemas/affiliation.schema";
import { affiliationKeys } from "./query-keys";

interface UseAffiliationsListParams {
  pageIndex: number;
  perPage: number;
  search: string;
  sortBy: string;
}

export function useAffiliationsList(params: UseAffiliationsListParams) {
  return useQuery({
    queryKey: affiliationKeys.list(params),
    queryFn: () => fetchAffiliations(params),
    placeholderData: keepPreviousData,
    staleTime: 2 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useCreateAffiliation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AffiliationFormValues) => createAffiliation(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: affiliationKeys.lists() });
      toast.success("Affiliation created successfully");
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to create affiliation",
        }),
      );
    },
  });
}

export function useUpdateAffiliation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: AffiliationFormValues;
    }) => updateAffiliation(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: affiliationKeys.lists() });
      toast.success("Affiliation updated successfully");
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to update affiliation",
        }),
      );
    },
  });
}

export function useDeleteAffiliation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAffiliation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: affiliationKeys.lists() });
      toast.success("Affiliation deleted successfully");
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to delete affiliation",
        }),
      );
    },
  });
}
