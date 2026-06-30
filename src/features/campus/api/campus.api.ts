import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import type { CampusSessionItem } from "../schemas";
import {
  AssignMentorResponseSchema,
  CampusSessionListResponseSchema,
} from "../schemas";
import type { CampusInfo, WeeklyKarma } from "../types";

const OPT = { skipAuthRedirectOn403: true } as const;

// ─── Legacy service object (getCampusInfo, getWeeklyKarma) ───────────────────
export const campusService = {
  getCampusInfo: (id: string) =>
    apiClient.get<CampusInfo>(endpoints.campus.info(id)),

  getWeeklyKarma: (id: string) =>
    apiClient.get<WeeklyKarma>(endpoints.campus.weeklykarma(id)),
};

// ─── #1 POST assign-mentor/ ───────────────────────────────────────────────────
// Campus Lead / Lead Enabler nominates a student as a Campus Mentor.
// Sends { muid } and expects a success envelope with empty response.
export async function assignCampusMentor(muid: string): Promise<void> {
  await apiClient.post(
    endpoints.campus.assignMentor,
    { muid },
    AssignMentorResponseSchema,
    OPT,
  );
}

// ─── #3 GET sessions/list/ ────────────────────────────────────────────────────
// Lists campus sessions for the caller's college.
// Visibility: elevated roles see all; regular students see only SCHEDULED.
export interface CampusSessionListParams {
  status?: string;
  pageIndex?: number;
  perPage?: number;
  search?: string;
  sortBy?: string;
}

export async function fetchCampusSessions(
  params: CampusSessionListParams = {},
): Promise<{
  data: CampusSessionItem[];
  totalPages: number;
  totalItems: number;
}> {
  const q = new URLSearchParams();
  if (params.status) q.set("status", params.status);
  if (params.pageIndex) q.set("pageIndex", String(params.pageIndex));
  if (params.perPage) q.set("perPage", String(params.perPage));
  if (params.search) q.set("search", params.search);
  if (params.sortBy) q.set("sortBy", params.sortBy);

  const url = q.toString()
    ? `${endpoints.campus.sessionsList}?${q}`
    : endpoints.campus.sessionsList;

  const res = await apiClient.get(url, CampusSessionListResponseSchema, OPT);
  return {
    data: res.response.data,
    totalPages: res.response.pagination.totalPages,
    totalItems: res.response.pagination.count ?? res.response.data.length,
  };
}
