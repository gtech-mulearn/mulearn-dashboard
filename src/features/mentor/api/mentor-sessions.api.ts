// The mentor's own sessions and session requests, read by the mentor home and the mentor profile.
// Moved here from the home feature for dashboard issue 0010, so mentor no longer imports home.

import { z } from "zod";
import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import { upperEnum } from "@/lib/enum-casing";

const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    hasError: z.boolean(),
    statusCode: z.number(),
    message: z.record(z.string(), z.array(z.string())).optional(),
    response: dataSchema,
  });

// ============================================
// Mentor Sessions (/mentor/session/list/)
// Response: { data: MentorSession[], pagination: {...} }
// ============================================

export const MentorSessionSchema = z.object({
  id: z.string().max(36).optional(),
  entity_id: z.string().max(36).nullable().optional(),
  entity_name: z.string(),
  session_type: upperEnum([
    "IG_SESSION",
    "CAMPUS_SESSION",
    "COMPANY_SESSION",
  ]).optional(),
  title: z.string().max(150),
  mode: z.enum(["ONLINE", "OFFLINE", "HYBRID"]).optional(),
  starts_at: z.string(),
  ends_at: z.string(),
  status: z.enum([
    "SCHEDULED",
    "PENDING_APPROVAL",
    "COMPLETED",
    "CANCELLED",
    "REJECTED",
  ]),
  created_by_id: z.string(),
  created_by_name: z.string(),
  created_at: z.string(),
  max_participants: z.number().nullable().optional(),
  is_recurring: z.boolean().optional(),
  parent_session_id: z.string().nullable(),
  recurrence_type: z.enum(["DAILY", "WEEKLY", "MONTHLY"]).nullable().optional(),
  recurrence_interval: z.number().nullable().optional(),
  recurrence_end_date: z.string().nullable().optional(),
});
export type MentorSession = z.infer<typeof MentorSessionSchema>;

export const MentorSessionsResponseSchema = ApiResponseSchema(
  z.object({
    data: z.array(MentorSessionSchema),
    // Sessions API returns a different pagination shape — use passthrough to avoid mismatch
    pagination: z.record(z.string(), z.unknown()).optional(),
  }),
);

export async function getMentorSessions(status = "SCHEDULED") {
  const url = `${endpoints.mentor.sessionList}?status=${status}`;
  const response = await apiClient.get(url, MentorSessionsResponseSchema, {
    skipAuthRedirectOn403: true,
  });
  return response.response.data;
}

export async function acceptSessionRequest(
  sessionId: string,
  userId: string,
): Promise<void> {
  // Doc #20: POST /session/participant/list/<session_id>/ to add a participant
  await apiClient.post(
    endpoints.mentor.sessionParticipantList(sessionId),
    { user: userId, participant_role: "MENTOR", attendance_status: "INVITED" },
    undefined,
    { skipAuthRedirectOn403: true },
  );
}

export async function declineSessionRequest(
  sessionId: string,
  _userId: string,
): Promise<void> {
  // Doc #17: PATCH /session/admin/verify/<session_id>/ with status REJECTED
  // The old DELETE endpoint no longer exists in the doc.
  await apiClient.patch(
    endpoints.mentor.sessionAdminVerify(sessionId),
    { status: "REJECTED" },
    undefined,
    { skipAuthRedirectOn403: true },
  );
}
