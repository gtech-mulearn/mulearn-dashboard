import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import {
  AffiliationListResponseSchema,
  GenericMutationResponseSchema,
  OrgListResponseSchema,
  type OrgFormValues,
  type OrgInfo,
  type OrgListData,
  type AffiliationItem,
} from "../schemas";

// ─── Query params ─────────────────────────────────────────────────────────────

export interface FetchOrgsParams {
  pageIndex: number;
  perPage: number;
  search?: string;
  sortBy?: string;
  org_type: string;
}

// ─── Fetch Organizations ──────────────────────────────────────────────────────

export async function fetchOrganizations(
  params: FetchOrgsParams,
): Promise<OrgListData> {
  const query = new URLSearchParams({
    perPage: String(params.perPage),
    pageIndex: String(params.pageIndex),
  });
  if (params.search?.trim()) query.set("search", params.search.trim());
  if (params.sortBy?.trim()) query.set("sortBy", params.sortBy.trim());

  // org_type is a URL path segment, e.g. /institutes/college/
  // This matches the established pattern in endpoints.search.colleges / .schools
  const response = await apiClient.get(
    `${endpoints.organizations.listByType(params.org_type)}?${query.toString()}`,
    OrgListResponseSchema,
  );
  return response.response;
}

// ─── Create Organization ──────────────────────────────────────────────────────

export async function createOrganization(
  payload: OrgFormValues,
): Promise<void> {
  // country and state are UI-only cascade fields; the backend rejects them
  const { country: _c, state: _s, ...backendPayload } = payload;
  await apiClient.post(
    endpoints.organizations.create,
    backendPayload,
    GenericMutationResponseSchema,
  );
}

// ─── Edit Organization ────────────────────────────────────────────────────────

export async function editOrganization(
  code: string,
  payload: OrgFormValues,
): Promise<void> {
  // country and state are UI-only cascade fields; the backend rejects them
  const { country: _c, state: _s, ...backendPayload } = payload;
  await apiClient.put(
    endpoints.organizations.edit(code),
    backendPayload,
    GenericMutationResponseSchema,
  );
}

// ─── Delete Organization ──────────────────────────────────────────────────────

export async function deleteOrganization(code: string): Promise<void> {
  await apiClient.delete(
    endpoints.organizations.delete(code),
    undefined,
    GenericMutationResponseSchema,
  );
}

// ─── CSV Download ─────────────────────────────────────────────────────────────

export async function downloadOrgsCsv(orgType: string): Promise<void> {
  const blob = await apiClient.get<Blob>(
    endpoints.organizations.csv(orgType),
    undefined,
    { responseType: "blob" },
  );

  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `organizations-${orgType.toLowerCase()}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

// ─── Affiliation Dropdown ─────────────────────────────────────────────────────

export async function fetchAffiliations(): Promise<AffiliationItem[]> {
  const response = await apiClient.get(
    endpoints.organizations.affiliationList,
    AffiliationListResponseSchema,
  );
  return response.response;
}

// ─── Location dropdowns (cascading) ──────────────────────────────────────────
// Reuse existing location endpoints

function mapToOptions(data: any): { value: string; label: string }[] {
  const arr = Array.isArray(data) ? data : [];
  return arr.map((item: any) => ({
    value: String(item?.value || item?.id || item?.name || item?.title || ""),
    label: String(item?.label || item?.title || item?.name || item?.id || ""),
  }));
}

export async function fetchCountriesDropdown(): Promise<
  { value: string; label: string }[]
> {
  const data = await apiClient.get(endpoints.countries.dropdownList);
  return mapToOptions(data);
}

export async function fetchStatesDropdown(): Promise<
  { value: string; label: string }[]
> {
  const data = await apiClient.get(endpoints.states.dropdownList);
  return mapToOptions(data);
}

export async function fetchDistrictsDropdown(
  stateId?: string,
): Promise<{ value: string; label: string }[]> {
  if (!stateId) return [];
  const data = (await apiClient.post(endpoints.location.districts, {
    state: stateId,
  })) as { districts: any[] };
  return mapToOptions(data.districts || data);
}

// Re-export types for convenience
export type { OrgInfo, OrgListData, OrgFormValues, AffiliationItem };
