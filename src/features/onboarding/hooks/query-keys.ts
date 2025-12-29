/**
 * Query Keys for Onboarding
 *
 * 📍 src/features/onboarding/hooks/query-keys.ts
 */

export const onboardingKeys = {
  all: ["onboarding"] as const,
  colleges: () => [...onboardingKeys.all, "colleges"] as const,
  departments: () => [...onboardingKeys.all, "departments"] as const,
  companies: () => [...onboardingKeys.all, "companies"] as const,
  roles: () => [...onboardingKeys.all, "roles"] as const,
};
