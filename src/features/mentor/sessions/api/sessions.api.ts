import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import type {
  AdminVerifySessionValues,
  Session,
  SessionFormValues,
  SessionParticipant,
  SubmitFeedbackValues,
  UpdateParticipantValues,
} from "../schemas";
import {
  GenericResponseSchema,
  ParticipantsListResponseSchema,
  SessionsListResponseSchema,
  SingleSessionResponseSchema,
} from "../schemas";

const OPT = { skipAuthRedirectOn403: true } as const;

interface ListParams {
  status?: string;
  page?: number;
  pageIndex?: number;
  perPage?: number;
  search?: string;
  ig_id?: string;
  sortBy?: string;
}

// ─── Helper: map frontend form → backend payload ─────────────────────────────
// • Passes ig_id as-is (backend field name is ig_id, omit when undefined for global session)
// • Converts datetime-local strings ("YYYY-MM-DDTHH:mm") to full ISO-8601
//   ("YYYY-MM-DDTHH:mm:ss") — Django rejects the truncated format with 400.
// • Drops empty-string values for optional fields (meeting_link, description,
//   venue) so Django's URLField / CharField does not receive invalid input.
function toISO(value: string | undefined): string | undefined {
  if (!value) return undefined;
  // datetime-local gives "YYYY-MM-DDTHH:mm" (16 chars); append ":00" if needed
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return `${value}:00`;
  return value;
}

function toBackendPayload(data: Partial<SessionFormValues>) {
  const {
    ig_id,
    meeting_link,
    description,
    venue,
    starts_at,
    ends_at,
    is_recurring,
    recurrence_type,
    recurrence_interval,
    recurrence_end_date,
    ...rest
  } = data;
  const payload: Record<string, unknown> = { ...rest, is_recurring };

  // Map frontend ig_id to all possible backend fields to ensure compatibility
  if (ig_id !== undefined) {
    payload.ig = ig_id;
    payload.entity_id = ig_id;
    payload.session_type = "ig_session";
  }

  // Normalise datetime strings to full ISO-8601
  if (starts_at !== undefined) payload.starts_at = toISO(starts_at);
  if (ends_at !== undefined) payload.ends_at = toISO(ends_at);

  // Only include optional text/URL fields when they have actual content
  if (meeting_link && meeting_link.trim() !== "")
    payload.meeting_link = meeting_link.trim();
  if (description && description.trim() !== "")
    payload.description = description.trim();
  if (venue && (venue as string).trim() !== "")
    payload.venue = (venue as string).trim();

  if (is_recurring) {
    payload.recurrence_type = recurrence_type;
    payload.recurrence_interval = recurrence_interval;
    payload.recurrence_end_date = recurrence_end_date
      ? recurrence_end_date.split("T")[0]
      : null;
  } else {
    payload.recurrence_type = null;
    payload.recurrence_interval = null;
    payload.recurrence_end_date = null;
  }

  return payload;
}

// ─── #11 POST /session/create/ ────────────────────────────────────────────────
export async function createSession(data: SessionFormValues): Promise<Session> {
  const res = await apiClient.post(
    endpoints.mentor.sessionCreate,
    toBackendPayload(data),
    SingleSessionResponseSchema,
    OPT,
  );
  return res.response;
}

// ─── #12 GET /session/list/ ───────────────────────────────────────────────────
export async function fetchSessions(params: ListParams = {}): Promise<{
  data: Session[];
  totalPages: number;
}> {
  const q = new URLSearchParams();
  if (params.status) q.set("status", params.status);
  if (params.pageIndex) q.set("pageIndex", String(params.pageIndex));
  if (params.page) q.set("pageIndex", String(params.page)); // compat
  if (params.perPage) q.set("perPage", String(params.perPage));
  if (params.search) q.set("search", params.search);
  if (params.ig_id) q.set("ig_id", params.ig_id);
  if (params.sortBy) q.set("sortBy", params.sortBy);

  const res = await apiClient.get(
    `${endpoints.mentor.sessionList}?${q}`,
    SessionsListResponseSchema,
    OPT,
  );
  return {
    data: res.response.data,
    totalPages: res.response.pagination.totalPages,
  };
}

// ─── #13 GET /session/list/<session_id>/ ─────────────────────────────────────
export async function fetchSessionDetail(sessionId: string): Promise<Session> {
  const res = await apiClient.get(
    endpoints.mentor.sessionDetail(sessionId),
    SingleSessionResponseSchema,
    OPT,
  );
  return res.response;
}

// ─── #14 PATCH /session/update/<session_id>/ ─────────────────────────────────
export async function updateSession(
  id: string,
  data: Partial<SessionFormValues>,
): Promise<Session> {
  const res = await apiClient.patch(
    endpoints.mentor.sessionUpdate(id),
    toBackendPayload(data),
    SingleSessionResponseSchema,
    OPT,
  );
  return res.response;
}

