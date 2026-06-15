import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import {
  type AffiliationFormValues,
  type AffiliationListData,
  AffiliationListResponseSchema,
  GenericMutationResponseSchema,
} from "../schemas";

export interface FetchAffiliationsParams {
  pageIndex: number;
  perPage: number;
  search?: string;
  sortBy?: string;
}

// ─── Fetch (paginated) ────────────────────────────────────────────────────────

export async function fetchAffiliations(
  params: FetchAffiliationsParams,
): Promise<AffiliationListData> {
  const query = new URLSearchParams({
    perPage: String(params.perPage),
    pageIndex: String(params.pageIndex),
  });
  if (params.search?.trim()) query.set("search", params.search.trim());
  if (params.sortBy?.trim()) query.set("sortBy", params.sortBy.trim());

  const response = await apiClient.get(
    `${endpoints.affiliation.list}?${query.toString()}`,
    AffiliationListResponseSchema,
  );
  return response.response;
}

// ─── Create ───────────────────────────────────────────────────────────────────

export async function createAffiliation(
  payload: AffiliationFormValues,
): Promise<void> {
  await apiClient.post(
    endpoints.affiliation.create,
    payload,
    GenericMutationResponseSchema,
  );
}

// ─── Update ───────────────────────────────────────────────────────────────────

export async function updateAffiliation(
  id: string,
  payload: AffiliationFormValues,
): Promise<void> {
  await apiClient.put(
    endpoints.affiliation.update(id),
    payload,
    GenericMutationResponseSchema,
  );
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function deleteAffiliation(id: string): Promise<void> {
  await apiClient.delete(
    endpoints.affiliation.delete(id),
    undefined,
    GenericMutationResponseSchema,
  );
}

// Re-export types for convenience
export type { AffiliationFormValues };
