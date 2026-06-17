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
 * User data within registration request.
 * `role` is the DB UUID of the role (from GET /api/v1/register/role/list/).
 * Not required for company signups (those use a separate endpoint).
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
  /** DB UUID of the role (Student / Mentor / Enabler) */
  role: z.string().optional(),
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
 * Full registration request for Student / Mentor / Enabler.
 * `user.role` must be the DB UUID fetched from GET /api/v1/register/role/list/.
 * Company signup uses a separate schema (CompanySignupRequestSchema).
 */
export const RegisterRequestSchema = z.object({
  user: RegisterUserDataSchema,
  interests: RegisterInterestDataSchema.optional(),
  referral: ReferralDataSchema.optional(),
  gender: z.string().optional(),
  dob: z.string().optional(),
  communities: z.array(z.string()).optional(),
  integration: IntegrationDataSchema.optional(),
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
// Company Signup Schemas
// POST /api/v1/dashboard/company/create/
// ============================================

/**
 * Request body for company-specific signup endpoint.
 * POC (point of contact) = the person filling in the form.
 * Their email/name/password become the user account credentials.
 */
export const CompanySignupRequestSchema = z.object({
  name: z
    .string()
    .min(1, "Company name is required")
    .max(75, "Company name must be at most 75 characters"),
  description: z.string().min(1, "Description is required"),
  logo: z.string().url().optional().or(z.literal("")),
  short_pitch: z.string().optional(),
  industry_sector: z.string().optional(),
  website_link: z
    .string()
    .url("Enter a valid URL")
    .optional()
    .or(z.literal("")),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  location: z.string().optional(),
  district_id: z
    .string()
    .uuid("Invalid district ID")
    .optional()
    .or(z.literal("")),
  state_id: z.string().uuid("Invalid state ID").optional().or(z.literal("")),
  country_id: z
    .string()
    .uuid("Invalid country ID")
    .optional()
    .or(z.literal("")),
  legal_name: z.string().optional(),
  registration_number: z.string().optional(),
  tax_id: z.string().optional(),
  company_size: z.string().optional(),
  linkedin_url: z
    .string()
    .url("Enter a valid LinkedIn URL")
    .optional()
    .or(z.literal("")),
  founded_year: z.number().optional(),
  remote_policy: z.string().optional(),
  culture_text: z.string().optional(),
  tech_stack: z.array(z.string()).optional(),
  perks: z.array(z.string()).optional(),
  testimonials: z.array(z.unknown()).optional(),
  gallery: z.array(z.unknown()).optional(),
});

/**
 * Auth tokens nested inside the company signup response.
 * The backend may return camelCase (accessToken/refreshToken) or
 * snake_case (access/refresh) — accept both.
 */
export const CompanySignupAuthSchema = z
  .object({
    accessToken: z.string().optional(),
    refreshToken: z.string().optional(),
    access: z.string().optional(),
    refresh: z.string().optional(),
  })
  .passthrough();

export const CompanySignupResponseDataSchema = z.object({
  name: z.string(),
  description: z.string(),
  logo: z.string().nullable().optional(),
  short_pitch: z.string().nullable().optional(),
  industry_sector: z.string().nullable().optional(),
  website_link: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  district_id: z.string().nullable().optional(),
  state_id: z.string().nullable().optional(),
  country_id: z.string().nullable().optional(),
  legal_name: z.string().nullable().optional(),
  registration_number: z.string().nullable().optional(),
  tax_id: z.string().nullable().optional(),
  company_size: z.string().nullable().optional(),
  linkedin_url: z.string().nullable().optional(),
  founded_year: z.number().nullable().optional(),
  remote_policy: z.string().nullable().optional(),
  culture_text: z.string().nullable().optional(),
  tech_stack: z.array(z.string()).nullable().optional(),
  perks: z.array(z.string()).nullable().optional(),
  testimonials: z.array(z.unknown()).nullable().optional(),
  gallery: z.array(z.unknown()).nullable().optional(),
});

export const CompanySignupResponseSchema = z
  .object({
    hasError: z.boolean(),
    statusCode: z.number(),
    message: z.record(z.string(), z.unknown()).optional(),
    response: CompanySignupResponseDataSchema,
  })
  .passthrough();

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

export type CompanySignupRequest = z.infer<typeof CompanySignupRequestSchema>;
export type CompanySignupResponse = z.infer<typeof CompanySignupResponseSchema>;
export type CompanySignupResponseData = z.infer<
  typeof CompanySignupResponseDataSchema
>;

export type EmailVerificationRequest = z.infer<
  typeof EmailVerificationRequestSchema
>;
export type EmailVerificationResponse = z.infer<
  typeof EmailVerificationResponseSchema
>;
