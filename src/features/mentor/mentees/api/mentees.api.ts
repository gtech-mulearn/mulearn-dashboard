// ─── Mentees & Activity Log API ───────────────────────────────────────────────

import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import type { MenteeView } from "../schemas";
import {
  GenericResponseSchema,
  type JoinSessionParticipant,
  JoinSessionResponseSchema,
  ParticipantHistoryResponseSchema,
  SessionFeedbackResponseSchema,
  SessionParticipantListResponseSchema,
  type UpdateParticipantValues,
} from "../schemas";

// ─── Mentees ───────────────────────────────────────────────────────────────────
// GET /api/v1/dashboard/mentor/session/participant/history/
// Deduplicates MENTEE-role participants into one MenteeView per unique user.
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchMentees(): Promise<{
  data: MenteeView[];
  totalItems: number;
}> {
  const res = await apiClient.get(
    endpoints.mentor.sessionParticipantHistory,
    ParticipantHistoryResponseSchema,
    { skipAuthRedirectOn403: true },
  );

  const data: MenteeView[] = res.response.data
    .filter((item) => item.participant_role === "MENTEE")
    .map((item) => ({
      id: item.id || `${item.user_id}-${item.session_id}`,
      user_id: item.user_id,
      user_full_name: item.user_full_name,
      mu_id: item.mu_id ?? null,
      session_count: 1, // Will always be 1 for a single session row
      last_session_id: item.session_id,
      last_attendance_status: item.attendance_status ?? null,
    }));

  return { data, totalItems: data.length };
}

// ─── Session Participant Feedback ──────────────────────────────────────────────
// PATCH /api/v1/dashboard/mentor/session/participant/feedback/{session_id}/
// ─────────────────────────────────────────────────────────────────────────────

export async function submitSessionFeedback(
  sessionId: string,
  feedback: string | null,
) {
  return apiClient.patch(
    endpoints.mentor.sessionParticipantFeedback(sessionId),
    { feedback },
    SessionFeedbackResponseSchema,
  );
}

// ─── Session Participant History ───────────────────────────────────────────────
// GET /api/v1/dashboard/mentor/session/participant/history/
// ─────────────────────────────────────────────────────────────────────────────────

export async function fetchParticipantHistory() {
  const res = await apiClient.get(
    endpoints.mentor.sessionParticipantHistory,
    ParticipantHistoryResponseSchema,
    { skipAuthRedirectOn403: true },
  );
  return res.response.data;
}

// ─── Session Participant List (Mentor view) ────────────────────────────────────────
// GET /api/v1/dashboard/mentor/session/participant/list/{session_id}/
// ─────────────────────────────────────────────────────────────────────────────────

export async function fetchSessionParticipants(sessionId: string) {
  const res = await apiClient.get(
    endpoints.mentor.sessionParticipantList(sessionId),
    SessionParticipantListResponseSchema,
    { skipAuthRedirectOn403: true },
  );
  return res.response.data;
}

// ─── Update Participant ────────────────────────────────────────────────────────
// PATCH /api/v1/dashboard/mentor/session/participant/update/{link_id}/
// ─────────────────────────────────────────────────────────────────────────────────

export async function updateParticipant(
  linkId: string,
  data: UpdateParticipantValues,
): Promise<void> {
  await apiClient.patch(
    endpoints.mentor.sessionParticipantUpdate(linkId),
    data,
    GenericResponseSchema,
    { skipAuthRedirectOn403: true },
  );
}

// ─── Join Session ─────────────────────────────────────────────────────────────────
// POST /api/v1/dashboard/mentor/session/participation/join/{session_id}/
// ──────────────────────────────────────────────────────────────────────────────────

export async function joinSession(
  sessionId: string,
): Promise<JoinSessionParticipant> {
  const res = await apiClient.post(
    endpoints.mentor.sessionJoin(sessionId),
    {},
    JoinSessionResponseSchema,
    { skipAuthRedirectOn403: true },
  );
  return res.response;
}
