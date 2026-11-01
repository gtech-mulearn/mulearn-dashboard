/**
 * Problem Statement — Admin API
 *
 * 📍 src/features/problem-statements/api/admin.api.ts
 *
 * Platform-admin endpoints. Admins can act on any statement in any status.
 * Admin list accepts company_id filter (or search for muLearn).
 * Admin create creates a statement directly from muLearn (company_id is NOT accepted).
 *
 * Routes prefix: /api/v1/dashboard/problem-statements/admin/
 * Pattern: apiClient.get/post/patch/delete<T> — gateway auto-unwraps envelope.
 */

import { endpoints } from "@/api";
import { ApiError, apiClient } from "@/api/client";
import {
  GenericResponseSchema,
  InteractionsListResponseSchema,
  ProblemStatementDetailResponseSchema,
  ProblemStatementListResponseSchema,
} from "../schemas";
import type {
  AdminCreateStatementPayload,
  AdminQueryParams,
  InteractionsQueryParams,
  InteractionUser,
  PaginatedResponse,
  ProblemStatement,
  UpdateStatementPayload,
} from "../types/problem-statement.types";

// ─── List ─────────────────────────────────────────────────────────────────────

/** GET admin/ — all statements across all companies. Extra filter: company_id. */
export async function adminFetchStatements(
  params?: AdminQueryParams,
): Promise<PaginatedResponse<ProblemStatement>> {
  const q = new URLSearchParams();
  if (params?.pageIndex) q.set("pageIndex", String(params.pageIndex));
  if (params?.perPage) q.set("perPage", String(params.perPage));
  if (params?.search?.trim()) q.set("search", params.search.trim());
  if (params?.status && params.status !== "all") q.set("status", params.status);
  if (params?.category) q.set("category", params.category);
  if (params?.source) q.set("source", params.source);
  if (params?.sortBy) q.set("sortBy", params.sortBy);
  if (params?.company_id) q.set("company_id", params.company_id);
  const query = q.toString();
  const url = query
    ? `${endpoints.problemStatements.adminList}?${query}`
    : endpoints.problemStatements.adminList;
  try {
    const res = await apiClient.get(url, ProblemStatementListResponseSchema);
    return res.response;
  } catch (error) {
    if (
      error instanceof ApiError &&
      (error.status === 404 ||
        error.message?.toLowerCase().includes("not found"))
    ) {
      return {
        data: [],
        pagination: {
          count: 0,
          totalPages: 1,
          isNext: false,
          isPrev: false,
          nextPage: null,
        },
      };
    }
    throw error;
  }
}

// ─── Detail ───────────────────────────────────────────────────────────────────

export async function adminFetchStatementDetail(
  id: string,
): Promise<ProblemStatement> {
  const res = await apiClient.get(
    endpoints.problemStatements.adminDetail(id),
    ProblemStatementDetailResponseSchema,
  );
  return res.response;
}

// ─── Create ───────────────────────────────────────────────────────────────────

/** POST admin/ — create a statement from muLearn. Not attributed to any company — company_id is not accepted. Created as Draft. */
export async function adminCreateStatement(
  payload: AdminCreateStatementPayload,
): Promise<ProblemStatement> {
  const res = await apiClient.post(
    endpoints.problemStatements.adminCreate,
    payload,
    ProblemStatementDetailResponseSchema,
  );
  return res.response;
}

// ─── Update ───────────────────────────────────────────────────────────────────

/** PATCH admin/<id>/ — update any statement. The company cannot be changed. */
export async function adminUpdateStatement(
  id: string,
  payload: UpdateStatementPayload,
): Promise<ProblemStatement> {
  const res = await apiClient.patch(
    endpoints.problemStatements.adminUpdate(id),
    payload,
    ProblemStatementDetailResponseSchema,
  );
  return res.response;
}

// ─── Delete ───────────────────────────────────────────────────────────────────

/** DELETE admin/<id>/ — delete any statement with its interactions. */
export async function adminDeleteStatement(id: string): Promise<void> {
  await apiClient.delete(
    endpoints.problemStatements.adminDelete(id),
    GenericResponseSchema,
  );
}

// ─── Lifecycle ────────────────────────────────────────────────────────────────

/** POST admin/<id>/publish/ */
export async function adminPublishStatement(id: string): Promise<void> {
  await apiClient.post(
    endpoints.problemStatements.adminPublish(id),
    {},
    GenericResponseSchema,
  );
}

/** POST admin/<id>/unpublish/ */
export async function adminUnpublishStatement(id: string): Promise<void> {
  await apiClient.post(
    endpoints.problemStatements.adminUnpublish(id),
    {},
    GenericResponseSchema,
  );
}

// ─── Interactions (Learners Trying) ──────────────────────────────────────────

/**
 * GET admin/<id>/interactions/
 * Returns { counts, data, pagination }.
 */
export async function adminFetchInteractions(
  id: string,
  params?: InteractionsQueryParams,
): Promise<{
  counts: Record<string, number>;
  data: InteractionUser[];
  pagination: PaginatedResponse<InteractionUser>["pagination"];
}> {
  const q = new URLSearchParams();
  if (params?.pageIndex) q.set("pageIndex", String(params.pageIndex));
  if (params?.perPage) q.set("perPage", String(params.perPage));
  if (params?.search?.trim()) q.set("search", params.search.trim());
  if (params?.status) q.set("status", params.status);
  if (params?.sortBy) q.set("sortBy", params.sortBy);
  const query = q.toString();
  const url = query
    ? `${endpoints.problemStatements.adminInteractions(id)}?${query}`
    : endpoints.problemStatements.adminInteractions(id);
  const res = await apiClient.get(url, InteractionsListResponseSchema);
  return res.response;
}

/**
 * DELETE admin/<id>/interactions/<user_id>/
 * Remove a specific user's interaction. Returns 404 if it does not exist.
 */
export async function adminDeleteUserInteraction(
  statementId: string,
  userId: string,
): Promise<void> {
  await apiClient.delete(
    endpoints.problemStatements.adminDeleteInteraction(statementId, userId),
    GenericResponseSchema,
  );
}
