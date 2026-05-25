import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import type { Opportunity, OpportunityFormValues } from "../schemas";
import {
  GenericResponseSchema,
  OpportunityListResponseSchema,
  SingleOpportunityResponseSchema,
} from "../schemas";

const OPT = { skipAuthRedirectOn403: true } as const;

interface ListParams {
  status?: string;
  page?: number;
  search?: string;
}

export async function fetchOpportunities(params: ListParams = {}): Promise<{
  data: Opportunity[];
  totalPages: number;
}> {
  const q = new URLSearchParams();
  if (params.status) q.set("status", params.status);
  if (params.page) q.set("page", String(params.page));
  if (params.search) q.set("search", params.search);

  const url =
    params.status || params.page || params.search
      ? `${endpoints.mentor.opportunities}?${q}`
      : endpoints.mentor.opportunities;

  const res = await apiClient.get(url, OpportunityListResponseSchema, OPT);
  return {
    data: res.response.data,
    totalPages: res.response.pagination?.totalPages ?? 1,
  };
}

function toBackendPayload(data: Partial<OpportunityFormValues>) {
  const { ig_id, application_url, starts_at, ends_at, ...rest } = data;
  const payload: Record<string, unknown> = { ...rest };
  if (ig_id !== undefined) payload.ig = ig_id;
  if (application_url !== undefined)
    payload.application_url = application_url || null;
  if (starts_at !== undefined) payload.starts_at = starts_at || null;
  if (ends_at !== undefined) payload.ends_at = ends_at || null;
  return payload;
}

export async function createOpportunity(
  data: OpportunityFormValues,
): Promise<Opportunity> {
  const res = await apiClient.post(
    endpoints.mentor.opportunities,
    toBackendPayload(data),
    SingleOpportunityResponseSchema,
    OPT,
  );
  return res.response.opportunity;
}

export async function updateOpportunity(
  id: string,
  data: Partial<OpportunityFormValues>,
): Promise<Opportunity> {
  const res = await apiClient.patch(
    endpoints.mentor.opportunity(id),
    toBackendPayload(data),
    SingleOpportunityResponseSchema,
    OPT,
  );
  return res.response.opportunity;
}

export async function deleteOpportunity(id: string): Promise<void> {
  await apiClient.delete(
    endpoints.mentor.opportunity(id),
    undefined,
    GenericResponseSchema,
    OPT,
  );
}
