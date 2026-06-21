/**
 * Select Interests Hook
 *
 * 📍 src/features/onboarding/hooks/use-select-interests.ts
 */

"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { authKeys } from "@/features/auth/hooks/query-keys";
import { getApiResponseError } from "@/hooks/use-get-error";
import { selectDomains, selectEndgoals } from "../api";

/**
 * Hook for selecting pathways/domains
 */
export function useSelectDomains() {
  return useMutation({
    mutationFn: async (domains: string[]) => {
      const response = await selectDomains(domains);
      return response;
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, { fallback: "Failed to save domains" }),
      );
    },
  });
}

/**
 * Hook for selecting endgoals
 */
export function useSelectEndgoals() {
  return useMutation({
    mutationFn: async (endgoals: string[]) => {
      const response = await selectEndgoals(endgoals);
      return response;
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, { fallback: "Failed to save endgoals" }),
      );
    },
  });
}
