import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import type {
  Achievement,
  AchievementRule,
  AuditLog,
  CreateRuleRequest,
  IssuedLog,
  ManualIssueRequest,
  RevokeRequest,
  RuleMutationResponseData,
  SimulationResult,
  UserAchievement,
} from "../schemas";
import {
  AchievementListResponseSchema,
  AchievementRuleListResponseSchema,
  AchievementRuleResponseSchema,
  AuditLogListResponseSchema,
  type BulkIssueResponseData,
  BulkIssueResponseSchema,
  type ClaimResponseData,
  ClaimResponseSchema,
  type DebugResponseData,
  DebugResponseSchema,
  type EligibleAchievement,
  EligibleAchievementListResponseSchema,
  GenericSuccessResponseSchema,
  IssuedLogListResponseSchema,
  RuleMutationResponseSchema,
  SimulationListResponseSchema,
  UserAchievementListResponseSchema,
} from "../schemas";
// Note: RuleMutationResponseSchema is only used for createRule (POST).
// The PATCH endpoint returns a generic success envelope, not { rule_id, version }.

// ==========================================
// Achievement CRUD
// ==========================================

export async function fetchAchievements(): Promise<Achievement[]> {
  const res = await apiClient.get(
    endpoints.achievements.list,
    AchievementListResponseSchema,
  );
  return res.response;
}

export async function createAchievement(
  data: FormData | Record<string, unknown>,
): Promise<Achievement> {
  const isFormData = data instanceof FormData;
  return apiClient.post<Achievement>(
    endpoints.achievements.create,
    data,
    undefined,
    { isFormData },
  );
}

export async function updateAchievement(
  id: string,
  data: FormData | Record<string, unknown>,
): Promise<Achievement> {
  const isFormData = data instanceof FormData;
  return apiClient.put<Achievement>(
    endpoints.achievements.update(id),
    data,
    undefined,
    { isFormData },
  );
}

export async function deleteAchievement(id: string): Promise<void> {
  await apiClient.delete(
    endpoints.achievements.delete(id),
    GenericSuccessResponseSchema,
  );
}

// ==========================================
// Rules
// ==========================================

export async function fetchRules(): Promise<AchievementRule[]> {
  const res = await apiClient.get(
    endpoints.achievements.rules,
    AchievementRuleListResponseSchema,
  );
  return res.response;
}

export async function createRule(
  data: CreateRuleRequest,
): Promise<RuleMutationResponseData> {
  const res = await apiClient.post(
    endpoints.achievements.createRule,
    data,
    RuleMutationResponseSchema,
  );
  return res.response;
}

export async function updateRule(
  ruleId: string,
  data: CreateRuleRequest,
): Promise<void> {
  // achievement_id is immutable — the backend rejects it with 400 if included.
  // PATCH returns a generic success envelope (no rule_id/version), so we use
  // GenericSuccessResponseSchema rather than RuleMutationResponseSchema.
  const { achievement_id: _omit, ...patchBody } = data;
  await apiClient.patch(
    endpoints.achievements.updateRule(ruleId),
    patchBody,
    GenericSuccessResponseSchema,
  );
}

export async function deactivateRule(ruleId: string): Promise<void> {
  await apiClient.post(
    endpoints.achievements.deactivateRule(ruleId),
    {},
    GenericSuccessResponseSchema,
  );
}

export async function activateRule(ruleId: string): Promise<void> {
  await apiClient.post(
    endpoints.achievements.activateRule(ruleId),
    {},
    GenericSuccessResponseSchema,
  );
}

/**
 * Fetch the full detail of a single rule (GET /rules/<rule_id>/).
 * The endpoint is the same URL as PATCH updateRule but uses GET.
 */
export async function fetchSingleRule(
  ruleId: string,
): Promise<AchievementRule> {
  const res = await apiClient.get(
    endpoints.achievements.updateRule(ruleId),
    AchievementRuleResponseSchema,
  );
  return res.response;
}

// ==========================================
// Simulation & Debug
// ==========================================

export async function simulateForUser(
  muid: string,
): Promise<SimulationResult[]> {
  const res = await apiClient.get(
    endpoints.achievements.simulate(muid),
    SimulationListResponseSchema,
  );
  return res.response;
}

export async function debugAchievement(
  muid: string,
  achievementId: string,
): Promise<DebugResponseData> {
  const res = await apiClient.get(
    endpoints.achievements.debug(muid, achievementId),
    DebugResponseSchema,
  );
  return res.response;
}

// ==========================================
// Manual Issue / Revoke
// ==========================================

export async function manualIssue(data: ManualIssueRequest): Promise<void> {
  await apiClient.post(
    endpoints.achievements.manualIssue,
    data,
    GenericSuccessResponseSchema,
  );
}

export async function revokeAchievement(data: RevokeRequest): Promise<void> {
  await apiClient.post(
    endpoints.achievements.revoke,
    data,
    GenericSuccessResponseSchema,
  );
}

// ==========================================
// Bulk Issue
// ==========================================

