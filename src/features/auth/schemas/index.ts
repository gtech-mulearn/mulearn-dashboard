/**
 * Auth Schemas Index
 *
 * 📍 src/features/auth/schemas/index.ts
 *
 * Public exports for auth schemas and types.
 */

// Auth schemas and types
export {
  // Schemas
  ApiResponseSchema,
  type CompanyOnboardingStatus,
  CompanyOnboardingStatusResponseSchema,
  type ForgotPasswordRequest,
  ForgotPasswordRequestSchema,
  ForgotPasswordResponseSchema,
  type InterestGroup,
  InterestGroupSchema,
  type KarmaDistribution,
  KarmaDistributionSchema,
  // Types
  type LoginRequest,
  LoginRequestSchema,
  type LoginResponse,
  type LoginResponseData,
  LoginResponseDataSchema,
  LoginResponseSchema,
  type RefreshTokenRequest,
  RefreshTokenRequestSchema,
  type RefreshTokenResponse,
  RefreshTokenResponseSchema,
  type RequestOTPRequest,
  RequestOTPRequestSchema,
  RequestOTPResponseSchema,
  type ResetPasswordRequest,
  ResetPasswordRequestSchema,
  ResetPasswordResponseSchema,
  type UserInfo,
  type UserInfoResponse,
  UserInfoResponseSchema,
  UserInfoSchema,
  type UserProfile,
  type UserProfileResponse,
  UserProfileResponseSchema,
  UserProfileSchema,
  type VerifyResetTokenResponse,
  VerifyResetTokenResponseSchema,
  // Google OAuth2
  type GoogleAuthUrlResponse,
  type GoogleAuthUrlResponseData,
  GoogleAuthUrlResponseDataSchema,
  GoogleAuthUrlResponseSchema,
  type GoogleCallbackResponse,
  GoogleCallbackResponseSchema,
} from "./auth.schema";

// Registration schemas and types
export {
  // Company signup
  type CompanySignupRequest,
  CompanySignupRequestSchema,
  type CompanySignupResponse,
  type CompanySignupResponseData,
  CompanySignupResponseSchema,
  type EmailVerificationRequest,
  EmailVerificationRequestSchema,
  type EmailVerificationResponse,
  EmailVerificationResponseSchema,
  type IntegrationData,
  IntegrationDataSchema,
  type ReferralData,
  ReferralDataSchema,
  type RegisterInterestData,
  RegisterInterestDataSchema,
  type RegisterRequest,
  RegisterRequestSchema,
  type RegisterResponse,
  type RegisterResponseData,
  RegisterResponseSchema,
  // Types
  type RegisterUserData,
  // Schemas
  RegisterUserDataSchema,
} from "./register.schema";
