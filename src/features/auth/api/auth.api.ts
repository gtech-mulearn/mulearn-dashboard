/**
 * Auth API Functions
 *
 * 📍 src/features/auth/api/auth.api.ts
 *
 * All auth-related API calls go through here.
 * NO direct fetch calls in components or hooks.
 * NO React dependencies - this is pure data layer.
 */

import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import {
  ForgotPasswordResponseSchema,
  LoginResponseSchema,
  RefreshTokenResponseSchema,
  RequestOTPResponseSchema,
  ResetPasswordResponseSchema,
  UserInfoResponseSchema,
  UserProfileResponseSchema,
  VerifyResetTokenResponseSchema,
} from "../schemas";

// ============================================
// Login Functions
// ============================================

/**
 * Login with email/muid and password
 */
export function loginWithPassword(emailOrMuid: string, password: string) {
  return apiClient.post(
    endpoints.auth.login,
    { emailOrMuid, password },
    LoginResponseSchema,
  );
}

/**
 * Login with email/muid and OTP
 */
export function loginWithOTP(emailOrMuid: string, otp: string) {
  return apiClient.post(
    endpoints.auth.login,
    { emailOrMuid, otp },
    LoginResponseSchema,
  );
}

/**
 * Request OTP for login
 */
export function requestLoginOTP(emailOrMuid: string) {
  return apiClient.post(
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
export function refreshAccessToken(refreshToken: string) {
  return apiClient.post(
    endpoints.auth.refreshToken,
    { refreshToken },
    RefreshTokenResponseSchema,
  );
}

// ============================================
// Password Reset Functions
// ============================================

/**
 * Request password reset email
 */
export function requestPasswordReset(emailOrMuid: string) {
  return apiClient.post(
    endpoints.password.forgot,
    { emailOrMuid },
    ForgotPasswordResponseSchema,
  );
}

/**
 * Verify password reset token is valid
 */
export function verifyResetToken(token: string) {
  return apiClient.post(
    endpoints.password.verifyResetToken(token),
    {},
    VerifyResetTokenResponseSchema,
  );
}

/**
 * Reset password using token
 */
export function resetPassword(token: string, password: string) {
  return apiClient.post(
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
export function fetchUserInfo() {
  return apiClient.get(endpoints.user.info, UserInfoResponseSchema);
}

/**
 * Get full user profile
 */
export function fetchUserProfile() {
  return apiClient.get(endpoints.user.profile, UserProfileResponseSchema);
}

/**
 * Get public user profile by muid
 */
export function fetchPublicUserProfile(muid: string) {
  return apiClient.get(
    endpoints.user.publicProfile(muid),
    UserProfileResponseSchema,
  );
}
