import { z } from "zod";
import { ApiResponseSchema } from "@/lib/schemas/api-response";

// ─── Shared pagination ────────────────────────────────────────────────────────
export const PaginationSchema = z.object({
  count: z.number().optional(),
  totalPages: z.coerce.number().default(1),
  isNext: z.boolean().optional(),
  isPrev: z.boolean().optional(),
  nextPage: z.number().nullable().optional(),
});

// ─── Participant roles & attendance statuses ──────────────────────────────────
export const PARTICIPANT_ROLES = ["MENTOR", "CO_MENTOR", "MENTEE"] as const;
export type ParticipantRole = (typeof PARTICIPANT_ROLES)[number];

export const ATTENDANCE_STATUSES = ["INVITED", "ATTENDED", "ABSENT"] as const;
export type AttendanceStatus = (typeof ATTENDANCE_STATUSES)[number];

// ─── SessionParticipant — matches doc response shape ─────────────────────────
// Doc fields: id, session_id, user_id, user_full_name, mu_id, participant_role,
//             attendance_status, progress_note, feedback, contributed_minutes, created_at
export const SessionParticipantSchema = z.object({
  id: z.string().optional(),
  session_id: z.string().optional(),
  user_id: z.string(),
  user_full_name: z.string().optional(),
  mu_id: z.string().optional(),
  // Backward compat aliases
  full_name: z.string().optional(),
  email: z.string().optional(),
  muid: z.string().optional(),
  participant_role: z.enum(PARTICIPANT_ROLES),
  attendance_status: z.enum(ATTENDANCE_STATUSES).nullable().optional(),
  progress_note: z.string().nullable().optional(),
  feedback: z.string().nullable().optional(),
  contributed_minutes: z.number().nullable().optional(),
  created_at: z.string().optional(),
});
export type SessionParticipant = z.infer<typeof SessionParticipantSchema>;

// ─── Session — matches doc response shape ─────────────────────────────────────
// Doc fields: id, ig_id, ig_name, title, description, mode, starts_at, ends_at,
//             status, created_by_id, created_by_name, created_at, max_participants,
//             meeting_link, venue
export const SessionSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable().optional(),
  ig_id: z.string().nullable().optional(),
  ig_name: z.string().nullable().optional(),
  mode: z.string().optional(),
  starts_at: z.string().nullable(),
  ends_at: z.string().nullable(),
  status: z.enum([
    "SCHEDULED",
    "PENDING_APPROVAL",
    "COMPLETED",
    "CANCELLED",
    "REJECTED",
  ]),
  meeting_link: z.string().nullable().optional(),
  venue: z.string().nullable().optional(),
  max_participants: z.number().nullable().optional(),
  created_by_id: z.string().optional(),
  created_by_name: z.string().optional(),
  // Backward compat
  created_by: z.string().optional(),
  is_global: z.boolean().optional().default(false),
  created_at: z.string().optional(),
});
export type Session = z.infer<typeof SessionSchema>;

// ─── Response schemas ─────────────────────────────────────────────────────────
export const SessionsListResponseSchema = ApiResponseSchema(
  z.object({
    data: z.array(SessionSchema),
    pagination: PaginationSchema,
  }),
);

export const SingleSessionResponseSchema = ApiResponseSchema(SessionSchema);

export const ParticipantsListResponseSchema = ApiResponseSchema(
  z.object({
    data: z.array(SessionParticipantSchema),
    pagination: PaginationSchema.optional(),
  }),
);

// ─── Session form schema — POST /session/create/ and PATCH /session/update/<id>/ ──
// Doc fields: ig, title, description, mode, starts_at, ends_at, meeting_link, venue, max_participants
export const SessionFormSchema = z
  .object({
    title: z.string().min(1, "Title is required").max(150),
    description: z.string().optional(),
    ig_id: z.string().optional(),
    mode: z.enum(["ONLINE", "OFFLINE", "HYBRID"]),
    starts_at: z.string().min(1, "Start time is required"),
    ends_at: z.string().min(1, "End time is required"),
    meeting_link: z
      .string()
      .url("Must be a valid URL")
      .optional()
      .or(z.literal("")),
    venue: z.string().optional(),
    max_participants: z.number().min(1).optional(),
  })
  .refine((v) => new Date(v.ends_at) > new Date(v.starts_at), {
    message: "End time must be after start time",
    path: ["ends_at"],
  });
