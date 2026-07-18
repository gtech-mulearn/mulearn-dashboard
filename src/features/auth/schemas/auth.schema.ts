/**
 * Auth Feature Schemas
 *
 * 📍 src/features/auth/schemas/auth.schema.ts
 *
 * Zod schemas for all auth-related API requests and responses.
 * Types are derived from these schemas - no manual typing.
 */

import { z } from "zod";

// ============================================
// Common Response Wrapper
// ============================================

/**
 * Standard Django API response wrapper
 */
export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    hasError: z.boolean(),
    statusCode: z.number(),
    message: z.record(z.string(), z.array(z.string())).optional(),
    response: dataSchema,
  });

// ============================================
// Login Schemas
// ============================================

/**
 * Login request - supports password OR OTP login
 */
export const LoginRequestSchema = z
  .object({
    emailOrMuid: z.string().min(1, "Email or MuID is required"),
    password: z.string().optional(),
    otp: z.string().optional(),
  })
  .refine((data) => data.password || data.otp, {
    message: "Either password or OTP is required",
  });

/**
 * Login response - tokens returned on successful auth
 */
export const LoginResponseDataSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  expiry: z.string().optional(),
});

export const LoginResponseSchema = ApiResponseSchema(LoginResponseDataSchema);

// ============================================
// OTP Request Schemas
// ============================================

export const RequestOTPRequestSchema = z.object({
  emailOrMuid: z.string().min(1, "Email or MuID is required"),
});

export const RequestOTPResponseSchema = ApiResponseSchema(z.object({}));

// ============================================
// Token Refresh Schemas
// ============================================

export const RefreshTokenRequestSchema = z.object({
  refreshToken: z.string(),
});

export const RefreshTokenResponseDataSchema = z.object({
  accessToken: z.string(),
});

export const RefreshTokenResponseSchema = ApiResponseSchema(
  RefreshTokenResponseDataSchema,
);

// ============================================
// Password Reset Schemas
// ============================================

export const ForgotPasswordRequestSchema = z.object({
  emailOrMuid: z.string().min(1, "Email or MuID is required"),
});

export const ForgotPasswordResponseSchema = ApiResponseSchema(z.object({}));

export const VerifyResetTokenResponseDataSchema = z.object({
  muid: z.string(),
});

export const VerifyResetTokenResponseSchema = ApiResponseSchema(
  VerifyResetTokenResponseDataSchema,
);

export const ResetPasswordRequestSchema = z.object({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password must be at most 100 characters"),
});

export const ResetPasswordResponseSchema = ApiResponseSchema(z.object({}));

// ============================================
// User Info Schemas
// ============================================

export const UserInfoSchema = z.object({
  muid: z.string(),
  full_name: z.string(),
  email: z.string().email(),
  mobile: z.string().nullable(),
  gender: z.string().nullable(),
  dob: z.string().nullable(),
  joined: z.string(),
  exist_in_guild: z.boolean(),
  roles: z.array(z.string()),
  dynamic_type: z.array(z.string()).optional().default([]),
  profile_pic: z.string().nullable(),
  user_domains: z.array(z.string()),
  user_endgoals: z.array(z.string()),
  interested_in_work: z.boolean().optional(),
  interested_in_gig_work: z.boolean().optional(),
  is_verified: z.boolean().optional(),
});

export const UserInfoResponseSchema = ApiResponseSchema(UserInfoSchema);

// ============================================
// User Profile Schemas
// ============================================

export const InterestGroupSchema = z.object({
  id: z.string(),
  name: z.string(),
  karma: z.number(),
});

export const KarmaDistributionSchema = z.object({
  task_type: z.string(),
  karma: z.number(),
});

export const UserProfileSchema = z.object({
  full_name: z.string(),
  college_code: z.string().nullable(),
  college_id: z.string().nullable(),
  org_district_id: z.string().nullable(),
  interest_groups: z.array(InterestGroupSchema),
  karma_distribution: z.array(KarmaDistributionSchema),
  gender: z.string().nullable(),
  id: z.string(),
  joined: z.string(),
  karma: z.number(),
  rank: z.number(),
  muid: z.string(),
  level: z.string().nullable(),
  profile_pic: z.string().nullable(),
  is_public: z.boolean(),
  percentile: z.number(),
  roles: z.array(z.string()),
  is_verified: z.boolean().optional(),
  role_verification: z
    .array(z.object({ role: z.string(), is_verified: z.boolean() }))
    .optional(),
});

export const UserProfileResponseSchema = ApiResponseSchema(UserProfileSchema);

// ============================================
// Derived Types
// ============================================

export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;
export type LoginResponseData = z.infer<typeof LoginResponseDataSchema>;

export type RequestOTPRequest = z.infer<typeof RequestOTPRequestSchema>;

export type RefreshTokenRequest = z.infer<typeof RefreshTokenRequestSchema>;
export type RefreshTokenResponse = z.infer<typeof RefreshTokenResponseSchema>;

export type ForgotPasswordRequest = z.infer<typeof ForgotPasswordRequestSchema>;
export type ResetPasswordRequest = z.infer<typeof ResetPasswordRequestSchema>;
export type VerifyResetTokenResponse = z.infer<
  typeof VerifyResetTokenResponseSchema
>;

export type UserInfo = z.infer<typeof UserInfoSchema>;
export type UserInfoResponse = z.infer<typeof UserInfoResponseSchema>;

export type UserProfile = z.infer<typeof UserProfileSchema>;
export type UserProfileResponse = z.infer<typeof UserProfileResponseSchema>;
export type InterestGroup = z.infer<typeof InterestGroupSchema>;
export type KarmaDistribution = z.infer<typeof KarmaDistributionSchema>;

// ============================================
// Company Onboarding / Verification Status
// ============================================

export const CompanyOnboardingStatusSchema = z
  .object({
    /** Whether the company has been approved by an admin */
    is_verified: z.boolean().optional(),
    verified: z.boolean().optional(),
    /** e.g. "pending" | "approved" | "rejected" */
    status: z.string().optional(),
    rejection_reason: z.string().nullable().optional(),
  })
  .passthrough();

export const CompanyOnboardingStatusResponseSchema = ApiResponseSchema(
  CompanyOnboardingStatusSchema,
);

export type CompanyOnboardingStatus = z.infer<
  typeof CompanyOnboardingStatusSchema
>;

// ============================================
// Google OAuth2 Schemas
// ============================================

export const GoogleAuthUrlResponseDataSchema = z.object({
  redirect_url: z.string(),
});

export const GoogleAuthUrlResponseSchema = ApiResponseSchema(
  GoogleAuthUrlResponseDataSchema,
);

export type GoogleAuthUrlResponse = z.infer<typeof GoogleAuthUrlResponseSchema>;
export type GoogleAuthUrlResponseData = z.infer<
  typeof GoogleAuthUrlResponseDataSchema
>;

export const GoogleCallbackResponseDataSchema = z.object({
  accessToken: z.string().optional(),
  refreshToken: z.string().optional(),
  expiry: z.string().optional(),
  isNewUser: z.boolean().optional(),
  tempToken: z.string().optional(),
  email: z.string().email().optional(),
  fullName: z.string().optional(),
});

export const GoogleCallbackResponseSchema = ApiResponseSchema(
  GoogleCallbackResponseDataSchema,
);
export type GoogleCallbackResponseData = z.infer<
  typeof GoogleCallbackResponseDataSchema
>;
export type GoogleCallbackResponse = z.infer<
  typeof GoogleCallbackResponseSchema
>;
