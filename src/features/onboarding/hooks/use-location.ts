/**
 * Location Cascading Hooks
 *
 * 📍 src/features/onboarding/hooks/use-location.ts
 *
 * Country → State → District cascading selectors.
 * Used in the company registration form to collect district_id
 * (required by POST /api/v1/dashboard/company/create/ when no matching
 * company organization already exists in the system).
 */

"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchCountries, fetchDistricts, fetchStates } from "../api";
import { onboardingKeys } from "./query-keys";

/**
 * Fetch the full list of countries.
 * Returns `{ id, name }[]` items usable in a Combobox.
 */
export function useCountries() {
  return useQuery({
    queryKey: onboardingKeys.countries(),
    queryFn: async () => {
      const response = await fetchCountries();
      return response.response.countries;
    },
    staleTime: 60 * 60 * 1000, // countries never change — cache for 1 hour
  });
}

/**
 * Fetch states for the selected country.
 * Only fires when `countryId` is provided.
 */
export function useStates(countryId: string | undefined) {
  return useQuery({
    queryKey: onboardingKeys.states(countryId ?? ""),
    queryFn: async () => {
      if (!countryId) return [];
      const response = await fetchStates(countryId);
      return response.response.states;
    },
    enabled: !!countryId,
    staleTime: 60 * 60 * 1000,
  });
}

/**
 * Fetch districts for the selected state.
 * Only fires when `stateId` is provided.
 */
export function useDistricts(stateId: string | undefined) {
  return useQuery({
    queryKey: onboardingKeys.districts(stateId ?? ""),
    queryFn: async () => {
      if (!stateId) return [];
      const response = await fetchDistricts(stateId);
      return response.response.districts;
    },
    enabled: !!stateId,
    staleTime: 30 * 60 * 1000,
  });
}
