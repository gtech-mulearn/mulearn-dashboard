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
  // Session details — populated by the participant-history endpoint so a
  // participant row can be rendered without an extra session fetch.
  session_title: z.string().nullable().optional(),
  session_starts_at: z.string().nullable().optional(),
  session_ends_at: z.string().nullable().optional(),
  session_mode: z.string().nullable().optional(),
  session_meeting_link: z.string().nullable().optional(),
  session_venue: z.string().nullable().optional(),
  session_status: z.string().nullable().optional(),
  session_entity_id: z.string().nullable().optional(),
  session_entity_name: z.string().nullable().optional(),
});
export type SessionParticipant = z.infer<typeof SessionParticipantSchema>;

// ─── Session — matches doc response shape ─────────────────────────────────────
// Doc fields: id, ig_id, ig_name, entity_id, entity_name, session_type,
//             title, description, mode, starts_at, ends_at, status,
//             created_by_id, created_by_name, created_at, max_participants,
//             meeting_link, venue
// session_type discriminates ig_session vs company_session (§4.2)
export const SessionSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable().optional(),
  // IG session fields (legacy + backward compat)
  ig_id: z.string().nullable().optional(),
  ig_name: z.string().nullable().optional(),
  // §4.2 — entity fields present in /session/available/ response
  entity_id: z.string().nullable().optional(),
  entity_name: z.string().nullable().optional(),
  session_type: z.enum(["ig_session", "company_session"]).nullable().optional(),
  mode: z.string().nullable().optional(),
  starts_at: z.string().nullable().optional(),
  ends_at: z.string().nullable().optional(),
  status: z.string().nullable().optional().default("PENDING_APPROVAL"),
  meeting_link: z.string().nullable().optional(),
  venue: z.string().nullable().optional(),
  max_participants: z.coerce.number().nullable().optional(),
  created_by_id: z.string().nullable().optional(),
  created_by_name: z.string().nullable().optional(),
  // Backward compat
  created_by: z.string().nullable().optional(),
  is_global: z.boolean().nullable().optional().default(false),
  created_at: z.string().nullable().optional(),
  // Recurrence fields
  is_recurring: z.boolean().nullable().optional().default(false),
  parent_session_id: z.string().nullable().optional(),
  child_session_ids: z.array(z.string()).nullable().optional(),
  recurrence_type: z.string().nullable().optional(),
  recurrence_interval: z.coerce.number().nullable().optional(),
  recurrence_end_date: z.string().nullable().optional(),
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
export const SessionFormBaseSchema = z.object({
  title: z.string().min(1, "Title is required").max(150),
  description: z.string().optional(),
  // IG is required only for IG mentors. Company mentors are scoped to their org
  // by the backend (session_type=company_session), so they create sessions
  // without selecting an Interest Group — see is_company_session below.
  ig_id: z.string().optional(),
  // Discriminator set by the dialog from the mentor's tier (COMPANY_MENTOR →
  // true). Never sent to the backend; the payload builder strips it.
  is_company_session: z.boolean().optional().default(false),
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
  is_recurring: z.boolean().optional().default(false),
  recurrence_type: z.enum(["DAILY", "WEEKLY", "MONTHLY"]).optional(),
  recurrence_interval: z.number().min(1).optional(),
  recurrence_end_date: z.string().optional(),
});

export type SessionFormValues = z.infer<typeof SessionFormBaseSchema>;

export const SessionFormSchema = SessionFormBaseSchema.superRefine((v, ctx) => {
  // IG is mandatory unless this is a company-mentor session (org-scoped).
  if (!v.is_company_session && !v.ig_id?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Interest Group is required",
      path: ["ig_id"],
    });
  }

  // Basic end_at vs starts_at
  if (new Date(v.ends_at) <= new Date(v.starts_at)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "End time must be after start time",
      path: ["ends_at"],
    });
  }

  // Recurrence validation
  if (v.is_recurring) {
    if (!v.recurrence_type) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Recurrence type is required when recurring",
        path: ["recurrence_type"],
      });
    }
    if (!v.recurrence_interval || v.recurrence_interval < 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Interval must be at least 1",
        path: ["recurrence_interval"],
      });
    }
    if (!v.recurrence_end_date) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "End date is required for recurring sessions",
        path: ["recurrence_end_date"],
      });
    } else if (new Date(v.recurrence_end_date) <= new Date(v.starts_at)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Recurrence end date must be after session start date",
        path: ["recurrence_end_date"],
      });
    }
  }
});

