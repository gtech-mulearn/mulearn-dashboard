import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import {
  GenericMutationResponseSchema,
  type RoleVerificationList,
  RoleVerificationListResponseSchema,
} from "../schemas";

interface FetchParams {
  pageIndex: number;
  perPage: number;
  search?: string;
  sortBy?: string;
}

export async function fetchRoleVerifications(
  params: FetchParams,
): Promise<RoleVerificationList> {
  const query = new URLSearchParams({
    perPage: String(params.perPage),
    pageIndex: String(params.pageIndex),
  });

  if (params.search?.trim()) {
    query.set("search", params.search.trim());
  }

  if (params.sortBy?.trim()) {
    // Backend expects ascending columns normally, or prefixed by '-' for desc
    query.set("sortBy", params.sortBy.trim());
  }

  const response = await apiClient.get(
    `${endpoints.admin.roleVerification.list}?${query.toString()}`,
    RoleVerificationListResponseSchema,
  );

  return response.response;
}

export async function updateRoleVerification(
  id: string,
  verified: boolean,
): Promise<void> {
  await apiClient.patch(
    endpoints.admin.roleVerification.update(id),
    { verified },
    GenericMutationResponseSchema,
  );
}

export async function deleteRoleVerification(id: string): Promise<void> {
  await apiClient.delete(
    endpoints.admin.roleVerification.delete(id),
    GenericMutationResponseSchema,
  );
}
