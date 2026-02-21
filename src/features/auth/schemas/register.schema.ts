/**
 * Registration Schemas
 *
 * 📍 src/features/auth/schemas/register.schema.ts
 *
 * Zod schemas for registration-related API requests and responses.
 */

import { z } from "zod";
import { ApiResponseSchema } from "./auth.schema";

// ============================================
// Registration Request Schemas
// ============================================

/**
 * User data within registration request
 */
export const RegisterUserDataSchema = z.object({
  full_name: z
    .string()
    .min(3, "Full name must be at least 3 characters")
    .max(100, "Full name must be at most 100 characters"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password must be at most 100 characters"),
});

/**
 * Interest data within registration request
 */
export const RegisterInterestDataSchema = z.object({
  choosen_interests: z.array(z.string()).default([]),
  choosen_endgoals: z.array(z.string()).default([]),
  other_interests: z.array(z.string()).default([]),
  other_endgoals: z.array(z.string()).default([]),
});

/**
 * Referral data (optional)
 */
export const ReferralDataSchema = z.object({
  muid: z.string(),
});

/**
 * Integration data (e.g., KKEM/DWMS)
 */
export const IntegrationDataSchema = z.object({
  param: z.string(),
  title: z.string(),
});

/**
 * Full registration request
 */
export const RegisterRequestSchema = z.object({
  user: RegisterUserDataSchema,
  interests: RegisterInterestDataSchema.optional(),
  referral: ReferralDataSchema.optional(),
  gender: z.string().optional(),
  dob: z.string().optional(),
  communities: z.array(z.string()).optional(),
  integration: IntegrationDataSchema.optional(),
  role: z.string().optional(),
  organization: z.string().optional(),
  department: z.string().optional(),
  graduation_year: z.number().optional(),
});

/**
 * Registration response - returns tokens like login
 */
export const RegisterResponseDataSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
});

export const RegisterResponseSchema = ApiResponseSchema(
  RegisterResponseDataSchema,
);

// ============================================
// Email Verification Schemas
// ============================================

export const EmailVerificationRequestSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const EmailVerificationResponseDataSchema = z.object({
  value: z.boolean(), // true = email exists, false = email available
});

export const EmailVerificationResponseSchema = ApiResponseSchema(
  EmailVerificationResponseDataSchema,
);

// ============================================
// Derived Types
// ============================================

export type RegisterUserData = z.infer<typeof RegisterUserDataSchema>;
export type RegisterInterestData = z.infer<typeof RegisterInterestDataSchema>;
export type ReferralData = z.infer<typeof ReferralDataSchema>;
export type IntegrationData = z.infer<typeof IntegrationDataSchema>;
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;
export type RegisterResponse = z.infer<typeof RegisterResponseSchema>;
export type RegisterResponseData = z.infer<typeof RegisterResponseDataSchema>;

export type EmailVerificationRequest = z.infer<
  typeof EmailVerificationRequestSchema
>;
export type EmailVerificationResponse = z.infer<
  typeof EmailVerificationResponseSchema
>;
