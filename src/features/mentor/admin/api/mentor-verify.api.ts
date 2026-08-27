import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import type {
  MentorApplicationListItem,
  MentorRosterItem,
  VerifyActionValues,
} from "../schemas";
import {
  GenericResponseSchema,
  MentorListResponseSchema,
  MentorRosterResponseSchema,
} from "../schemas";

interface ListParams {
  search?: string;
  page?: number;
  status?: string;
  mentor_tier?: string;
  pageIndex?: number;
  perPage?: number;
  sortBy?: string;
}

// ─── GET /list/ ───────────────────────────────────────────────────────────────
export async function fetchMentorList(params: ListParams = {}): Promise<{
  data: MentorApplicationListItem[];
  totalPages: number;
  totalItems: number;
}> {
  const q = new URLSearchParams();
  if (params.search) q.set("search", params.search);
  // Doc uses pageIndex / perPage pagination params
  if (params.pageIndex) q.set("pageIndex", String(params.pageIndex));
  if (params.page) q.set("pageIndex", String(params.page)); // compat alias
  if (params.perPage) q.set("perPage", String(params.perPage));
  if (params.status) q.set("status", params.status);
  if (params.mentor_tier) q.set("mentor_tier", params.mentor_tier);
  if (params.sortBy) q.set("sortBy", params.sortBy);

  const query = q.toString();
  const url = query
    ? `${endpoints.mentor.list}?${query}`
    : endpoints.mentor.list;

  const res = await apiClient.get(url, MentorListResponseSchema);
  const rawData = Array.isArray(res.response?.data) ? res.response.data : [];
  return {
    data: rawData,
    totalPages: res.response?.pagination?.totalPages ?? 1,
    totalItems: res.response?.pagination?.count ?? rawData.length,
  };
}

// ─── GET /roster/ ─────────────────────────────────────────────────────────────
// Admin: lists active, APPROVED mentors with avg_rating / rating_count.
// Supports ?mentor_tier= and ?low_rating=true (avg < 3.0, 5+ rated sessions).
// Pagination keys: page / per_page / total (different from /list/).
interface RosterParams {
  mentor_tier?: string;
  low_rating?: boolean;
  page?: number;
  per_page?: number;
}

export async function fetchMentorRoster(params: RosterParams = {}): Promise<{
  data: MentorRosterItem[];
  totalPages: number;
  totalItems: number;
}> {
  const q = new URLSearchParams();
  if (params.mentor_tier) q.set("mentor_tier", params.mentor_tier);
  if (params.low_rating) q.set("low_rating", "true");
  if (params.page && params.page > 1) q.set("pageIndex", String(params.page));
  if (params.per_page) q.set("perPage", String(params.per_page));

  const query = q.toString();
  const url = query
    ? `${endpoints.mentor.roster}?${query}`
    : endpoints.mentor.roster;

  const res = await apiClient.get(url, MentorRosterResponseSchema);
  const rawData = Array.isArray(res.response?.data) ? res.response.data : [];
  return {
    data: rawData,
    totalPages: res.response?.pagination?.totalPages ?? 1,
    totalItems: res.response?.pagination?.count ?? rawData.length,
  };
}

// ─── GET /change-requests/ ────────────────────────────────────────────────────
// Admin: PENDING applications from users who already hold an APPROVED grant for
// the same tier (affiliation-change requests). Same response shape as /list/.
interface ChangeRequestParams {
  search?: string;
  page?: number;
  perPage?: number;
  mentor_tier?: string;
}

export async function fetchMentorChangeRequests(
  params: ChangeRequestParams = {},
): Promise<{
  data: MentorApplicationListItem[];
  totalPages: number;
  totalItems: number;
}> {
  const q = new URLSearchParams();
  if (params.search) q.set("search", params.search);
  if (params.page) q.set("pageIndex", String(params.page));
  if (params.perPage) q.set("perPage", String(params.perPage));
  if (params.mentor_tier) q.set("mentor_tier", params.mentor_tier);

  const query = q.toString();
  const url = query
    ? `${endpoints.mentor.changeRequests}?${query}`
    : endpoints.mentor.changeRequests;

  const res = await apiClient.get(url, MentorListResponseSchema);
  const rawData = Array.isArray(res.response?.data) ? res.response.data : [];
  return {
    data: rawData,
    totalPages: res.response?.pagination?.totalPages ?? 1,
    totalItems: res.response?.pagination?.count ?? rawData.length,
  };
}

// ─── GET /detail/<mentor_id>/ ─────────────────────────────────────────────────
export async function fetchMentorDetail(
  mentorId: string,
): Promise<MentorApplicationListItem> {
  const res = await apiClient.get(
    endpoints.mentor.detail(mentorId),
    MentorListResponseSchema,
  );
  // Detail endpoint returns a single object in response, not paginated
  return res.response as unknown as MentorApplicationListItem;
}

// ─── PATCH /verify/<mentor_id>/ ───────────────────────────────────────────────
// Payload: { status: "APPROVED" } or { status: "REJECTED", verification_note: "..." }
export async function verifyMentor(
  mentorId: string,
  data: VerifyActionValues,
): Promise<void> {
  await apiClient.patch(
    endpoints.mentor.verify(mentorId),
    data,
    GenericResponseSchema,
  );
}
