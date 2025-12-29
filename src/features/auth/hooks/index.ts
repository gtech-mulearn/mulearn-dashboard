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
// Login hooks
export { useLoginWithOTP, useLoginWithPassword } from "./use-login";

// Registration hooks
export { useRegister } from "./use-register";
export { useRequestOTP } from "./use-request-otp";
export { useResetPassword, useVerifyResetToken } from "./use-reset-password";

// Session hooks
export {
  usePublicUserProfile,
  useUserInfo,
  useUserProfile,
} from "./use-session";
