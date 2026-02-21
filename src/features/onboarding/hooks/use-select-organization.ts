/**
 * Select Organization Hook
 *
 * 📍 src/features/onboarding/hooks/use-select-organization.ts
 */

"use client";

import { useMutation } from "@tanstack/react-query";
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
  return useMutation({
    mutationFn: async (data: SelectOrganizationRequest) => {
      const response = await selectOrganization(data);
      return response;
    },
    onError: (error) => {
      console.error("[useSelectOrganization] Error:", error);
      console.error("[useSelectOrganization] Error details:", {
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
        fullError: error,
      });
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
    onError: (error) => {
      console.error("[useCreateOrganization] Error:", error);
      console.error("[useCreateOrganization] Error details:", {
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
        fullError: error,
      });
    },
  });
}

/**
 * Hook for creating a new company
 */
export function useCreateCompany() {
  return useMutation({
    mutationFn: async (data: CreateCompanyRequest) => {
      const response = await createCompany(data);
      return response;
    },
    onError: (error) => {
      console.error("[useCreateCompany] Error:", error);
      console.error("[useCreateCompany] Error details:", {
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
        fullError: error,
      });
    },
  });
}
