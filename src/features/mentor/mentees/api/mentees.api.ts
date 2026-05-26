import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import type { ActivityLogItem, Mentee, MenteeDetail } from "../schemas";
import {
  ActivityLogResponseSchema,
  MenteeDetailResponseSchema,
  MenteeListResponseSchema,
} from "../schemas";

const OPT = { skipAuthRedirectOn403: true } as const;

interface ListParams {
  page?: number;
  search?: string;
}

export async function fetchMentees(params: ListParams = {}): Promise<{
  data: Mentee[];
  totalPages: number;
  totalItems: number;
}> {
  const q = new URLSearchParams();
  if (params.page) q.set("page", String(params.page));
  if (params.search) q.set("search", params.search);

  const url =
    params.page || params.search
      ? `${endpoints.mentor.mentees}?${q}`
      : endpoints.mentor.mentees;

  const res = await apiClient.get(url, MenteeListResponseSchema, OPT);
  return {
    data: res.response.data,
    totalPages: res.response.pagination?.totalPages ?? 1,
    totalItems: res.response.pagination?.count ?? res.response.data.length,
  };
}

export async function fetchMenteeDetail(userId: string): Promise<MenteeDetail> {
  const res = await apiClient.get(
    endpoints.mentor.menteeDetail(userId),
    MenteeDetailResponseSchema,
    OPT,
  );
  return res.response.mentee;
}

export async function fetchActivityLog(params: ListParams = {}): Promise<{
  data: ActivityLogItem[];
  totalPages: number;
}> {
  const q = new URLSearchParams();
  if (params.page) q.set("page", String(params.page));
  if (params.search) q.set("search", params.search);

  const url =
    params.page || params.search
      ? `${endpoints.mentor.activityLog}?${q}`
      : endpoints.mentor.activityLog;

  const res = await apiClient.get(url, ActivityLogResponseSchema, OPT);
  return {
    data: res.response.data,
    totalPages: res.response.pagination?.totalPages ?? 1,
  };
}
