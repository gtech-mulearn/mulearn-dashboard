/**
 * Problem Statement Query Key Factory
 *
 * 📍 src/features/problem-statements/hooks/query-keys.ts
 *
 * Hierarchical query key factory for all problem statement data.
 * Invalidating a parent key cascades to all child keys.
 *
 * Aligned with PROBLEM_STATEMENT_API.md (company/ and admin/ prefixes).
 */

import type {
  AdminQueryParams,
  CompanyQueryParams,
  FeedQueryParams,
  InteractionsQueryParams,
} from "../types/problem-statement.types";

export const problemStatementKeys = {
  /** Root key — invalidating this clears ALL problem statement cache */
  all: ["problem-statements"] as const,

  // ── Public / Learner Feed ──────────────────────────────────────
  feeds: () => [...problemStatementKeys.all, "feed"] as const,
  feed: (params: FeedQueryParams, authenticated = false) =>
    [
      ...problemStatementKeys.feeds(),
      authenticated ? "auth" : "public",
      params,
    ] as const,
  feedPersonal: (params: Omit<FeedQueryParams, "pageIndex" | "perPage">) =>
    [...problemStatementKeys.feeds(), "personal", params] as const,

  // ── Detail ────────────────────────────────────────────────────
  details: () => [...problemStatementKeys.all, "detail"] as const,
  detail: (id: string, authenticated = false) =>
    [
      ...problemStatementKeys.details(),
      authenticated ? "auth" : "public",
      id,
    ] as const,

  // ── Interaction ───────────────────────────────────────────────
  interaction: (id: string) =>
    [...problemStatementKeys.all, "interaction", id] as const,
  interactionCounts: (id: string) =>
    [...problemStatementKeys.all, "interaction-counts", id] as const,

  // ── Company Management (company/) ─────────────────────────────
  company: () => [...problemStatementKeys.all, "company"] as const,
  companyLists: () => [...problemStatementKeys.company(), "list"] as const,
  companyList: (params: CompanyQueryParams) =>
    [...problemStatementKeys.companyLists(), params] as const,
  companyDetails: () => [...problemStatementKeys.company(), "detail"] as const,
  companyDetail: (id: string) =>
    [...problemStatementKeys.companyDetails(), id] as const,
  companyInteractions: (id: string, params?: InteractionsQueryParams) =>
    [
      ...problemStatementKeys.company(),
      "interactions",
      id,
      params ?? {},
    ] as const,

  // ── Admin (admin/) ─────────────────────────────────────────────
  admin: () => [...problemStatementKeys.all, "admin"] as const,
  adminLists: () => [...problemStatementKeys.admin(), "list"] as const,
  adminList: (params: AdminQueryParams) =>
    [...problemStatementKeys.adminLists(), params] as const,
  adminDetails: () => [...problemStatementKeys.admin(), "detail"] as const,
  adminDetail: (id: string) =>
    [...problemStatementKeys.adminDetails(), id] as const,
  adminInteractions: (id: string, params?: InteractionsQueryParams) =>
    [
      ...problemStatementKeys.admin(),
      "interactions",
      id,
      params ?? {},
    ] as const,
} as const;
