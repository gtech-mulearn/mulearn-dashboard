"use client";

/**
 * useCompanyProfile — Fetch the authenticated company's profile
 *
 * 📍 src/features/company-jobs/hooks/use-company-profile.ts
 *
 * Used by CompanyStatusGuard to check whether the company is active.
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiResponseError } from "@/hooks/use-get-error";
import {
  fetchCompanyProfile,
  fetchPublicCompanyJobsBySlug,
  fetchPublicCompanyProfile,
  updateCompanyProfile,
} from "../api";
import type { CompanyProfile } from "../types";

export const COMPANY_KEYS = {
  all: ["company"] as const,
  profile: () => [...COMPANY_KEYS.all, "profile"] as const,
  publicProfile: (slug: string) =>
    [...COMPANY_KEYS.all, "public-profile", slug] as const,
  publicJobs: (slug: string) =>
    [...COMPANY_KEYS.all, "public-jobs", slug] as const,
};

export function useCompanyProfile(options?: { enabled?: boolean }) {
  const query = useQuery({
    queryKey: COMPANY_KEYS.profile(),
    queryFn: fetchCompanyProfile,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: options?.enabled ?? true,
  });

  return {
    ...query,
    profile: query.data,
    isActive: query.data?.status === "verified",
    status: query.data?.status,
  };
}

export function useUpdateCompanyProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Partial<CompanyProfile>) =>
      updateCompanyProfile(payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: COMPANY_KEYS.profile() });
      toast.success(res.message);
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to update company profile",
        }),
      );
    },
  });
}

export const usePatchCompanyProfile = useUpdateCompanyProfile;

export function usePublicCompanyProfile(slug?: string) {
  return useQuery({
    queryKey: COMPANY_KEYS.publicProfile(slug ?? ""),
    queryFn: () => fetchPublicCompanyProfile(slug as string),
    enabled: !!slug && !slug.includes("@"),
    staleTime: 10 * 60 * 1000,
  });
}

export function usePublicCompanyJobs(slug?: string) {
  return useQuery({
    queryKey: COMPANY_KEYS.publicJobs(slug ?? ""),
    queryFn: () => fetchPublicCompanyJobsBySlug(slug as string),
    enabled: !!slug && !slug.includes("@"),
    staleTime: 5 * 60 * 1000,
  });
}
