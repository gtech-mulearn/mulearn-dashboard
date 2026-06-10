import { z } from "zod";
import { ApiResponseSchema } from "@/lib/schemas/api-response";

// ─── Session Participant Feedback ──────────────────────────────────────────────
// PATCH /api/v1/dashboard/mentor/session/participant/feedback/{session_id}/

export const SessionFeedbackResponseSchema = z.object({
  hasError: z.boolean().optional(),
  statusCode: z.number().optional(),
  response: z.object({
    attendance_status: z
      .enum(["INVITED", "ATTENDED", "ABSENT"])
      .nullable()
      .optional(),
    progress_note: z.string().max(500).nullable().optional(),
    feedback: z.string().nullable().optional(),
    contributed_minutes: z.number().nullable().optional(),
    created_at: z.string(),
  }),
});
export type SessionFeedbackResponse = z.infer<
  typeof SessionFeedbackResponseSchema
>;

// ─── Session Participant History ───────────────────────────────────────────────
// GET /api/v1/dashboard/mentor/session/participant/history/
// Used both for the ParticipantHistorySheet and to derive the Mentees list.

export const ParticipantHistoryItemSchema = z.object({
  id: z.string().max(36).optional(),
  session_id: z.string(),
  user_id: z.string(),
  user_full_name: z.string(),
  mu_id: z.string().nullable().optional(),
  participant_role: z.enum(["MENTOR", "MENTEE", "CO_MENTOR"]),
  attendance_status: z
    .enum(["INVITED", "ATTENDED", "ABSENT"])
    .nullable()
    .optional(),
  progress_note: z.string().max(500).nullable().optional(),
  feedback: z.string().nullable().optional(),
  contributed_minutes: z.number().nullable().optional(),
  created_at: z.string(),
});
export type ParticipantHistoryItem = z.infer<
  typeof ParticipantHistoryItemSchema
>;

export const ParticipantHistoryResponseSchema = z.object({
  hasError: z.boolean().optional(),
  statusCode: z.number().optional(),
  response: z.object({
    data: z.array(ParticipantHistoryItemSchema),
    // Accept any pagination shape this endpoint returns
    pagination: z.record(z.string(), z.unknown()).optional(),
  }),
});

// ─── Session Participant List ──────────────────────────────────────────────────
// GET /api/v1/dashboard/mentor/session/participant/list/{session_id}/
// Mentor view — lists ALL participants in a specific session.

export const SessionParticipantListItemSchema = z.object({
  id: z.string().max(36).optional(),
  session_id: z.string(),
  user_id: z.string(),
  user_full_name: z.string(),
  mu_id: z.string().nullable().optional(),
  participant_role: z.enum(["MENTOR", "MENTEE", "CO_MENTOR"]),
  attendance_status: z
    .enum(["INVITED", "ATTENDED", "ABSENT"])
    .nullable()
    .optional(),
  progress_note: z.string().max(500).nullable().optional(),
  feedback: z.string().nullable().optional(),
  contributed_minutes: z.number().nullable().optional(),
  created_at: z.string(),
});
export type SessionParticipantListItem = z.infer<
  typeof SessionParticipantListItemSchema
>;

export const SessionParticipantListResponseSchema = z.object({
  hasError: z.boolean().optional(),
  statusCode: z.number().optional(),
  message: z.object({ general: z.array(z.string()).optional() }).optional(),
  response: z.array(SessionParticipantListItemSchema),
});

// ─── Mentee View ───────────────────────────────────────────────────────────────
// Derived client-side from ParticipantHistoryItem[]: one entry per unique
// MENTEE-role participant, with an aggregated session count.

export type MenteeView = {
  user_id: string;
  user_full_name: string;
  mu_id: string | null;
  session_count: number;
  last_session_id: string;
  last_attendance_status: "INVITED" | "ATTENDED" | "ABSENT" | null;
};

// ─── Update Participant ────────────────────────────────────────────────────────
// PATCH /api/v1/dashboard/mentor/session/participant/update/{link_id}/

export const UpdateParticipantSchema = z.object({
  attendance_status: z.enum(["INVITED", "ATTENDED", "ABSENT"]).optional(),
  progress_note: z.string().max(500).nullable().optional(),
  contributed_minutes: z.number().positive().nullable().optional(),
});
export type UpdateParticipantValues = z.infer<typeof UpdateParticipantSchema>;

// ─── Join Session Response ────────────────────────────────────────────────────
// POST /api/v1/dashboard/mentor/session/participation/join/{session_id}/

export const JoinSessionParticipantSchema = z.object({
  id: z.string().max(36).optional(),
  session_id: z.string(),
  user_id: z.string(),
  user_full_name: z.string(),
  mu_id: z.string().nullable().optional(),
  participant_role: z.enum(["MENTOR", "MENTEE", "CO_MENTOR"]),
  attendance_status: z
    .enum(["INVITED", "ATTENDED", "ABSENT"])
    .nullable()
    .optional(),
  progress_note: z.string().max(500).nullable().optional(),
  feedback: z.string().nullable().optional(),
  contributed_minutes: z.number().nullable().optional(),
  created_at: z.string(),
});
export type JoinSessionParticipant = z.infer<
  typeof JoinSessionParticipantSchema
>;

export const JoinSessionResponseSchema = z.object({
  hasError: z.boolean().optional(),
  statusCode: z.number().optional(),
  message: z.object({ general: z.array(z.string()).optional() }).optional(),
  response: JoinSessionParticipantSchema,
});

// ─── Generic response ─────────────────────────────────────────────────────────
export const GenericResponseSchema = ApiResponseSchema(z.any());
