/**
 * Auth Feature
 *
 * 📍 src/features/auth/index.ts
 *
 * Public API for the auth feature.
 * Import from here, not from internal files.
 */

// API functions (for direct use if needed)
export {
  checkEmailExists,
  companySignup,
  fetchCompanyOnboardingStatus,
  fetchGoogleAuthUrl,
  fetchGoogleCallback,
  fetchPublicUserProfile,
  fetchUserInfo,
  loginWithOTP,
  loginWithPassword,
  registerUser,
  requestLoginOTP,
  requestPasswordReset,
  resetPassword,
  updateCompanyRegistration,
  validateRegistrationData,
  verifyResetToken,
} from "./api";
export type { CompanyDetailsValues, Role } from "./components";
// Components
export {
  ForgotPasswordForm,
  LoginForm,
  OTPLoginForm,
  RegisterForm,
  RegisterRoleDetails,
  RegisterRoleSelection,
  ResetPasswordForm,
} from "./components";

// Hooks (primary way to use the feature)
export {
  authKeys,
  useCompanyOnboardingStatus,
  useCompanyRegister,
  useForgotPassword,
  useGoogleAuthUrl,
  useGoogleCallback,
  useGoogleTempTokenStore,
  useLoginWithOTP,
  useLoginWithPassword,
  usePublicUserProfile,
  useRegister,
  useRequestOTP,
  useResetPassword,
  useUserInfo,
  useUserProfile,
  useVerifyResetToken,
} from "./hooks";
export type {
  CompanyOnboardingStatus,
  CompanySignupRequest,
  CompanySignupResponse,
  CompanySignupResponseData,
  EmailVerificationRequest,
  EmailVerificationResponse,
  ForgotPasswordRequest,
  GoogleAuthUrlResponse,
  GoogleAuthUrlResponseData,
  GoogleCallbackResponseData,
  IntegrationData,
  InterestGroup,
  KarmaDistribution,
  LoginRequest,
  LoginResponse,
  LoginResponseData,
  ReferralData,
  RefreshTokenRequest,
  RefreshTokenResponse,
  RegisterInterestData,
  RegisterRequest,
  RegisterResponse,
  RegisterResponseData,
  RegisterUserData,
  RequestOTPRequest,
  ResetPasswordRequest,
  UserInfo,
  UserInfoResponse,
  UserProfile,
  UserProfileResponse,
  VerifyResetTokenResponse,
} from "./schemas";
// Schemas and types
export {
  ApiResponseSchema,
  CompanyOnboardingStatusResponseSchema,
  CompanySignupRequestSchema,
  CompanySignupResponseSchema,
  EmailVerificationRequestSchema,
  EmailVerificationResponseSchema,
  ForgotPasswordRequestSchema,
  ForgotPasswordResponseSchema,
  GoogleAuthUrlResponseDataSchema,
  GoogleAuthUrlResponseSchema,
  GoogleCallbackResponseSchema,
  IntegrationDataSchema,
  InterestGroupSchema,
  KarmaDistributionSchema,
  LoginRequestSchema,
  LoginResponseDataSchema,
  LoginResponseSchema,
  ReferralDataSchema,
  RefreshTokenRequestSchema,
  RefreshTokenResponseSchema,
  RegisterInterestDataSchema,
  RegisterRequestSchema,
  RegisterResponseSchema,
  RegisterUserDataSchema,
  RequestOTPRequestSchema,
  RequestOTPResponseSchema,
  ResetPasswordRequestSchema,
  ResetPasswordResponseSchema,
  UserInfoResponseSchema,
  UserInfoSchema,
  UserProfileResponseSchema,
  UserProfileSchema,
  VerifyResetTokenResponseSchema,
} from "./schemas";
