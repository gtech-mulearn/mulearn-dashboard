import { z } from "zod";
import { ApiResponseSchema } from "@/lib/schemas/api-response";

export const PaginationSchema = z.object({
  count: z.number().optional(),
  totalPages: z.coerce.number().default(1),
  isNext: z.boolean().optional(),
  isPrev: z.boolean().optional(),
  nextPage: z.number().nullable().optional(),
});

export const PARTICIPANT_ROLES = ["MENTOR", "CO_MENTOR", "MENTEE"] as const;
export type ParticipantRole = (typeof PARTICIPANT_ROLES)[number];

export const ATTENDANCE_STATUSES = [
  "INVITED",
  "ATTENDED",
  "ABSENT",
  "NO_SHOW",
] as const;
export type AttendanceStatus = (typeof ATTENDANCE_STATUSES)[number];

export const SessionParticipantSchema = z.object({
  id: z.string().optional(),
  user_id: z.string(),
  full_name: z.string(),
  email: z.string().optional(),
  muid: z.string().optional(),
  participant_role: z.enum(PARTICIPANT_ROLES),
  attendance_status: z.enum(ATTENDANCE_STATUSES).nullable().optional(),
  progress_note: z.string().nullable().optional(),
  contributed_minutes: z.number().nullable().optional(),
  created_at: z.string().optional(),
});
export type SessionParticipant = z.infer<typeof SessionParticipantSchema>;

export const SessionSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable().optional(),
  ig_id: z.string().nullable().optional(),
  ig_name: z.string().nullable().optional(),
  is_global: z.boolean().optional().default(false),
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
  max_participants: z.number().nullable().optional(),
  participants: z.array(SessionParticipantSchema).optional().default([]),
  created_by: z.string().optional(),
  suggested_ig_ids: z.array(z.string()).optional().default([]),
});
export type Session = z.infer<typeof SessionSchema>;

export const SessionsListResponseSchema = ApiResponseSchema(
  z.object({
    data: z.array(SessionSchema),
    pagination: PaginationSchema,
  }),
);

export const SuggestedIgSchema = z.object({
  ig_id: z.string(),
  ig_name: z.string(),
});
export type SuggestedIg = z.infer<typeof SuggestedIgSchema>;

export const PendingSessionSchema = SessionSchema.extend({
  suggested_igs: z.array(SuggestedIgSchema).optional().default([]),
});
export type PendingSession = z.infer<typeof PendingSessionSchema>;

export const PendingSessionsResponseSchema = ApiResponseSchema(
  z.object({
    data: z.array(PendingSessionSchema),
    pagination: PaginationSchema.optional(),
  }),
);

export const SingleSessionResponseSchema = ApiResponseSchema(
  z.object({ session: SessionSchema }),
);

export const ParticipantsResponseSchema = ApiResponseSchema(
  z.object({ participants: z.array(SessionParticipantSchema) }),
);

export const SessionFormSchema = z
  .object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    ig_id: z.string().optional(),
    starts_at: z.string().min(1, "Start time is required"),
    ends_at: z.string().min(1, "End time is required"),
    meet_link: z
      .string()
      .url("Must be a valid URL")
      .optional()
      .or(z.literal("")),
    max_participants: z.number().min(1).optional(),
  })
  .refine((v) => new Date(v.ends_at) > new Date(v.starts_at), {
    message: "End time must be after start time",
    path: ["ends_at"],
  });
export type SessionFormValues = z.infer<typeof SessionFormSchema>;

export const ApproveSessionFormSchema = z.object({
  action: z.enum(["approve", "reject"]),
  ig_id: z.string().optional(),
  remarks: z.string().optional(),
});
export type ApproveSessionFormValues = z.infer<typeof ApproveSessionFormSchema>;

export const KarmaAwardFormSchema = z.object({
  mentor_id: z.string().min(1, "Select a mentor"),
  karma: z.number().min(1, "Karma must be at least 1"),
  note: z.string().optional(),
});
export type KarmaAwardFormValues = z.infer<typeof KarmaAwardFormSchema>;

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

export const AddParticipantFormSchema = z.object({
  user: z.string().min(1, "User ID is required"),
  participant_role: z.enum(PARTICIPANT_ROLES),
});
export type AddParticipantFormValues = z.infer<typeof AddParticipantFormSchema>;

// Bulk attendance update — PATCH /sessions/<id>/attendance/
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

export const RemindResponseSchema = ApiResponseSchema(z.any());

export const GenericResponseSchema = ApiResponseSchema(z.any());
