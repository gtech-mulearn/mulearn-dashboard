import { ApiError, apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import {
  type CompanyDetails,
  CompanyDetailsResponseSchema,
  type CompanyVerificationListData,
  CompanyVerificationListResponseSchema,
  GenericMutationResponseSchema,
} from "../schemas";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FetchCompanyVerificationParams {
  page: number;
  per_page: number;
  search?: string;
  sort_by?: string;
  status?: string;
  industry_sector?: string;
  dateFrom?: string;
  dateTo?: string;
}

// ─── Verification Requests ────────────────────────────────────────────────────

/**
 * Admin: List companies in the verification queue.
 * Supports filtering by status, industry_sector, search, sort, and pagination.
 */
export async function fetchCompanyVerificationRequests(
  params: FetchCompanyVerificationParams,
): Promise<CompanyVerificationListData> {
  const query = new URLSearchParams({
    page: String(params.page),
    per_page: String(params.per_page),
  });

  if (params.search?.trim()) query.set("search", params.search.trim());
  if (params.sort_by?.trim()) query.set("sort_by", params.sort_by.trim());
  if (params.status) query.set("status", params.status);
  if (params.industry_sector)
    query.set("industry_sector", params.industry_sector);
  if (params.dateFrom) query.set("dateFrom", params.dateFrom);
  if (params.dateTo) query.set("dateTo", params.dateTo);

  const response = await apiClient.get(
    `${endpoints.company.list}?${query.toString()}`,
    CompanyVerificationListResponseSchema,
  );

  // The schema transforms { response: {...} } down to {...} on success, but the
  // gateway's fallback path (schema validation failure) returns the raw,
  // untransformed envelope instead — so `response` may actually be either shape
  // at runtime despite the static type. Detect and unwrap that case defensively.
  const maybeWrapped = response as unknown as {
    response?: CompanyVerificationListData;
  };
  return maybeWrapped.response ?? response;
}

/**
 * Admin: Approve or reject a company verification request.
 * Requires a reason when action is "reject".
 */
export async function verifyCompany(
  companyId: string,
  payload: { status: string; rejection_reason?: string },
) {
  const res = await apiClient.patch(
    endpoints.company.verify(companyId),
    payload,
    GenericMutationResponseSchema,
  );
  return res.response;
}

/**
 * Admin: Get detailed information for a single company.
 */
export async function fetchCompanyDetails(
  companyId: string,
): Promise<CompanyDetails> {
  try {
    const response = await apiClient.get(
      endpoints.company.detail(companyId),
      CompanyDetailsResponseSchema,
    );

    return response.response;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return {
        id: companyId,
        name: "",
        slug: "",
        status: "",
      } as CompanyDetails;
    }
    throw error;
  }
}

/**
 * Admin: Deactivate a company.
 */
export async function deactivateCompanyAdmin(companyId: string) {
  const res = await apiClient.post(
    endpoints.company.deactivateAdmin(companyId),
    undefined,
    GenericMutationResponseSchema,
  );
  return res.response;
}

/**
 * Admin: Reactivate a deactivated company.
 */
export async function reactivateCompanyAdmin(companyId: string) {
  const res = await apiClient.post(
    endpoints.company.reactivateAdmin(companyId),
    undefined,
    GenericMutationResponseSchema,
  );
  return res.response;
}
