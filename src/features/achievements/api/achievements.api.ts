import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import type {
  Achievement,
  AchievementRule,
  AuditLog,
  CreateRuleRequest,
  ManualIssueRequest,
  PaginatedIssuedLog,
  RevokeRequest,
  SimulationResult,
} from "../schemas";
import {
  AchievementListResponseSchema,
  AchievementRuleListResponseSchema,
  AchievementRuleResponseSchema,
  AuditLogListResponseSchema,
  GenericSuccessResponseSchema,
  IssuedLogListResponseSchema,
  SimulationListResponseSchema,
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
  formData: FormData,
): Promise<Achievement> {
  return apiClient.patch<Achievement>(
    endpoints.achievements.update(id),
    formData,
    undefined,
    { isFormData: true },
  );
}

export async function deleteAchievement(id: string): Promise<void> {
  await apiClient.delete(
    endpoints.achievements.delete(id),
    GenericSuccessResponseSchema,
  );
}

// ==========================================
// Rules Engine
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

export async function deactivateRule(ruleId: string): Promise<void> {
  await apiClient.post(
    endpoints.achievements.deactivateRule(ruleId),
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
// Issued Logs (server-paginated)
// ==========================================

export async function fetchIssuedLogs(
  page: number,
  perPage: number,
  search?: string,
): Promise<PaginatedIssuedLog> {
  const query = new URLSearchParams({
    page: String(page),
    perPage: String(perPage),
  });
  if (search?.trim()) query.set("search", search.trim());

  const res = await apiClient.get(
    `${endpoints.achievements.issuedLog}?${query.toString()}`,
    IssuedLogListResponseSchema,
  );
  return res.response;
}

// ==========================================
// Audit Logs
// ==========================================

export async function fetchAuditLogs(muid: string): Promise<AuditLog[]> {
  const res = await apiClient.get(
    endpoints.achievements.auditLogs(muid),
    AuditLogListResponseSchema,
  );
  return res.response;
}
