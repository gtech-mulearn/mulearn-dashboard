// ─── Opportunities API ────────────────────────────────────────────────────────
// 📍 src/features/mentor/opportunities/api/opportunities.api.ts
// ─────────────────────────────────────────────────────────────────────────────

import { apiClient, publicApiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";

import type { Opportunity, OpportunityFormValues } from "../schemas";

import {
  GenericResponseSchema,
  OpportunityListResponseSchema,
  SingleOpportunityResponseSchema,
} from "../schemas";

const OPT = { skipAuthRedirectOn403: true } as const;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface OpportunityListParams {
  page?: number;
  search?: string;
  ig_id?: string;
  org_id?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function unwrapOpportunity(
  response: Opportunity | { opportunity: Opportunity } | { data: Opportunity },
): Opportunity {
  if ("opportunity" in response) {
    return response.opportunity;
  }

  if ("data" in response) {
    return response.data;
  }

  return response;
}

function buildListQuery(params: OpportunityListParams): string {
  const query = new URLSearchParams();

  if (params.page) {
    query.set("page", String(params.page));
  }

  if (params.search) {
    query.set("search", params.search);
  }

  if (params.ig_id) {
    query.set("ig_id", params.ig_id);
  }

  if (params.org_id) {
    query.set("org_id", params.org_id);
  }

  const queryString = query.toString();

  return queryString ? `?${queryString}` : "";
}

// ─── Mentor Opportunities ────────────────────────────────────────────────────

/**
 * GET mentor/opportunities/
 *
 * Lists opportunities the logged-in mentor has management access to.
 *
 * The backend returns all lifecycle statuses together:
 * DRAFT / PUBLISHED / CLOSED / ARCHIVED
 */
export async function fetchOpportunities(
  params: OpportunityListParams = {},
): Promise<{ data: Opportunity[]; totalPages: number }> {
  const url = `${endpoints.mentor.opportunitiesList}${buildListQuery(params)}`;

  const res = await apiClient.get(url, OpportunityListResponseSchema, OPT);

  const responseData = res.response;

  if (Array.isArray(responseData)) {
    return {
      data: responseData,
      totalPages: 1,
    };
  }

  const { data, pagination } = responseData;

  const total = pagination?.total ?? data.length;
  const perPage = pagination?.per_page ?? data.length;

  return {
    data,
    totalPages: perPage > 0 ? Math.ceil(total / perPage) : 1,
  };
}

/**
 * POST mentor/opportunities/
 *
 * Creates a new opportunity.
 *
 * The backend always creates the opportunity as DRAFT,
 * regardless of any status value supplied by the frontend.
 */
export async function createOpportunity(
  data: OpportunityFormValues,
): Promise<Opportunity> {
  const { status: _status, ig_id, org_id, ...rest } = data;

  const payload = {
    ...rest,
    ...(ig_id ? { ig: ig_id } : {}),
    ...(org_id ? { org: org_id } : {}),
  };

  const res = await apiClient.post(
    endpoints.mentor.opportunitiesCreate,
    payload,
    SingleOpportunityResponseSchema,
    OPT,
  );

  return unwrapOpportunity(res.response);
}

/**
 * GET mentor/opportunities/{opportunity_id}/
 *
 * Returns a single opportunity.
 */
export async function fetchOpportunityDetail(
  opportunityId: string,
): Promise<Opportunity> {
  const res = await apiClient.get(
    endpoints.mentor.opportunityDetail(opportunityId),
    SingleOpportunityResponseSchema,
    OPT,
  );

  return unwrapOpportunity(res.response);
}

/**
 * PATCH mentor/opportunities/{opportunity_id}/
 *
 * Only the following fields are editable:
 * - title
 * - description
 * - eligibility
 * - application_url
 * - starts_at
 * - ends_at
 */
export async function updateOpportunity(
  opportunityId: string,
  data: Partial<OpportunityFormValues>,
): Promise<Opportunity> {
  const payload: Record<string, unknown> = {};

  if (data.title !== undefined) {
    payload.title = data.title;
  }

  if (data.description !== undefined) {
    payload.description = data.description;
  }

  if (data.eligibility !== undefined) {
    payload.eligibility = data.eligibility;
  }

  if (data.application_url !== undefined) {
    payload.application_url = data.application_url;
  }

  if (data.starts_at !== undefined) {
    payload.starts_at = data.starts_at;
  }

  if (data.ends_at !== undefined) {
    payload.ends_at = data.ends_at;
  }

  const res = await apiClient.patch(
    endpoints.mentor.opportunityUpdate(opportunityId),
    payload,
    SingleOpportunityResponseSchema,
    OPT,
  );

  return unwrapOpportunity(res.response);
}

/**
 * DELETE mentor/opportunities/{opportunity_id}/
 *
 * Soft-deletes the opportunity by archiving it.
 */
export async function deleteOpportunity(opportunityId: string): Promise<void> {
  await apiClient.delete(
    endpoints.mentor.opportunityDelete(opportunityId),
    undefined,
    GenericResponseSchema,
    OPT,
  );
}

/**
 * POST mentor/opportunities/{opportunity_id}/publish/
 *
 * Publishes a DRAFT opportunity.
 */
export async function publishOpportunity(
  opportunityId: string,
): Promise<Opportunity> {
  const res = await apiClient.post(
    endpoints.mentor.opportunityPublish(opportunityId),
    {},
    SingleOpportunityResponseSchema,
    OPT,
  );

  return unwrapOpportunity(res.response);
}

/**
 * POST mentor/opportunities/{opportunity_id}/close/
 *
 * Closes a PUBLISHED opportunity.
 */
export async function closeOpportunity(
  opportunityId: string,
): Promise<Opportunity> {
  const res = await apiClient.post(
    endpoints.mentor.opportunityClose(opportunityId),
    {},
    SingleOpportunityResponseSchema,
    OPT,
  );

  return unwrapOpportunity(res.response);
}

// ─── Public Opportunities ────────────────────────────────────────────────────

/**
 * GET mentor/opportunities/public/
 *
 * Public catalogue of currently available opportunities.
 *
 * Supported filters:
 * - page
 * - search
 * - ig_id
 * - org_id
 */
export async function fetchPublicOpportunities(
  params: OpportunityListParams = {},
): Promise<{ data: Opportunity[]; totalPages: number }> {
  const url = `${endpoints.mentor.opportunitiesPublic}${buildListQuery(params)}`;

  const res = await publicApiClient.get(
    url,
    OpportunityListResponseSchema,
    OPT,
  );

  const responseData = res.response;

  if (Array.isArray(responseData)) {
    return {
      data: responseData,
      totalPages: 1,
    };
  }

  const { data, pagination } = responseData;

  const total = pagination?.total ?? data.length;
  const perPage = pagination?.per_page ?? data.length;

  return {
    data,
    totalPages: perPage > 0 ? Math.ceil(total / perPage) : 1,
  };
}
