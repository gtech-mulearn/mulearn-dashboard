"use client";

/**
 * useCompanyProfile — Fetch the authenticated company's profile
 *
 * 📍 src/features/company-jobs/hooks/use-company-profile.ts
 *
 * Used by CompanyStatusGuard to check whether the company is active.
 */

import { useQuery } from "@tanstack/react-query";
import {
  fetchCompanyProfile,
  fetchPublicCompanyJobsBySlug,
  fetchPublicCompanyProfile,
} from "../api";

export const COMPANY_KEYS = {
  all: ["company"] as const,
  profile: () => [...COMPANY_KEYS.all, "profile"] as const,
  publicProfile: (slug: string) =>
    [...COMPANY_KEYS.all, "public-profile", slug] as const,
  publicJobs: (slug: string) =>
    [...COMPANY_KEYS.all, "public-jobs", slug] as const,
};

export function useCompanyProfile() {
  const query = useQuery({
    queryKey: COMPANY_KEYS.profile(),
    queryFn: fetchCompanyProfile,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  return {
    ...query,
    profile: query.data,
    isActive: query.data?.status === "verified",
    status: query.data?.status,
  };
}

export function usePublicCompanyProfile(slug?: string) {
  return useQuery({
    queryKey: COMPANY_KEYS.publicProfile(slug ?? ""),
    queryFn: () => fetchPublicCompanyProfile(slug as string),
    enabled: !!slug,
    staleTime: 10 * 60 * 1000,
  });
}

export function usePublicCompanyJobs(slug?: string) {
  return useQuery({
    queryKey: COMPANY_KEYS.publicJobs(slug ?? ""),
    queryFn: () => fetchPublicCompanyJobsBySlug(slug as string),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
}
