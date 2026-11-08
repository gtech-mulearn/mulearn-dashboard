/**
 * Problem Statement — Learner / Public API
 *
 * 📍 src/features/problem-statements/api/problem-statements.api.ts
 *
 * Learner-facing and public-readable operations:
 *   - Feed (public, optional auth for my_interaction)
 *   - Detail (public, optional auth)
 *   - Interaction toggle (auth required): GET / PUT / DELETE <id>/interaction/
 *   - Interaction counts: GET <id>/interaction/counts/
 *
 * Pattern: apiClient.get<T> — gateway auto-unwraps the Django envelope.
 */

import { endpoints } from "@/api";
import { apiClient, publicApiClient } from "@/api/client";
import {
  GenericResponseSchema,
  InteractionCountsResponseSchema,
  LearnerInteractionResponseSchema,
  ProblemStatementDetailResponseSchema,
  ProblemStatementListResponseSchema,
  SetInteractionResponseSchema,
} from "../schemas";
import type {
  FeedQueryParams,
  LearnerInteraction,
  PaginatedResponse,
  ProblemStatement,
  SetInteractionPayload,
  SubmitSolutionPayload,
} from "../types/problem-statement.types";

// ─── Feed ─────────────────────────────────────────────────────────────────────

/**
 * Paginated feed of Published statements.
 * Uses publicApiClient so anonymous users can browse without a Bearer token.
 * If `authenticated` is true, uses apiClient so `my_interaction` is populated.
 */
export async function fetchProblemStatementFeed(
  params?: FeedQueryParams,
  authenticated = false,
): Promise<PaginatedResponse<ProblemStatement>> {
  const query = buildFeedQuery(params);
  const url = query
    ? `${endpoints.problemStatements.feed}?${query}`
    : endpoints.problemStatements.feed;

  const client = authenticated ? apiClient : publicApiClient;
  const res = await client.get(url, ProblemStatementListResponseSchema);
  return res.response;
}

/**
 * Fetches all problem statements across all pages for authenticated personal interaction tabs
 * ("I'm Trying" and "Submitted"), ensuring learners never miss challenges outside page 1.
 */
export async function fetchPersonalProblemStatements(
  params?: Omit<FeedQueryParams, "pageIndex" | "perPage">,
): Promise<ProblemStatement[]> {
  const firstPage = await fetchProblemStatementFeed(
    { ...params, pageIndex: 1, perPage: 100 },
    true,
  );

  const all = [...firstPage.data];
  const totalPages = firstPage.pagination.totalPages;

  if (totalPages > 1) {
    const remainingPages = Array.from(
      { length: totalPages - 1 },
      (_, i) => i + 2,
    );
    const rest = await Promise.all(
      remainingPages.map((page) =>
        fetchProblemStatementFeed(
          { ...params, pageIndex: page, perPage: 100 },
          true,
        ),
      ),
    );
    for (const res of rest) {
      all.push(...res.data);
    }
  }

  return all;
}

function buildFeedQuery(params?: FeedQueryParams): string {
  if (!params) return "";
  const q = new URLSearchParams();
  if (params.pageIndex) q.set("pageIndex", String(params.pageIndex));
  if (params.perPage) q.set("perPage", String(params.perPage));
  if (params.search?.trim()) q.set("search", params.search.trim());
  if (params.category) q.set("category", params.category);
  if (params.skill) q.set("skill", params.skill);
  if (params.company_id) q.set("company_id", params.company_id);
  if (params.source) q.set("source", params.source);
  if (params.open_only) q.set("open_only", "true");
  if (params.sortBy) q.set("sortBy", params.sortBy);
  return q.toString();
}

// ─── Detail ───────────────────────────────────────────────────────────────────

/** Fetch a single published statement by ID. Public read, optionally authenticated. */
export async function fetchProblemStatementDetail(
  id: string,
  authenticated = false,
): Promise<ProblemStatement> {
  const client = authenticated ? apiClient : publicApiClient;
  const res = await client.get(
    endpoints.problemStatements.detail(id),
    ProblemStatementDetailResponseSchema,
  );
  return res.response;
}

// ─── Learner Interaction ──────────────────────────────────────────────────────

/** GET <id>/interaction/ — current learner's interaction (status null if none). */
export async function fetchMyInteraction(
  id: string,
): Promise<LearnerInteraction> {
  const res = await apiClient.get(
    endpoints.problemStatements.interaction(id),
    LearnerInteractionResponseSchema,
  );
  return res.response;
}

/**
 * PUT <id>/interaction/ — add or change interaction.
 * Returns updated status + new counts.
 */
export async function setInteraction(
  id: string,
  payload: SetInteractionPayload = { status: "Trying" },
): Promise<{ status: string; counts: Record<string, number> }> {
  const res = await apiClient.put(
    endpoints.problemStatements.interactionPut(id),
    payload,
    SetInteractionResponseSchema,
  );
  return res.response;
}

/**
 * DELETE <id>/interaction/ — remove own interaction.
 * Still allowed after deadline (unless submitted after deadline, which returns 409).
 */
export async function removeInteraction(id: string): Promise<void> {
  await apiClient.delete(
    endpoints.problemStatements.interactionDelete(id),
    GenericResponseSchema,
  );
}

/**
 * PUT <id>/submission/ — submit or replace a solution link.
 * Allowed only while published and before deadline.
 */
export async function submitSolution(
  id: string,
  payload: SubmitSolutionPayload,
): Promise<{
  status: "Submitted";
  submission_url: string;
  submitted_at: string;
  created_at: string;
  updated_at: string;
  counts: Record<string, number>;
}> {
  const res = await apiClient.put(
    endpoints.problemStatements.submissionPut(id),
    payload,
    GenericResponseSchema,
  );
  return res.response as {
    status: "Submitted";
    submission_url: string;
    submitted_at: string;
    created_at: string;
    updated_at: string;
    counts: Record<string, number>;
  };
}

/**
 * DELETE <id>/submission/ — withdraw solution link and reset status back to Trying.
 * Returns 409 after deadline (submissions are locked).
 */
export async function withdrawSubmission(id: string): Promise<void> {
  await apiClient.delete(
    endpoints.problemStatements.submissionDelete(id),
    GenericResponseSchema,
  );
}

/** GET <id>/interaction/counts/ — interaction counts object. */
export async function fetchInteractionCounts(
  id: string,
): Promise<Record<string, number>> {
  const res = await apiClient.get(
    endpoints.problemStatements.interactionCounts(id),
    InteractionCountsResponseSchema,
  );
  return res.response;
}
