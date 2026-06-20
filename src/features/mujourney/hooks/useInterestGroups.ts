"use client";

import { useQuery } from "@tanstack/react-query";
import { getUserProfile } from "@/features/profile/api/profile.api";
import { authStore } from "@/lib/auth";
import { mujourneyKeys } from "./query-keys";

export function useInterestGroups() {
  const isAuthenticated = authStore.isAuthenticated();

  return useQuery({
    queryKey: mujourneyKeys.interestGroups(),
    queryFn: async () => {
      const profile = await getUserProfile();
      return {
        hasError: false,
        statusCode: 200,
        message: null,
        response: {
          aois: profile.interest_groups
            .filter((ig) => !!ig.id)
            .map((ig) => ({ id: ig.id as string, name: ig.name })),
        },
      };
    },
    staleTime: 5 * 60 * 1000,
    enabled: isAuthenticated,
  });
}
