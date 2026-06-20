/**
 * Query Keys
 *
 * 📍 src/features/auth/hooks/query-keys.ts
 *
 * Centralized query keys for TanStack Query.
 * Ensures consistent cache invalidation.
 */

export const authKeys = {
  all: ["auth"] as const,
  userInfo: () => [...authKeys.all, "userInfo"] as const,
  publicProfile: (muid: string) =>
    [...authKeys.all, "publicProfile", muid] as const,
  session: () => [...authKeys.all, "session"] as const,
  resetToken: (token: string) =>
    [...authKeys.all, "resetToken", token] as const,
  companyOnboardingStatus: () =>
    [...authKeys.all, "companyOnboardingStatus"] as const,
  googleCallback: (code?: string) =>
    [...authKeys.all, "googleCallback", code] as const,
};
