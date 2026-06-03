import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import {
  type CompanyVerificationListData,
  CompanyVerificationListResponseSchema,
  type VerificationActionFormValues,
  VerificationActionResponseSchema,
} from "../schemas";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FetchCompanyVerificationParams {
  pageIndex: number;
  perPage: number;
  search?: string;
  sortBy?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}

// ─── Verification Requests ────────────────────────────────────────────────────

/**
 * Admin: List companies in the verification queue.
 * Supports filtering by status, date range, search, and pagination.
 */
export async function fetchCompanyVerificationRequests(
  params: FetchCompanyVerificationParams,
): Promise<CompanyVerificationListData> {
  const query = new URLSearchParams({
    perPage: String(params.perPage),
    pageIndex: String(params.pageIndex),
  });

  if (params.search?.trim()) query.set("search", params.search.trim());
  if (params.sortBy?.trim()) query.set("sortBy", params.sortBy.trim());
  if (params.status) query.set("status", params.status);
  if (params.dateFrom) query.set("dateFrom", params.dateFrom);
  if (params.dateTo) query.set("dateTo", params.dateTo);

  const response = await apiClient.get(
    `${endpoints.company.list}?${query.toString()}`,
    CompanyVerificationListResponseSchema,
  );

  return response.response;
}

/**
 * Admin: Approve or reject a company verification request.
 * Requires a reason when action is "reject".
 */
export async function verifyCompany(
  companyId: string,
  payload: VerificationActionFormValues,
): Promise<void> {
  await apiClient.patch(
    endpoints.company.verify(companyId),
    payload,
    VerificationActionResponseSchema,
  );
}
