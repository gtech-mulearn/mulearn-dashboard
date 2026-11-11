/**
 * Registration API Functions
 *
 * 📍 src/features/auth/api/register.api.ts
 *
 * All registration-related API calls.
 */

import { ApiError, apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import {
  type CompanySignupRequest,
  CompanySignupResponseSchema,
  EmailVerificationResponseSchema,
  type RegisterRequest,
  RegisterResponseSchema,
} from "../schemas";

// ============================================
// Registration Functions
// ============================================

/**
 * Register a new user account
 */
export function registerUser(data: RegisterRequest) {
  return apiClient.post(
    endpoints.register.create,
    data,
    RegisterResponseSchema,
  );
}

/**
 * Company-specific signup.
 * Endpoint: POST /api/v1/dashboard/company/register/
 * Auth: AllowAny (no token needed) or Authenticated (if logged in).
 *
 * Creates a company record in pending_verification status.
 */
export function companySignup(data: CompanySignupRequest) {
  // Strip blank optional strings before sending so the backend doesn't
  // receive empty-string values for optional fields.
  const payload = Object.fromEntries(
    Object.entries(data).filter(
      ([, value]) => value !== undefined && value !== "",
    ),
  ) as CompanySignupRequest;

  return apiClient.post(
    endpoints.company.register,
    payload,
    CompanySignupResponseSchema,
  );
}

/**
 * Update pending or rejected company registration.
 * Endpoint: PATCH /api/v1/dashboard/company/register/
 * Auth: Authenticated.
 *
 * Updates registration fields.
 */
export function updateCompanyRegistration(data: Partial<CompanySignupRequest>) {
  const payload = Object.fromEntries(
    Object.entries(data).filter(
      ([, value]) => value !== undefined && value !== "",
    ),
  );

  return apiClient.patch(
    endpoints.company.register,
    payload,
    CompanySignupResponseSchema,
  );
}

/**
 * Check if email is already registered
 * Returns { value: true } if email exists, { value: false } if available
 */
export function checkEmailExists(email: string) {
  return apiClient.post(
    endpoints.register.emailVerification,
    { email },
    EmailVerificationResponseSchema,
  );
}

/**
 * Validate registration data before final submit
 * Use this for real-time validation
 */
export async function validateRegistrationData(data: Partial<RegisterRequest>) {
  // This endpoint returns validation errors if any
  // On success, it returns an empty response
  return apiClient.put(
    endpoints.register.validate,
    data,
    // We expect a generic response here
    EmailVerificationResponseSchema,
  );
}

/**
 * Convert file to base64 Data URL for company verification document, logo, or gallery assets.
 * Accepts PDF, JPG, JPEG, PNG, GIF, and WEBP files up to 10MB.
 */
export async function uploadVerificationDocument(file: File): Promise<string> {
  const allowedExtensions = [".pdf", ".jpg", ".jpeg", ".png", ".gif", ".webp"];
  const allowedMimeTypes = [
    "application/pdf",
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
  ];

  const hasValidExt = allowedExtensions.some((ext) =>
    file.name.toLowerCase().endsWith(ext),
  );
  const hasValidType =
    allowedMimeTypes.includes(file.type) || file.type.startsWith("image/");

  if (!hasValidExt && !hasValidType) {
    throw new ApiError(
      400,
      "Invalid file type. Please upload a PDF, JPG, JPEG, PNG, GIF, or WebP file.",
    );
  }

  const MAX_DOC_SIZE_BYTES = 10 * 1024 * 1024;
  if (file.size > MAX_DOC_SIZE_BYTES) {
    throw new ApiError(400, "File must be under 10 MB.");
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new ApiError(400, "Failed to read file"));
      }
    };
    reader.onerror = () => reject(new ApiError(400, "Failed to read file"));
    reader.readAsDataURL(file);
  });
}

/** Alias for uploading logos, gallery pictures, and documents */
export const uploadCompanyAsset = uploadVerificationDocument;
