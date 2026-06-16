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
// export function registerUser(data: RegisterRequest) {
//   // Flatten user data to top level as backend expects it
//   const payload = {
//     ...data.user,
//     ...(data.referral && { referral: data.referral }),
//     ...(data.interests && { interests: data.interests }),
//     ...(data.gender && { gender: data.gender }),
//     ...(data.dob && { dob: data.dob }),
//     ...(data.communities && { communities: data.communities }),
//     ...(data.integration && { integration: data.integration }),
//     ...(data.role && { role: data.role }),
//     ...(data.organization && { organization: data.organization }),
//     ...(data.department && { department: data.department }),
//     ...(data.graduation_year && { graduation_year: data.graduation_year }),
//   };

//   return apiClient.post(
//     endpoints.register.create,
//     payload,
//     RegisterResponseSchema,
//   );
// }
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
