/**
 * Select Organization Hook
 *
 * 📍 src/features/onboarding/hooks/use-select-organization.ts
 */

"use client";

import { useMutation } from "@tanstack/react-query";
import { createOrganization, selectOrganization } from "../api";
import type {
  CreateOrganizationRequest,
  SelectOrganizationRequest,
} from "../schemas";

/**
 * Hook for selecting an existing organization
 */
export function useSelectOrganization() {
  return useMutation({
    mutationFn: async (data: SelectOrganizationRequest) => {
      const response = await selectOrganization(data);
      return response;
    },
  });
}

/**
 * Hook for creating a new organization
 */
export function useCreateOrganization() {
  return useMutation({
    mutationFn: async (data: CreateOrganizationRequest) => {
      const response = await createOrganization(data);
      return response;
    },
  });
}
