/**
 * Auth API Index
 *
 * 📍 src/features/auth/api/index.ts
 *
 * Public exports for auth API functions.
 */

export {
  fetchPublicUserProfile,
  fetchUserInfo,
  fetchUserProfile,
  loginWithOTP,
  loginWithPassword,
  refreshAccessToken,
  requestLoginOTP,
  requestPasswordReset,
  resetPassword,
  verifyResetToken,
} from "./auth.api";

export {
  checkEmailExists,
  registerUser,
  validateRegistrationData,
} from "./register.api";
