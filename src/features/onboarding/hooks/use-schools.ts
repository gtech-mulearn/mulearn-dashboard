/**
 * School lookup hooks
 *
 * 📍 src/features/onboarding/hooks/use-schools.ts
 *
 * Schools are listed per district, so the learner first searches their
 * district, then picks a school from that district. Both endpoints are public.
 */

"use client";

import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "@/hooks/use-debounce";
import { fetchSchoolsByDistrict, searchDistricts } from "../api";
import { onboardingKeys } from "./query-keys";

/**
 * Server-side district search. The backend requires a non-empty query,
 * so nothing is fetched until the user types.
 * Returns `{ id, title }[]` so it plugs straight into a Combobox.
 */
export function useDistrictSearch(search: string) {
  const debouncedSearch = useDebounce(search.trim(), 300);

  return useQuery({
    queryKey: onboardingKeys.districtSearch(debouncedSearch),
    queryFn: async () => {
      const response = await searchDistricts(debouncedSearch);
      return response.response.map((district) => ({
        id: district.id,
        title: district.location,
      }));
    },
    enabled: debouncedSearch.length > 0,
    staleTime: 60 * 1000,
  });
}

/**
 * Schools in the selected district. Only fires once a district is chosen.
 */
export function useSchoolsByDistrict(districtId: string | undefined) {
  return useQuery({
    queryKey: onboardingKeys.schools(districtId ?? ""),
    queryFn: async () => {
      const response = await fetchSchoolsByDistrict(districtId as string);
      return response.response.schools;
    },
    enabled: !!districtId,
    staleTime: 10 * 60 * 1000,
  });
}
