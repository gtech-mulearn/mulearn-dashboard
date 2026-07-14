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
  SimulationResult,
  UserAchievement,
} from "../schemas";
import {
  AchievementListResponseSchema,
  AchievementRuleListResponseSchema,
  AchievementRuleResponseSchema,
  AuditLogListResponseSchema,
  GenericSuccessResponseSchema,
  IssuedLogListResponseSchema,
  SimulationListResponseSchema,
  UserAchievementListResponseSchema,
} from "../schemas";

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
  formData: FormData,
): Promise<Achievement> {
  return apiClient.post<Achievement>(
    endpoints.achievements.create,
    formData,
    undefined,
    { isFormData: true },
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
): Promise<AchievementRule> {
  const res = await apiClient.post(
    endpoints.achievements.createRule,
    data,
    AchievementRuleResponseSchema,
  );
  return res.response;
}

export async function updateRule(
  ruleId: string,
  data: CreateRuleRequest,
): Promise<AchievementRule> {
  const res = await apiClient.put(
    endpoints.achievements.updateRule(ruleId),
    data,
    AchievementRuleResponseSchema,
  );
  return res.response;
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
): Promise<unknown> {
  const res = await apiClient.get(
    endpoints.achievements.debug(muid, achievementId),
  );
  return res;
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

export async function bulkIssueAchievements(formData: FormData): Promise<void> {
  await apiClient.post<unknown>(
    endpoints.achievements.bulkIssue,
    formData,
    undefined,
    { isFormData: true },
  );
}

export async function downloadBulkTemplate(): Promise<Blob> {
  return apiClient.get<Blob>(
    endpoints.achievements.bulkIssueTemplate,
    undefined,
    { responseType: "blob" },
  );
}

// ==========================================
// Issued Logs
// ==========================================

export async function fetchIssuedLogs(
  page: number,
  perPage: number,
  search?: string,
): Promise<{
  data: IssuedLog[];
  pagination: {
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
  };
}> {
  const query = new URLSearchParams({
    page: String(page),
    perPage: String(perPage),
  });
  if (search?.trim()) query.set("search", search.trim());

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

export async function fetchUserAchievements(
  muid: string,
): Promise<UserAchievement[]> {
  const res = await apiClient.get(
    endpoints.achievements.listByUser(muid),
    UserAchievementListResponseSchema,
  );
  return res.response;
}
