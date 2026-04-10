"use client";

/**
 * useCompanyProfile — Fetch the authenticated company's profile
 *
 * 📍 src/features/company-jobs/hooks/use-company-profile.ts
 *
 * Used by CompanyStatusGuard to check whether the company is active.
 */

import { useQuery } from "@tanstack/react-query";
import { fetchCompanyProfile } from "../api";

export const COMPANY_KEYS = {
  all: ["company"] as const,
  profile: () => [...COMPANY_KEYS.all, "profile"] as const,
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
    isActive: query.data?.status === "active",
    status: query.data?.status,
  };
}
