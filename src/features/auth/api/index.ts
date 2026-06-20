/**
 * Auth API Index
 *
 * 📍 src/features/auth/api/index.ts
 *
 * Public exports for auth API functions.
 */

export {
  fetchCompanyOnboardingStatus,
  fetchGoogleAuthUrl,
  fetchGoogleCallback,
  fetchPublicUserProfile,
  fetchUserInfo,
  fetchUserProfile,
  loginWithOTP,
  loginWithPassword,
  requestLoginOTP,
  requestPasswordReset,
  resetPassword,
  verifyResetToken,
} from "./auth.api";

export {
  checkEmailExists,
  companySignup,
  registerUser,
  updateCompanyRegistration,
  validateRegistrationData,
} from "./register.api";
