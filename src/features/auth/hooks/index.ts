/**
 * Auth Hooks Index
 *
 * 📍 src/features/auth/hooks/index.ts
 *
 * Public exports for auth hooks.
 */

export { authKeys } from "./query-keys";
// Password reset hooks
export { useForgotPassword } from "./use-forgot-password";
// Google OAuth2 hooks
export { useGoogleAuthUrl, useGoogleCallback } from "./use-google-login";
export { useGoogleTempTokenStore } from "./use-google-temp-token-store";
// Login hooks
export { useLoginWithOTP, useLoginWithPassword } from "./use-login";

// Registration hooks
export { useCompanyRegister, useRegister } from "./use-register";
export { useRequestOTP } from "./use-request-otp";
export { useResetPassword, useVerifyResetToken } from "./use-reset-password";

// Session hooks
export {
  useCompanyOnboardingStatus,
  usePublicUserProfile,
  useUserInfo,
  useUserProfile,
} from "./use-session";
