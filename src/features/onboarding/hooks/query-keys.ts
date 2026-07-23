/**
 * Query Keys for Onboarding
 *
 * 📍 src/features/onboarding/hooks/query-keys.ts
 */

export const onboardingKeys = {
  all: ["onboarding"] as const,
  colleges: () => [...onboardingKeys.all, "colleges"] as const,
  collegeSearch: (search: string) =>
    [...onboardingKeys.all, "colleges", "search", search] as const,
  departments: () => [...onboardingKeys.all, "departments"] as const,
  departmentSearch: (search: string) =>
    [...onboardingKeys.all, "departments", "search", search] as const,
  companies: () => [...onboardingKeys.all, "companies"] as const,
  roles: () => [...onboardingKeys.all, "roles"] as const,
  countries: () => [...onboardingKeys.all, "countries"] as const,
  states: (countryId: string) =>
    [...onboardingKeys.all, "states", countryId] as const,
  districts: (stateId: string) =>
    [...onboardingKeys.all, "districts", stateId] as const,
};
