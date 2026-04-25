/**
 * Auth API Index
 *
 * 📍 src/features/auth/api/index.ts
 *
 * Public exports for auth API functions.
 */

export {
  fetchCompanyOnboardingStatus,
  fetchPublicUserProfile,
  fetchUserInfo,
  fetchUserProfile,
  getGoogleAuthUrl,
  handleGoogleCallback,
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
  companySignup,
  registerUser,
  validateRegistrationData,
} from "./register.api";