// ─── #14 DELETE /session/update/<session_id>/ ────────────────────────────────
export async function deleteSession(id: string): Promise<void> {
  await apiClient.delete(
    endpoints.mentor.sessionUpdate(id),
    undefined,
    GenericResponseSchema,
    OPT,
  );
}

// ─── #15 GET /session/available/ ─────────────────────────────────────────────
export async function fetchAvailableSessions(
  params: ListParams = {},
): Promise<{ data: Session[]; totalPages: number }> {
  const q = new URLSearchParams();
  if (params.pageIndex) q.set("pageIndex", String(params.pageIndex));
  if (params.perPage) q.set("perPage", String(params.perPage));
  if (params.search) q.set("search", params.search);
  if (params.sortBy) q.set("sortBy", params.sortBy);

  const res = await apiClient.get(
    `${endpoints.mentor.sessionAvailable}?${q}`,
    SessionsListResponseSchema,
    OPT,
  );
  return {
    data: res.response.data,
    totalPages: res.response.pagination.totalPages,
  };
}

// ─── #16 GET /session/admin/list/ ────────────────────────────────────────────
export async function fetchAdminSessions(
  params: ListParams = {},
): Promise<{ data: Session[]; totalPages: number }> {
  const q = new URLSearchParams();
  if (params.status) q.set("status", params.status);
  if (params.ig_id) q.set("ig_id", params.ig_id);
  if (params.pageIndex) q.set("pageIndex", String(params.pageIndex));
  if (params.page) q.set("pageIndex", String(params.page)); // compat
  if (params.perPage) q.set("perPage", String(params.perPage));
  if (params.search) q.set("search", params.search);
  if (params.sortBy) q.set("sortBy", params.sortBy);

  const res = await apiClient.get(
    `${endpoints.mentor.sessionAdminList}?${q}`,
    SessionsListResponseSchema,
    OPT,
  );
  return {
    data: res.response.data,
    totalPages: res.response.pagination.totalPages,
  };
}

// ─── #17 PATCH /session/admin/verify/<session_id>/ ───────────────────────────
// payload: { status: "SCHEDULED" } or { status: "REJECTED" }
export async function verifySession(
  id: string,
  data: AdminVerifySessionValues,
): Promise<void> {
  await apiClient.patch(
    endpoints.mentor.sessionAdminVerify(id),
    data,
    GenericResponseSchema,
    OPT,
  );
}

// ─── #18 POST /session/participation/join/<session_id>/ ──────────────────────
export async function joinSession(
  sessionId: string,
): Promise<SessionParticipant> {
  const res = await apiClient.post(
    endpoints.mentor.sessionJoin(sessionId),
    {},
    SingleSessionResponseSchema,
    OPT,
  );
  // Response shape: { hasError, statusCode, message, response: { ...participant fields } }
  return res.response as unknown as SessionParticipant;
}

// ─── #19 GET /session/participant/history/ ───────────────────────────────────
export async function fetchParticipantHistory(
  params: ListParams = {},
): Promise<{ data: SessionParticipant[]; totalPages: number }> {
  const q = new URLSearchParams();
  if (params.pageIndex) q.set("pageIndex", String(params.pageIndex));
  if (params.perPage) q.set("perPage", String(params.perPage));

  const res = await apiClient.get(
    `${endpoints.mentor.sessionParticipantHistory}?${q}`,
    ParticipantsListResponseSchema,
    OPT,
  );
  return {
    data: res.response.data,
    totalPages: res.response.pagination?.totalPages ?? 1,
  };
}

// ─── #20 GET /session/participant/list/<session_id>/ ─────────────────────────
export async function fetchParticipants(
  sessionId: string,
  params: ListParams = {},
): Promise<{ data: SessionParticipant[]; totalPages: number }> {
  const q = new URLSearchParams();
  if (params.pageIndex) q.set("pageIndex", String(params.pageIndex));
  if (params.perPage) q.set("perPage", String(params.perPage));

  const res = await apiClient.get(
    `${endpoints.mentor.sessionParticipantList(sessionId)}?${q}`,
    ParticipantsListResponseSchema,
    OPT,
  );
  return {
    data: res.response.data,
    totalPages: res.response.pagination?.totalPages ?? 1,
  };
}

// ─── #21 PATCH /session/participant/update/<link_id>/ ────────────────────────
export async function updateParticipant(
  linkId: string,
  data: UpdateParticipantValues,
): Promise<void> {
  await apiClient.patch(
    endpoints.mentor.sessionParticipantUpdate(linkId),
    data,
    GenericResponseSchema,
    OPT,
  );
}

// ─── #22 PATCH /session/participant/feedback/<session_id>/ ───────────────────
export async function submitFeedback(
  sessionId: string,
  data: SubmitFeedbackValues,
): Promise<void> {
  await apiClient.patch(
    endpoints.mentor.sessionParticipantFeedback(sessionId),
    data,
    GenericResponseSchema,
    OPT,
  );
}
