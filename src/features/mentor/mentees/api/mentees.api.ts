// ─── Mentees & Activity Log API ───────────────────────────────────────────────
// NOTE: The mentees (/mentor/mentees/...) and activity-log
// (/mentor/activity-log/...) endpoints are NOT part of the 22 documented
// mentor APIs. These stubs return empty data so the feature continues to
// compile while the alternate API is being wired up.
// ─────────────────────────────────────────────────────────────────────────────

import type { ActivityLogItem, Mentee, MenteeDetail } from "../schemas";

// #stub – no documented endpoint exists for mentor mentees yet
export async function fetchMentees(
  _params: { page?: number; search?: string } = {},
): Promise<{ data: Mentee[]; totalPages: number; totalItems: number }> {
  return { data: [], totalPages: 1, totalItems: 0 };
}

// #stub – no documented endpoint exists for mentee detail yet
export async function fetchMenteeDetail(
  _userId: string,
): Promise<MenteeDetail> {
  throw new Error("fetchMenteeDetail: endpoint not yet available");
}

// #stub – no documented endpoint exists for activity log yet
export async function fetchActivityLog(
  _params: { page?: number; search?: string } = {},
): Promise<{ data: ActivityLogItem[]; totalPages: number }> {
  return { data: [], totalPages: 1 };
}
