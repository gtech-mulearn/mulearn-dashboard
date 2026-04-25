/**
 * Auth API Functions
 *
 * 📍 src/features/auth/api/auth.api.ts
 *
 * All auth-related API calls go through here.
 * NO direct fetch calls in components or hooks.
 * NO React dependencies - this is pure data layer.
 *
 * Pattern: Validate full response, extract and return inner data.
 */

import { apiClient, publicApiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import {
  CompanyOnboardingStatusResponseSchema,
  ForgotPasswordResponseSchema,
  type LoginResponseData,
  LoginResponseSchema,
  RefreshTokenResponseSchema,
  RequestOTPResponseSchema,
  ResetPasswordResponseSchema,
  GoogleAuthUrlResponseSchema,
  GoogleCallbackResponseSchema,
  type UserInfo,
  UserInfoResponseSchema,
  type UserProfile,
  UserProfileResponseSchema,
  VerifyResetTokenResponseSchema,
} from "../schemas";

// ============================================
// Login Functions
// ============================================

/**
 * Login with email/muid and password
 */
export async function loginWithPassword(
  emailOrMuid: string,
  password: string,
): Promise<LoginResponseData> {
  const response = await apiClient.post(
    endpoints.auth.login,
    { emailOrMuid, password },
    LoginResponseSchema,
  );
  return response.response;
}

/**
 * Login with email/muid and OTP
 */
export async function loginWithOTP(
  emailOrMuid: string,
  otp: string,
): Promise<LoginResponseData> {
  const response = await apiClient.post(
    endpoints.auth.login,
    { emailOrMuid, otp },
    LoginResponseSchema,
  );
  return response.response;
}

/**
 * Request OTP for login
 */
export async function requestLoginOTP(emailOrMuid: string): Promise<void> {
  await apiClient.post(
    endpoints.auth.requestOTP,
    { emailOrMuid },
    RequestOTPResponseSchema,
  );
}

// ============================================
// Token Functions
// ============================================

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(
  refreshToken: string,
): Promise<{ accessToken: string }> {
  const response = await publicApiClient.post(
    endpoints.auth.refreshToken,
    { refreshToken },
    RefreshTokenResponseSchema,
  );
  return response.response;
}

// ============================================
// Password Reset Functions
// ============================================

/**
 * Request password reset email
 */
export async function requestPasswordReset(emailOrMuid: string): Promise<void> {
  await apiClient.post(
    endpoints.password.forgot,
    { emailOrMuid },
    ForgotPasswordResponseSchema,
  );
}

/**
 * Verify password reset token is valid
 */
export async function verifyResetToken(
  token: string,
): Promise<{ muid: string }> {
  const response = await apiClient.post(
    endpoints.password.verifyResetToken(token),
    {},
    VerifyResetTokenResponseSchema,
  );
  return response.response;
}

/**
 * Reset password using token
 */
export async function resetPassword(
  token: string,
  password: string,
): Promise<void> {
  await apiClient.post(
    endpoints.password.reset(token),
    { password },
    ResetPasswordResponseSchema,
  );
}

// ============================================
// User Data Functions
// ============================================

/**
 * Get current user info (lightweight)
 */
export async function fetchUserInfo(): Promise<UserInfo> {
  const response = await apiClient.get(
    endpoints.user.info,
    UserInfoResponseSchema,
  );
  return response.response;
}

/**
 * Get full user profile
 */
export async function fetchUserProfile(): Promise<UserProfile> {
  const response = await apiClient.get(
    endpoints.user.profile,
    UserProfileResponseSchema,
  );
  return response.response;
}

/**
 * Get public user profile by muid
 */
export async function fetchPublicUserProfile(
  muid: string,
): Promise<UserProfile> {
  const response = await apiClient.get(
    endpoints.user.publicProfile(muid),
    UserProfileResponseSchema,
  );
  return response.response;
}

/**
 * Get company onboarding / verification status for the logged-in company user
 */
export async function fetchCompanyOnboardingStatus() {
  const response = await apiClient.get(
    endpoints.company.onboardingStatus,
    CompanyOnboardingStatusResponseSchema,
  );
  return response.response;
}

// ============================================
// Google OAuth2 Functions
// ============================================

/**
 * Get Google OAuth2 redirect URL
 */
export async function getGoogleAuthUrl(): Promise<{ redirect_url: string }> {
  const response = await publicApiClient.get(
    endpoints.auth.signinWithGoogle,
    GoogleAuthUrlResponseSchema,
  );
  return response.response;
}

/**
 * Exchange Google auth code for access/refresh tokens
 */
export async function handleGoogleCallback(
  code: string,
): Promise<LoginResponseData> {
  const response = await publicApiClient.get(
    endpoints.auth.googleCallback(code),
    GoogleCallbackResponseSchema,
  );
  return response.response;
}
