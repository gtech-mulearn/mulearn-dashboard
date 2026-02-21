/**
 * Select Organization Hook
 *
 * 📍 src/features/onboarding/hooks/use-select-organization.ts
 */

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authKeys } from "@/features/auth/hooks/query-keys";
import { createCompany, createOrganization, selectOrganization } from "../api";
import type {
  CreateCompanyRequest,
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
      queryClient.invalidateQueries({ queryKey: authKeys.userInfo() });
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
      queryClient.invalidateQueries({ queryKey: authKeys.userInfo() });
    },
  });
}

/**
 * Hook for creating a new company
 */
export function useCreateCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateCompanyRequest) => {
      const response = await createCompany(data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.userInfo() });
    },
  });
}
