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
function toBackendPayload(data: Partial<SessionFormValues>) {
  const { ig_id, meeting_link, ...rest } = data;
  const payload: Record<string, unknown> = { ...rest };
  if (ig_id !== undefined) payload.ig = ig_id; // backend expects "ig" not "ig_id"
  if (meeting_link !== undefined) payload.meeting_link = meeting_link;
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
