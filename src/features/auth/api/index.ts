/**
 * Auth API Index
 *
 * 📍 src/features/auth/api/index.ts
 *
 * Public exports for auth API functions.
 */

// The user info lives in the shared auth layer (issue 0011); re-exported here.
export { fetchUserInfo } from "@/lib/auth/user-info";
export {
  fetchCompanyOnboardingStatus,
  fetchGoogleAuthUrl,
  fetchGoogleCallback,
  fetchPublicUserProfile,
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
  uploadCompanyAsset,
  uploadVerificationDocument,
  validateRegistrationData,
} from "./register.api";
