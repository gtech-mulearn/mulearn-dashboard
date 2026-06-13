import { apiClient } from "@/api/client";

// ─── Endpoints ────────────────────────────────────────────────────────────────

const LIST_BASE = "/api/v1/dashboard/organisation/affiliation/list/";
const CREATE_BASE =
  "/api/v1/dashboard/organisation/institutes/affiliation/create/";
const EDIT_BASE = (id: string) =>
  `/api/v1/dashboard/organisation/institutes/affiliation/edit/${id}/`;
const DELETE_BASE = (id: string) =>
  `/api/v1/dashboard/organisation/institutes/affiliation/delete/${id}/`;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AffiliationRecord {
  id: string;
  title: string;
  organization_count?: number | string;
  created_by?: string;
  created_at?: string;
  updated_by?: string;
  updated_at?: string;
}

export interface FetchAffiliationsParams {
  perPage: number;
  pageIndex: number;
  search?: string;
  sortBy?: string;
}

export interface AffiliationsListData {
  data: AffiliationRecord[];
  pagination: {
    count?: number;
    totalPages?: number;
    isNext?: boolean;
    isPrev?: boolean;
  };
}

// ─── Normalise raw payload ─────────────────────────────────────────────────────

function normaliseAffiliationsListResponse(raw: unknown): AffiliationsListData {
  const unwrapped =
    raw && typeof raw === "object" && "response" in raw
      ? (raw as Record<string, unknown>).response
      : raw;

  // Flat array: [ {...}, {...} ]
  if (Array.isArray(unwrapped)) {
    return {
      data: unwrapped as AffiliationRecord[],
      pagination: { count: unwrapped.length, totalPages: 1 },
    };
  }

  // Paginated envelope: { data: [...], pagination: {...} }
  if (
    unwrapped &&
    typeof unwrapped === "object" &&
    "data" in unwrapped &&
    Array.isArray((unwrapped as Record<string, unknown>).data)
  ) {
    const obj = unwrapped as Record<string, unknown>;
    return {
      data: (obj.data as AffiliationRecord[]) ?? [],
      pagination: (obj.pagination as AffiliationsListData["pagination"]) ?? {},
    };
  }

  // Fallback: empty
  return { data: [], pagination: {} };
}

// ─── List (paginated) ─────────────────────────────────────────────────────────

export async function fetchAffiliationList(
  params: FetchAffiliationsParams,
): Promise<AffiliationsListData> {
  const query = new URLSearchParams({
    perPage: String(params.perPage),
    pageIndex: String(params.pageIndex),
  });
  if (params.search) query.set("search", params.search);
  if (params.sortBy) query.set("sortBy", params.sortBy);

  const raw = await apiClient.get<unknown>(`${LIST_BASE}?${query.toString()}`);
  return normaliseAffiliationsListResponse(raw);
}

// ─── Create ───────────────────────────────────────────────────────────────────

export async function createAffiliation(title: string): Promise<void> {
  await apiClient.post(CREATE_BASE, { title });
}

// ─── Edit ─────────────────────────────────────────────────────────────────────

export async function editAffiliation(
  id: string,
  title: string,
): Promise<void> {
  await apiClient.put(EDIT_BASE(id), { title });
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function deleteAffiliation(id: string): Promise<void> {
  await apiClient.delete(DELETE_BASE(id));
}
