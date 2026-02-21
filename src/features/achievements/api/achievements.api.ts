import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import { authStore } from "@/lib/auth";
import { env } from "../../../../config/env";
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
// Multipart upload helper (for icon file uploads)
// ==========================================

async function uploadRequest<T>(
  endpoint: string,
  method: "POST" | "PUT" | "PATCH",
  formData: FormData,
): Promise<T> {
  const token = authStore.getAccessToken();
  const headers: HeadersInit = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${env.NEXT_PUBLIC_DJANGO_API_URL}${endpoint}`, {
    method,
    headers,
    body: formData,
  });

  const rawData = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(
      (rawData as { message?: string })?.message ??
        `Request failed: ${endpoint}`,
    );
  }

  // Unwrap Django response wrapper
  const data =
    rawData && typeof rawData === "object" && "response" in rawData
      ? (rawData as { response: T }).response
      : (rawData as T);

  return data;
}

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
  return uploadRequest<Achievement>(
    endpoints.achievements.create,
    "POST",
    formData,
  );
}

export async function updateAchievement(
  id: string,
  formData: FormData,
): Promise<Achievement> {
  return uploadRequest<Achievement>(
    endpoints.achievements.update(id),
    "PATCH",
    formData,
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
  await uploadRequest<unknown>(
    endpoints.achievements.bulkIssue,
    "POST",
    formData,
  );
}

export async function downloadBulkTemplate(): Promise<Blob> {
  const token = authStore.getAccessToken();
  const headers: HeadersInit = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(
    `${env.NEXT_PUBLIC_DJANGO_API_URL}${endpoints.achievements.bulkIssueTemplate}`,
    { method: "GET", headers },
  );

  if (!res.ok) throw new Error("Failed to download template");
  return res.blob();
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
