import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import type {
  MentorVerifyRequestValues,
  StudentSessionRequest,
  StudentSessionRequestFormValues,
} from "../schemas";
import {
  GenericResponseSchema,
  StudentSessionRequestListResponseSchema,
  StudentSessionRequestSingleResponseSchema,
} from "../schemas";

const OPT = { skipAuthRedirectOn403: true } as const;

interface ListParams {
  status?: string;
  page?: number;
  pageIndex?: number;
  perPage?: number;
  search?: string;
  sortBy?: string;
}

// ─── Helper: map frontend form → backend payload ─────────────────────────────
function toISO(value: string | undefined): string | undefined {
  if (!value) return undefined;
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return `${value}:00`;
  return value;
}

function toBackendPayload(data: Partial<StudentSessionRequestFormValues>) {
  const { starts_at, ends_at, meeting_link, description, venue, ...rest } =
    data;
  const payload: Record<string, unknown> = { ...rest };

  if (starts_at !== undefined) payload.starts_at = toISO(starts_at);
  if (ends_at !== undefined) payload.ends_at = toISO(ends_at);

  if (meeting_link && meeting_link.trim() !== "")
    payload.meeting_link = meeting_link.trim();
  if (description && description.trim() !== "")
    payload.description = description.trim();
  if (venue && (venue as string).trim() !== "")
    payload.venue = (venue as string).trim();

  return payload;
}

// ─── 1. POST /session/student/request/ ─────────────────────────────────────────
export async function createStudentRequest(
  data: StudentSessionRequestFormValues,
): Promise<StudentSessionRequest> {
  const res = await apiClient.post(
    endpoints.mentor.studentSessionRequestCreate,
    toBackendPayload(data),
    StudentSessionRequestSingleResponseSchema,
    OPT,
  );
  return res.response;
}

// ─── 2. GET /session/student/my-requests/ ──────────────────────────────────────
export async function fetchMyRequests(params: ListParams = {}): Promise<{
  data: StudentSessionRequest[];
  totalPages: number;
}> {
  const q = new URLSearchParams();
  if (params.status) q.set("status", params.status);
  if (params.pageIndex) q.set("pageIndex", String(params.pageIndex));
  if (params.page) q.set("pageIndex", String(params.page));
  if (params.perPage) q.set("perPage", String(params.perPage));
  if (params.search) q.set("search", params.search);
  if (params.sortBy) q.set("sortBy", params.sortBy);

  const res = await apiClient.get(
    `${endpoints.mentor.studentSessionMyRequests}?${q}`,
    StudentSessionRequestListResponseSchema,
    OPT,
  );
  return {
    data: res.response.data,
    totalPages: res.response.pagination.totalPages,
  };
}

// ─── 3. GET /session/student-requests/ ─────────────────────────────────────────
export async function fetchIncomingRequests(params: ListParams = {}): Promise<{
  data: StudentSessionRequest[];
  totalPages: number;
}> {
  const q = new URLSearchParams();
  if (params.pageIndex) q.set("pageIndex", String(params.pageIndex));
  if (params.page) q.set("pageIndex", String(params.page));
  if (params.perPage) q.set("perPage", String(params.perPage));
  if (params.search) q.set("search", params.search);
  if (params.sortBy) q.set("sortBy", params.sortBy);

  const res = await apiClient.get(
    `${endpoints.mentor.studentSessionIncomingRequests}?${q}`,
    StudentSessionRequestListResponseSchema,
    OPT,
  );
  return {
    data: res.response.data,
    totalPages: res.response.pagination.totalPages,
  };
}

// ─── 4. PATCH /session/student-requests/<session_id>/verify/ ──────────────────
export async function verifyStudentRequest(
  id: string,
  data: MentorVerifyRequestValues,
): Promise<void> {
  await apiClient.patch(
    endpoints.mentor.studentSessionVerify(id),
    toBackendPayload(data as any),
    GenericResponseSchema,
    OPT,
  );
}
