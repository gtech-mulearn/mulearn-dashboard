import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import { updateCompanyRegistration } from "@/features/auth/api/register.api";
import { CompanyProfileResponseSchema } from "@/features/company-jobs/schemas";
import type { CompanyProfile } from "@/features/company-jobs/types";
import type { CompanySignupRequest } from "@/features/auth/schemas";
import type { ProfileEditFormValues } from "../schemas";

export async function updateCompanyProfile(
  payload: Partial<ProfileEditFormValues>,
  status?: string,
) {
  if (status === "pending" || status === "rejected") {
    // Strip out undefined/null/empty values to avoid validation errors
    const cleanedPayload = Object.fromEntries(
      Object.entries(payload).filter(
        ([key, value]) =>
          key !== "slug" &&
          value !== undefined &&
          value !== null &&
          value !== "",
      ),
    );
    const res = await updateCompanyRegistration(
      cleanedPayload as Partial<CompanySignupRequest>,
    );
    return {
      data: res.response as unknown as CompanyProfile,
      message:
        (res as { message?: { general?: string[] } }).message?.general?.[0] ||
        "Company registration updated and resubmitted successfully.",
    };
  }

  const res = await apiClient.patch(
    endpoints.company.profile,
    payload,
    CompanyProfileResponseSchema,
  );
  return {
    data: res.response,
    message:
      (res as { message?: { general?: string[] } }).message?.general?.[0] ||
      "Company profile updated successfully",
  };
}