export async function bulkIssueAchievements(
  formData: FormData,
): Promise<BulkIssueResponseData> {
  const res = await apiClient.post(
    endpoints.achievements.bulkIssue,
    formData,
    BulkIssueResponseSchema,
    { isFormData: true },
  );
  return res.response;
}

export async function issueVC(
  achievementId: string,
  vcUrl: string,
): Promise<void> {
  await apiClient.post(
    endpoints.achievements.issueVC,
    { achievement_id: achievementId, vc_url: vcUrl },
    GenericSuccessResponseSchema,
  );
}

export async function downloadBulkTemplate(): Promise<Blob> {
  return apiClient.get<Blob>(
    endpoints.achievements.bulkIssueTemplate,
    undefined,
    { responseType: "blob" },
  );
}

// NOTE (API doc §11.3): POST /bulk-claim/ requires a *backend API key* (X-API-Key header),
// NOT a user JWT. It also accepts optional { date_from, date_to } body params.
// This function should only be called server-side / by cron infrastructure, not from the
// user-facing dashboard. Calling it with a JWT will result in a 403.
export async function bulkClaimAchievements(
  dateFrom?: string,
  dateTo?: string,
): Promise<void> {
  await apiClient.post(
    endpoints.achievements.bulkClaim,
    { date_from: dateFrom, date_to: dateTo },
    GenericSuccessResponseSchema,
  );
}

// ==========================================
// Issued Logs
// ==========================================

export async function fetchIssuedLogs(
  page: number,
  perPage: number,
  search?: string,
  sortBy?: string,
  sortOrder?: "asc" | "desc",
): Promise<{
  data: IssuedLog[];
  pagination: {
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
  };
}> {
  // API doc §9.2: params are page, page_size (snake_case), search, sort_by, sort_order
  const query = new URLSearchParams({
    pageIndex: String(page),
    page: String(page),
    perPage: String(perPage),
    page_size: String(perPage),
  });
  if (search?.trim()) query.set("search", search.trim());
  if (sortBy) {
    query.set("sortBy", sortBy);
    query.set("sort_by", sortBy);
  }
  if (sortOrder) {
    query.set("sortOrder", sortOrder);
    query.set("sort_order", sortOrder);
  }

  const res = await apiClient.get(
    `${endpoints.achievements.issuedLog}?${query.toString()}`,
    IssuedLogListResponseSchema,
  );

  const responseData = res?.response;
  if (!responseData) {
    return {
      data: [],
      pagination: { total: 0, page, perPage, totalPages: 0 },
    };
  }

  if (Array.isArray(responseData)) {
    return {
      data: responseData,
      pagination: {
        total: responseData.length,
        page: 1,
        perPage: responseData.length,
        totalPages: 1,
      },
    };
  }

  const data = responseData.data || [];
  const pagination = responseData.pagination || {};
  return {
    data,
    pagination: {
      total: Number(pagination.count ?? data.length),
      page,
      perPage,
      totalPages: Number(pagination.totalPages ?? 1),
    },
  };
}

// ==========================================
// Audit Logs
// ==========================================

export async function fetchAuditLogs(muid: string): Promise<AuditLog[]> {
  const url = muid.trim()
    ? endpoints.achievements.auditLogs(muid)
    : endpoints.achievements.auditLogsAll;
  const res = await apiClient.get(url, AuditLogListResponseSchema);
  return res.response;
}

// ==========================================
// User Specific Achievements List
// ==========================================

/** Fetches the log of achievements a user has claimed (GET /list/user/<muid>/) */
export async function fetchUserAchievements(
  muid: string,
): Promise<UserAchievement[]> {
  const res = await apiClient.get(
    endpoints.achievements.userAchievements(muid),
    UserAchievementListResponseSchema,
  );
  return res.response;
}

/**
 * Fetches ALL achievements with a per-item `has_achievement` flag for a specific
 * user (GET /list/?user_id=<uuid>). This is the correct endpoint for the
 * Issue/Revoke panel — it returns every achievement so the UI knows what's
 * available to issue vs. already issued.
 */
export async function fetchAllAchievementsForUser(
  userId: string,
): Promise<UserAchievement[]> {
  const res = await apiClient.get(
    endpoints.achievements.listByUser(userId),
    UserAchievementListResponseSchema,
  );
  return res.response;
}

// ==========================================
// User-Facing Achievements (Eligible, Progress, Claim)
// ==========================================

export async function fetchEligibleAchievements(): Promise<
  EligibleAchievement[]
> {
  const res = await apiClient.get(
    endpoints.achievements.eligible,
    EligibleAchievementListResponseSchema,
  );
  return res.response;
}

export async function fetchAchievementProgress(): Promise<
  EligibleAchievement[]
> {
  const res = await apiClient.get(
    endpoints.achievements.progress,
    EligibleAchievementListResponseSchema,
  );
  return res.response;
}

export async function claimAchievement(
  achievementId: string,
): Promise<ClaimResponseData> {
  const res = await apiClient.post(
    endpoints.achievements.claim(achievementId),
    {},
    ClaimResponseSchema,
  );
  return res.response;
}
