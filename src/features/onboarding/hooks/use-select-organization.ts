/**
 * Select Organization Hook
 *
 * 📍 src/features/onboarding/hooks/use-select-organization.ts
 */

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiResponseError } from "@/hooks/use-get-error";
import { userInfoKey } from "@/lib/auth/user-info";
import { createOrganization, selectOrganization } from "../api";
import type {
  CreateOrganizationRequest,
  SelectOrganizationRequest,
} from "../schemas";

/**
 * Hook for selecting an existing organization
 */
export function useSelectOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: SelectOrganizationRequest) => {
      const response = await selectOrganization(data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userInfoKey() });
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to select organization",
        }),
      );
    },
  });
}

/**
 * Hook for creating a new organization
 */
export function useCreateOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateOrganizationRequest) => {
      const response = await createOrganization(data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userInfoKey() });
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to create organization",
        }),
      );
    },
  });
}
