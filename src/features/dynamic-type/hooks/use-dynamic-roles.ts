/**
 * Dynamic Roles Hook
 *
 * 📍 src/features/dynamic-type/hooks/use-dynamic-roles.ts
 *
 * TanStack Query hook for fetching dynamic role-type mappings.
 * The raw nested response is flattened in the `select` option.
 */

"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchDynamicRoles, fetchRoles, fetchTypes } from "../api";
import { flattenDynamicRoles } from "../schemas";
import type {
  DynamicRoleItem,
  DynamicRolesGroup,
  RoleOption,
  SelectOption,
} from "../types";
import { dynamicTypeKeys } from "./query-keys";

/** Fetch all dynamic role-type mappings, flattened for table display. */
export function useDynamicRoles() {
  return useQuery({
    queryKey: dynamicTypeKeys.roles(),
    queryFn: fetchDynamicRoles,
    select: (groups: DynamicRolesGroup[]): DynamicRoleItem[] =>
      flattenDynamicRoles(groups),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Fetch available roles for the create/edit select dropdown.
 * staleTime: Infinity — roles rarely change.
 */
export function useRoleOptions() {
  return useQuery({
    queryKey: dynamicTypeKeys.lookupRoles(),
    queryFn: fetchRoles,
    select: (roles: RoleOption[]): SelectOption[] =>
      roles.map((r) => ({ value: r.id, label: r.title })),
    staleTime: Number.POSITIVE_INFINITY,
  });
}

/**
 * Fetch available types for the create/edit select dropdown.
 * staleTime: Infinity — types rarely change.
 */
export function useTypeOptions() {
  return useQuery({
    queryKey: dynamicTypeKeys.lookupTypes(),
    queryFn: fetchTypes,
    select: (types: string[]): SelectOption[] =>
      types.map((t) => ({ value: t, label: t })),
    staleTime: Number.POSITIVE_INFINITY,
  });
}
