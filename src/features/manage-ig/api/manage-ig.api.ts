import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import type {
  InterestGroupCreate,
  InterestGroupListResponse,
  InterestGroupRequestListResponse,
  InterestGroupUpdate,
} from "../schemas";
import {
  InterestGroupListResponseSchema,
  InterestGroupRequestListResponseSchema,
} from "../schemas";

export async function getAdminInterestGroups(params: {
  pageIndex?: number;
  perPage?: number;
  search?: string;
  sortBy?: string;
}): Promise<InterestGroupListResponse> {
  const query = new URLSearchParams();
  if (params.pageIndex) query.append("pageIndex", params.pageIndex.toString());
  if (params.perPage) query.append("perPage", params.perPage.toString());
  if (params.search) query.append("search", params.search);
  if (params.sortBy) query.append("sortBy", params.sortBy);

  const response = await apiClient.get(
    `${endpoints.admin.interestGroups.list}?${query.toString()}`,
    InterestGroupListResponseSchema,
  );
  return response.response;
}

export async function createInterestGroup(
  data: InterestGroupCreate,
): Promise<void> {
  return apiClient.post(endpoints.admin.interestGroups.create, data);
}

export async function updateInterestGroup(
  id: string,
  data: InterestGroupUpdate,
): Promise<void> {
  return apiClient.put(endpoints.admin.interestGroups.edit(id), data);
}

export async function partialUpdateInterestGroup(
  id: string,
  data: Partial<InterestGroupUpdate>,
): Promise<void> {
  return apiClient.patch(
    endpoints.admin.interestGroups.partialUpdate(id),
    data,
  );
}

export async function deleteInterestGroup(id: string): Promise<void> {
  return apiClient.delete(endpoints.admin.interestGroups.delete(id));
}

export async function exportIgCSV(): Promise<Blob> {
  return apiClient.get(endpoints.admin.interestGroups.csv, undefined, {
    responseType: "blob",
  });
}

export async function getIgRequests(params: {
  user_id?: string;
  status?: string;
  perPage?: number;
  pageIndex?: number;
  search?: string;
  sortBy?: string;
}): Promise<InterestGroupRequestListResponse> {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) query.append(key, value.toString());
  });

  const response = await apiClient.get(
    `${endpoints.admin.interestGroups.requestList}?${query.toString()}`,
    InterestGroupRequestListResponseSchema,
  );
  return response.response;
}

export async function updateIgRequestStatus(
  id: string,
  status: "active" | "requested" | "cancelled" | "rejected",
): Promise<void> {
  return apiClient.patch(endpoints.admin.interestGroups.requestUpdate(id), {
    status,
  });
}

export async function submitIgRequest(data: {
  name: string;
  code: string;
  category: string;
  icon: string;
}): Promise<void> {
  return apiClient.post(endpoints.admin.interestGroups.requestSubmit, data);
}