// ─── Admin session verify — PATCH /session/admin/verify/<id>/ ─────────────────
// Doc payload: { status: "SCHEDULED" } or { status: "REJECTED" }
export const AdminVerifySessionSchema = z.object({
  status: z.enum(["SCHEDULED", "REJECTED"]),
  apply_to_series: z.boolean().optional().default(false),
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
export const GenericResponseSchema = ApiResponseSchema(z.unknown());
export const RemindResponseSchema = ApiResponseSchema(z.unknown());

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
  muid: z.string().min(1, "User ID or MUID is required"),
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

// ─── Student Session Requests ────────────────────────────────────────────────

export const StudentSessionRequestSchema = z.object({
  id: z.string(),
  session_type: z.string(),
  entity_id: z.string().optional(),
  entity_name: z.string().optional(),
  title: z.string(),
  description: z.string().optional().nullable(),
  mode: z.enum(["ONLINE", "OFFLINE", "HYBRID"]),
  starts_at: z.string(),
  ends_at: z.string(),
  status: z.string().optional().nullable(),
  meeting_link: z.string().optional().nullable(),
  venue: z.string().optional().nullable(),
  max_participants: z.number().optional().nullable(),
  requested_by_id: z.string().optional(),
  requested_by_name: z.string().optional(),
  requested_by_muid: z.string().optional(),
  created_at: z.string().optional(),
});
export type StudentSessionRequest = z.infer<typeof StudentSessionRequestSchema>;

export const StudentSessionRequestListResponseSchema = ApiResponseSchema(
  z.object({
    data: z.array(StudentSessionRequestSchema),
    pagination: PaginationSchema,
  }),
);

export const StudentSessionRequestSingleResponseSchema = ApiResponseSchema(
  StudentSessionRequestSchema,
);

export const StudentSessionRequestFormSchema = z
  .object({
    session_type: z.string().min(1, "Session type is required"),
    entity_id: z.string().min(1, "Entity is required"),
    title: z.string().min(1, "Title is required").max(150),
    description: z.string().min(1, "Description is required"),
    mode: z.enum(["ONLINE", "OFFLINE", "HYBRID"]),
    starts_at: z.string().min(1, "Start time is required"),
    ends_at: z.string().min(1, "End time is required"),
    meeting_link: z
      .string()
      .url("Must be a valid URL")
      .optional()
      .or(z.literal("")),
    venue: z.string().optional(),
    max_participants: z.coerce.number().min(1).optional(),
  })
  .superRefine((v, ctx) => {
    if (new Date(v.ends_at) <= new Date(v.starts_at)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "End time must be after start time",
        path: ["ends_at"],
      });
    }

    if (["ONLINE", "HYBRID"].includes(v.mode) && !v.meeting_link) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Meeting link is required for ONLINE or HYBRID mode",
        path: ["meeting_link"],
      });
    }

    if (["OFFLINE", "HYBRID"].includes(v.mode) && !v.venue) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Venue is required for OFFLINE or HYBRID mode",
        path: ["venue"],
      });
    }
  });
export type StudentSessionRequestFormValues = z.infer<
  typeof StudentSessionRequestFormSchema
>;

export const MentorVerifyRequestSchema = z
  .object({
    status: z.enum(["APPROVED", "REJECTED"]),
    starts_at: z.string().optional(),
    ends_at: z.string().optional(),
    mode: z.enum(["ONLINE", "OFFLINE", "HYBRID"]).optional(),
    meeting_link: z
      .string()
      .url("Must be a valid URL")
      .optional()
      .or(z.literal("")),
    venue: z.string().optional(),
  })
  .superRefine((v, ctx) => {
    if (v.status === "APPROVED" && v.starts_at && v.ends_at) {
      if (new Date(v.ends_at) <= new Date(v.starts_at)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "End time must be after start time",
          path: ["ends_at"],
        });
      }
    }
  });
export type MentorVerifyRequestValues = z.infer<
  typeof MentorVerifyRequestSchema
>;
