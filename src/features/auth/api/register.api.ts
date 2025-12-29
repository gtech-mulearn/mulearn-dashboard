/**
 * Registration API Functions
 *
 * 📍 src/features/auth/api/register.api.ts
 *
 * All registration-related API calls.
 */

import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import {
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
