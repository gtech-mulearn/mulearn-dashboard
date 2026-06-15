import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import {
  type UnverifiedOrgItem,
  UnverifiedOrgListResponseSchema,
  VerificationMutationResponseSchema,
  type VerifyOrgFormValues,
} from "../schemas/verification.schema";

export async function fetchUnverifiedOrgs(): Promise<UnverifiedOrgItem[]> {
  const response = await apiClient.get(
    endpoints.organization.verificationList,
    UnverifiedOrgListResponseSchema,
  );
  const payload = response.response ?? response.data;
  return Array.isArray(payload) ? payload : [];
}

export async function verifyOrganization(
  uorgId: string,
  data: VerifyOrgFormValues,
): Promise<void> {
  await apiClient.post(
    endpoints.organization.verification(uorgId),
    data,
    VerificationMutationResponseSchema,
  );
}
