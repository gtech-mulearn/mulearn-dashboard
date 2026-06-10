import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import type { MentorApplicationListItem, VerifyActionValues } from "../schemas";
import { GenericResponseSchema, MentorListResponseSchema } from "../schemas";

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
