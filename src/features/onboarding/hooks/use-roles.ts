/**
 * Roles Hook
 *
 * 📍 src/features/onboarding/hooks/use-roles.ts
 *
 * Fetches the role list from GET /api/v1/register/role/list/ and exposes
 * a helper to resolve a role title (e.g. "Mentor") to its DB UUID.
 * Role UUIDs are required by POST /api/v1/register/ when assigning
 * Student / Mentor / Enabler during signup.
 */

"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchRoles } from "../api";
import { onboardingKeys } from "./query-keys";

/**
 * Hook for fetching available registration roles.
 * Returns the raw Role array plus a `getRoleId` helper.
 */
export function useRoles() {
  const query = useQuery({
    queryKey: onboardingKeys.roles(),
    queryFn: async () => {
      const response = await fetchRoles();
      return response.response.roles;
    },
    staleTime: 30 * 60 * 1000, // roles rarely change — cache for 30 minutes
  });

  /**
   * Look up the DB UUID for a role by its title (case-insensitive).
   * Returns `undefined` if the role list hasn't loaded yet or no match found.
   *
   * @example getRoleId("Mentor") → "some-uuid"
   */
  function getRoleId(title: string): string | undefined {
    if (!query.data) return undefined;
    const normalised = title.toLowerCase();
    return query.data.find((r) => r.title.toLowerCase() === normalised)?.id;
  }

  return { ...query, getRoleId };
}
