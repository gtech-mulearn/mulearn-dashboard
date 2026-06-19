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
  fetchCompanyDetails,
  fetchCompanyVerificationRequests,
  verifyCompany,
} from "../api/manage-companies.api";
import type { VerificationActionFormValues } from "../schemas";
import { manageCompaniesKeys } from "./query-keys";

// ─── Types ────────────────────────────────────────────────────────────────────

interface UseCompanyVerificationListParams {
  pageIndex: number;
  perPage: number;
  search: string;
  sortBy: string;
  status: string;
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export function useCompanyVerificationList(
  params: UseCompanyVerificationListParams,
) {
  return useQuery({
    queryKey: manageCompaniesKeys.list(params),
    queryFn: () => fetchCompanyVerificationRequests(params),
    placeholderData: keepPreviousData,
    staleTime: 2 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useVerifyCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      companyId,
      payload,
    }: {
      companyId: string;
      payload: VerificationActionFormValues;
    }) => verifyCompany(companyId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: manageCompaniesKeys.lists() });
      const action = variables.payload.action;
      toast.success(
        action === "approve"
          ? "Company approved successfully."
          : "Company rejected successfully.",
      );
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to update company verification.",
        }),
      );
    },
  });
}

export function useCompanyDetails(companyId: string | null) {
  return useQuery({
    queryKey: manageCompaniesKeys.detail(companyId ?? ""),
    queryFn: () => fetchCompanyDetails(companyId ?? ""),
    enabled: !!companyId,
    staleTime: 5 * 60 * 1000,
  });
}