export type SessionFormValues = z.infer<typeof SessionFormSchema>;

// ─── Admin session verify — PATCH /session/admin/verify/<id>/ ─────────────────
// Doc payload: { status: "SCHEDULED" } or { status: "REJECTED" }
export const AdminVerifySessionSchema = z.object({
  status: z.enum(["SCHEDULED", "REJECTED"]),
});
export type AdminVerifySessionValues = z.infer<typeof AdminVerifySessionSchema>;

// ─── Participant update — PATCH /session/participant/update/<link_id>/ ────────
// Doc payload: { attendance_status, progress_note, contributed_minutes }
export const UpdateParticipantSchema = z.object({
  attendance_status: z.enum(ATTENDANCE_STATUSES).optional(),
  progress_note: z.string().max(500).nullable().optional(),
  contributed_minutes: z.number().positive().nullable().optional(),
});
export type UpdateParticipantValues = z.infer<typeof UpdateParticipantSchema>;

// ─── Feedback — PATCH /session/participant/feedback/<session_id>/ ─────────────
export const SubmitFeedbackSchema = z.object({
  feedback: z.string().min(1, "Feedback cannot be empty"),
});
export type SubmitFeedbackValues = z.infer<typeof SubmitFeedbackSchema>;

// ─── Generic response ─────────────────────────────────────────────────────────
export const GenericResponseSchema = ApiResponseSchema(z.any());
export const RemindResponseSchema = ApiResponseSchema(z.any());

// ─── Kept for backward compatibility with existing components ─────────────────
export const ApproveSessionFormSchema = AdminVerifySessionSchema;
export type ApproveSessionFormValues = AdminVerifySessionValues;

export const KarmaAwardFormSchema = z.object({
  mentor_id: z.string().min(1, "Select a mentor"),
  karma: z.number().min(1, "Karma must be at least 1"),
  note: z.string().optional(),
});
export type KarmaAwardFormValues = z.infer<typeof KarmaAwardFormSchema>;

export const AddParticipantFormSchema = z.object({
  user: z.string().min(1, "User ID is required"),
  participant_role: z.enum(PARTICIPANT_ROLES),
});
export type AddParticipantFormValues = z.infer<typeof AddParticipantFormSchema>;

export const AttendanceEntrySchema = z.object({
  user_id: z.string().min(1),
  attendance_status: z.enum(ATTENDANCE_STATUSES),
});
export type AttendanceEntry = z.infer<typeof AttendanceEntrySchema>;

export const AttendanceBulkUpdateSchema = z.object({
  participants: z.array(AttendanceEntrySchema).min(1),
});
export type AttendanceBulkUpdateValues = z.infer<
  typeof AttendanceBulkUpdateSchema
>;

export const KarmaAwardSchema = z.object({
  id: z.string(),
  session_id: z.string(),
  session_title: z.string().optional(),
  mentor_id: z.string(),
  mentor_name: z.string().optional(),
  karma: z.number(),
  note: z.string().nullable().optional(),
  awarded_by_name: z.string().optional(),
  awarded_at: z.string().optional(),
  kal_id: z.string().nullable().optional(),
  created_at: z.string().optional(),
});
export type KarmaAward = z.infer<typeof KarmaAwardSchema>;

export const KarmaAwardListResponseSchema = ApiResponseSchema(
  z.object({ awards: z.array(KarmaAwardSchema) }),
);
export const KarmaAwardSingleResponseSchema = ApiResponseSchema(
  z.object({ award: KarmaAwardSchema }),
);
