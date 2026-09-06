import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import {
  type UnverifiedOrgListData,
  UnverifiedOrgListResponseSchema,
  VerificationMutationResponseSchema,
  type VerifyOrgFormValues,
} from "../schemas/verification.schema";

export interface FetchUnverifiedOrgsParams {
  pageIndex?: number;
  perPage?: number;
  search?: string;
  sortBy?: string;
}

export async function fetchUnverifiedOrgs(
  params: FetchUnverifiedOrgsParams = {},
): Promise<UnverifiedOrgListData> {
  const query = new URLSearchParams();
  if (params.pageIndex) query.set("pageIndex", String(params.pageIndex));
  if (params.perPage) query.set("perPage", String(params.perPage));
  if (params.search?.trim()) query.set("search", params.search.trim());
  if (params.sortBy?.trim()) query.set("sortBy", params.sortBy.trim());

  const response = await apiClient.get(
    `${endpoints.organization.verificationList}?${query.toString()}`,
    UnverifiedOrgListResponseSchema,
  );
  return response.response;
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
