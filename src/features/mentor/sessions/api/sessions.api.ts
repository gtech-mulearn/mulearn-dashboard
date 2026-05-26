import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import type {
  AddParticipantFormValues,
  ApproveSessionFormValues,
  AttendanceBulkUpdateValues,
  KarmaAwardFormValues,
  ParticipantRole,
  Session,
  SessionFormValues,
  SessionParticipant,
} from "../schemas";
import {
  GenericResponseSchema,
  ParticipantsResponseSchema,
  PendingSessionsResponseSchema,
  RemindResponseSchema,
  SessionsListResponseSchema,
  SingleSessionResponseSchema,
} from "../schemas";

const OPT = { skipAuthRedirectOn403: true } as const;

interface ListParams {
  status?: string;
  page?: number;
  search?: string;
  ig_id?: string;
}

export async function fetchSessions(params: ListParams = {}): Promise<{
  data: Session[];
  totalPages: number;
}> {
  const q = new URLSearchParams();
  if (params.status) q.set("status", params.status);
  if (params.page) q.set("page", String(params.page));
  if (params.search) q.set("search", params.search);
  if (params.ig_id) q.set("ig_id", params.ig_id);

  const res = await apiClient.get(
    `${endpoints.mentor.sessions}?${q}`,
    SessionsListResponseSchema,
    OPT,
  );
  return {
    data: res.response.data,
    totalPages: res.response.pagination.totalPages,
  };
}

export async function fetchPendingSessions(): Promise<Session[]> {
  const res = await apiClient.get(
    endpoints.mentor.sessionsPending,
    PendingSessionsResponseSchema,
    OPT,
  );
  return res.response.data;
}

function toBackendPayload(data: Partial<SessionFormValues>) {
  const { ig_id, meet_link, ...rest } = data;
  const payload: Record<string, unknown> = { ...rest };
  if (ig_id !== undefined) payload.ig = ig_id;
  if (meet_link !== undefined) payload.meeting_link = meet_link;
  return payload;
}

export async function createSession(data: SessionFormValues): Promise<Session> {
  const res = await apiClient.post(
    endpoints.mentor.sessions,
    toBackendPayload(data),
    SingleSessionResponseSchema,
    OPT,
  );
  return res.response.session;
}

export async function updateSession(
  id: string,
  data: Partial<SessionFormValues>,
): Promise<Session> {
  const res = await apiClient.patch(
    endpoints.mentor.session(id),
    toBackendPayload(data),
    SingleSessionResponseSchema,
    OPT,
  );
  return res.response.session;
}

export async function fetchParticipants(
  sessionId: string,
): Promise<SessionParticipant[]> {
  const res = await apiClient.get(
    endpoints.mentor.sessionParticipants(sessionId),
    ParticipantsResponseSchema,
    OPT,
  );
  return res.response.participants;
}

export async function addParticipant(
  sessionId: string,
  data: AddParticipantFormValues,
): Promise<void> {
  await apiClient.post(
    endpoints.mentor.sessionParticipants(sessionId),
    data,
    GenericResponseSchema,
    OPT,
  );
}

export async function removeParticipant(
  sessionId: string,
  userId: string,
  participantRole: ParticipantRole,
): Promise<void> {
  await apiClient.delete(
    endpoints.mentor.sessionParticipant(sessionId, userId, participantRole),
    undefined,
    GenericResponseSchema,
    OPT,
  );
}

export async function bulkUpdateAttendance(
  sessionId: string,
  data: AttendanceBulkUpdateValues,
): Promise<void> {
  await apiClient.patch(
    endpoints.mentor.sessionAttendance(sessionId),
    data,
    GenericResponseSchema,
    OPT,
  );
}

export async function cloneSession(sessionId: string): Promise<Session> {
  const res = await apiClient.post(
    endpoints.mentor.sessionClone(sessionId),
    {},
    SingleSessionResponseSchema,
    OPT,
  );
  return res.response.session;
}

export async function approveSession(
  id: string,
  data: ApproveSessionFormValues,
): Promise<void> {
  await apiClient.patch(
    endpoints.mentor.sessionApprove(id),
    data,
    GenericResponseSchema,
    OPT,
  );
}

export async function remindSession(id: string): Promise<void> {
  await apiClient.post(
    endpoints.mentor.sessionRemind(id),
    {},
    RemindResponseSchema,
    OPT,
  );
}

export async function awardKarma(
  sessionId: string,
  data: KarmaAwardFormValues,
): Promise<void> {
  await apiClient.post(
    endpoints.mentor.sessionKarmaAward(sessionId),
    data,
    GenericResponseSchema,
    OPT,
  );
}
