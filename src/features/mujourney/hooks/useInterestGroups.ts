/**
 * Interest Groups Hook
 *
 * 📍 src/features/mujourney/hooks/useInterestGroups.ts
 *
 * Hook for fetching available interest groups.
 */

"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import { authStore } from "@/lib/auth";
import { InterestGroupsResponseSchema } from "../schemas/mujourney.schemas";

export function useInterestGroups() {
  const isAuthenticated = !!authStore.getAccessToken();

  return useQuery({
    queryKey: ["interest-groups"],
    queryFn: () =>
      apiClient.get(
        endpoints.onboarding.areasOfInterest,
        InterestGroupsResponseSchema,
      ),
    staleTime: 10 * 60 * 1000, // 10 minutes
    enabled: isAuthenticated, // Only fetch if authenticated
  });
}
