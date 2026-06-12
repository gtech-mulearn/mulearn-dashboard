import type { z } from "zod";
import { apiClient } from "@/api/client";
import {
  type AffiliationItem,
  AffiliationListResponseSchema,
  LocationListResponseSchema,
  type LocationOption,
  type OrgFormData,
  type OrgInfo,
  type OrgType,
  type PaginationSchema,
} from "../schemas";

// ─── Endpoints (inline, matching the spec) ────────────────────────────────────

const BASE = "/api/v1/dashboard/organisation/institutes";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FetchOrganizationsParams {
  perPage: number;
  pageIndex: number;
  search?: string;
  sortBy?: string;
  org_type: OrgType;
}

// ─── Normalised return type ───────────────────────────────────────────────────

export interface OrganizationsListData {
  data: OrgInfo[];
  pagination: z.infer<typeof PaginationSchema>;
}

// ─── List ─────────────────────────────────────────────────────────────────────

export async function fetchOrganizations(
  params: FetchOrganizationsParams,
): Promise<OrganizationsListData> {
  // org_type is a PATH parameter: GET /institutes/{org_type}/
  // Do NOT pass a Zod schema here — apiClient already unwraps the Django
  // envelope ({hasError, statusCode, response}) before Zod runs, so an
  // envelope-level schema always mismatches. Normalise manually instead.
  const query = new URLSearchParams({
    perPage: String(params.perPage),
    pageIndex: String(params.pageIndex),
  });

  if (params.search?.trim()) query.set("search", params.search.trim());
  if (params.sortBy?.trim()) query.set("sortBy", params.sortBy.trim());

  const raw = await apiClient.get<unknown>(
    `${BASE}/${params.org_type}/?${query.toString()}`,
  );

  return normaliseOrgListResponse(raw);
}

/**
 * Normalise the raw (already-unwrapped) API payload into a stable
 * { data: OrgInfo[], pagination } shape regardless of what the backend
 * actually returns (flat array, paginated object, or nested response key).
 */
function normaliseOrgListResponse(raw: unknown): OrganizationsListData {
  // If the client returned the envelope intact (shouldn't happen, but guard)
  const unwrapped =
    raw && typeof raw === "object" && "response" in raw
      ? (raw as Record<string, unknown>).response
      : raw;

  // Flat array: [ {...}, {...} ]
  if (Array.isArray(unwrapped)) {
    return {
      data: unwrapped as OrgInfo[],
      pagination: { count: unwrapped.length, totalPages: 1 },
    };
  }

  // Paginated object: { data: [...], pagination: {...} }
  if (
    unwrapped &&
    typeof unwrapped === "object" &&
    "data" in unwrapped &&
    Array.isArray((unwrapped as Record<string, unknown>).data)
  ) {
    const obj = unwrapped as Record<string, unknown>;
    return {
      data: (obj.data as OrgInfo[]) ?? [],
      pagination: (obj.pagination as z.infer<typeof PaginationSchema>) ?? {},
    };
  }

  // Fallback: empty
  return { data: [], pagination: {} };
}

// ─── Detail ───────────────────────────────────────────────────────────────────

export async function fetchOrganizationDetails(id: string): Promise<OrgInfo> {
  const response = await apiClient.get<{ response: OrgInfo }>(
    `${BASE}/info/${id}/`,
  );
  // apiClient returns the unwrapped response field when a typed generic is given
  return response as unknown as OrgInfo;
}

// ─── Create ───────────────────────────────────────────────────────────────────

export async function addOrganization(data: OrgFormData): Promise<void> {
  await apiClient.post(`${BASE}/create/`, data);
}

// ─── Edit ─────────────────────────────────────────────────────────────────────

export async function editOrganization(
  code: string,
  data: OrgFormData,
): Promise<void> {
  await apiClient.put(`${BASE}/edit/${code}/`, data);
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function deleteOrganization(code: string): Promise<void> {
  await apiClient.delete(`${BASE}/delete/${code}/`);
}

// ─── CSV export ───────────────────────────────────────────────────────────────

export async function downloadOrganizationCsv(orgType: OrgType): Promise<Blob> {
  const response = await apiClient.get<Blob>(
    `${BASE}/${orgType}/csv/`,
    undefined,
    { responseType: "blob" },
  );
  return response as unknown as Blob;
}

// ─── Affiliation dropdown ─────────────────────────────────────────────────────

export async function fetchAffiliations(): Promise<AffiliationItem[]> {
  const response = await apiClient.get(
    "/api/v1/dashboard/organisation/affiliation/list/",
    AffiliationListResponseSchema,
  );
  return response as unknown as AffiliationItem[];
}

// ─── Country list ─────────────────────────────────────────────────────────────

export async function fetchCountries(): Promise<LocationOption[]> {
  const response = await apiClient.get(
    "/api/v1/dashboard/location/countries/list/",
    LocationListResponseSchema,
  );
  return response as LocationOption[];
}

// ─── State list ───────────────────────────────────────────────────────────────

export async function fetchStates(
  countryId: string,
): Promise<LocationOption[]> {
  const response = await apiClient.post(
    "/api/v1/register/state/list/",
    { country: countryId },
    LocationListResponseSchema,
  );
  return response as LocationOption[];
}

// ─── District list ────────────────────────────────────────────────────────────

export async function fetchDistricts(
  stateId: string,
): Promise<LocationOption[]> {
  const response = await apiClient.post(
    "/api/v1/register/district/list/",
    { state: stateId },
    LocationListResponseSchema,
  );
  return response as LocationOption[];
}
