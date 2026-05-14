import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import { CompanyProfileResponseSchema } from "@/features/company-jobs/schemas";
import type { CompanyProfile } from "@/features/company-jobs/types";
import type { ProfileEditFormValues } from "../schemas";

export async function updateCompanyProfile(
  payload: Partial<ProfileEditFormValues>,
): Promise<CompanyProfile> {
  const res = await apiClient.patch(
    endpoints.company.profile,
    payload,
    CompanyProfileResponseSchema,
  );
  return res.response;
}
