import { z } from "zod";
import { ApiResponseSchema } from "@/lib/schemas/api-response";

// Backend returns raw queryset rows with Django ORM field paths
// (`.values("user_id", "user__full_name", ...)`).
// We re-shape into camel-clean fields via z.preprocess.
const MenteeRawSchema = z.object({
  user_id: z.string(),
  user__full_name: z.string().nullable().optional(),
  user__muid: z.string().nullable().optional(),
  user__email: z.string().nullable().optional(),
  total_sessions: z.coerce.number().default(0),
});

export const MenteeSchema = z.preprocess(
  (raw) => {
    if (!raw || typeof raw !== "object") return raw;
    const r = raw as Record<string, unknown>;
    // Allow already-flattened records to pass through unchanged
    if ("full_name" in r) return r;
    return {
      user_id: r.user_id,
      full_name: r.user__full_name ?? "",
      muid: r.user__muid ?? "",
      email: r.user__email ?? "",
      total_sessions: r.total_sessions ?? 0,
    };
  },
  z.object({
    user_id: z.string(),
    full_name: z.string().default(""),
    muid: z.string().default(""),
    email: z.string().default(""),
    total_sessions: z.coerce.number().default(0),
  }),
);
export type Mentee = z.infer<typeof MenteeSchema>;
export type MenteeRaw = z.infer<typeof MenteeRawSchema>;

export const MenteeListResponseSchema = ApiResponseSchema(
  z.object({
    data: z.array(MenteeSchema),
    pagination: z.record(z.string(), z.unknown()).optional(),
  }),
);

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
