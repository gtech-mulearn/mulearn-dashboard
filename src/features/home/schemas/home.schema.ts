/**
 * Home Feature Schemas
 *
 * 📍 src/features/home/schemas/home.schema.ts
 */

import { z } from "zod";

// ============================================
// Django Response Wrapper (reusable)
// ============================================

export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    hasError: z.boolean(),
    statusCode: z.number(),
    message: z.record(z.string(), z.array(z.string())).optional(),
    response: dataSchema,
  });

// ============================================
// Interest Groups (/api/v1/dashboard/ig/list/)
// ============================================

export const InterestGroupListItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string().optional(),
});
export type InterestGroupListItem = z.infer<typeof InterestGroupListItemSchema>;

export const InterestGroupsListDataSchema = z.object({
  interestGroup: z.array(InterestGroupListItemSchema),
});
export type InterestGroupsListData = z.infer<
  typeof InterestGroupsListDataSchema
>;

export const InterestGroupsListResponseSchema = ApiResponseSchema(
  InterestGroupsListDataSchema,
);
export type InterestGroupsListResponse = z.infer<
  typeof InterestGroupsListResponseSchema
>;

// ============================================
// Karma Feed (/api/v1/dashboard/profile/karma-feed/)
// ============================================

export const KarmaFeedResponseSchema = ApiResponseSchema(
  z.object({
    top_user: z.object({
      karma: z.number(),
      full_name: z.string(),
      muid: z.string(),
    }),
    top_college: z.object({
      karma: z.number(),
      name: z.string(),
    }),
  }),
);
export type KarmaFeedResponse = z.infer<typeof KarmaFeedResponseSchema>;

// ============================================
// Events (OpenSheet / external feed)
// ============================================

export const EventRowSchema = z.object({
  Name: z.string().optional(),
  Description: z.string().optional(),
  Poster: z.string().optional(),
  Links: z.string().optional(),
  Date: z.string().optional(),
  Status: z.string().optional(),
});
export type EventRow = z.infer<typeof EventRowSchema>;

export const EventSchema = z.object({
  name: z.string(),
  description: z.string(),
  poster: z.string(),
  link: z.string(),
  date: z.string(),
  status: z.string(),
});
export type Event = z.infer<typeof EventSchema>;

// Array of mapped events
export const EventsSchema = z.array(EventSchema);
export type Events = z.infer<typeof EventsSchema>;

// ============================================
// Calendar Events (/api/v1/dashboard/events/calendar/)
// ============================================

export const CalendarEventSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional().default(""),
  date: z.string(), // ISO date string e.g. "2026-03-15"
  type: z
    .enum(["hackathon", "workshop", "meetup", "deadline", "other"])
    .optional()
    .default("other"),
  location: z.string().optional().default(""),
  link: z.string().optional().default(""),
});
export type CalendarEvent = z.infer<typeof CalendarEventSchema>;

export const CalendarEventsDataSchema = z.object({
  events: z.array(CalendarEventSchema),
});

export const CalendarEventsResponseSchema = ApiResponseSchema(
  CalendarEventsDataSchema,
);
export type CalendarEventsResponse = z.infer<
  typeof CalendarEventsResponseSchema
>;

// ============================================
// Pagination (shared)
// ============================================

export const PaginationSchema = z.object({
  totalPages: z.number(),
  currentPage: z.number(),
  totalCount: z.number(),
  nextPage: z.number().nullable(),
  previousPage: z.number().nullable(),
});

// ============================================
// Mentor Overview (/mentor/overview/)
// ============================================

export const MentorOverviewSchema = z.object({
  user: z.object({
    full_name: z.string(),
    muid: z.string(),
    profile_pic: z.string().nullable(),
  }),
  mentor_profile: z.object({
    about: z.string().nullable(),
    expertise: z.array(z.string()),
    reason: z.string().nullable(),
    volunteer_hours: z.number(),
    mentor_tier: z.string().nullable(),
    is_verified: z.boolean(),
  }),
  active_persona: z
    .object({
      active_persona: z.string().nullable(),
      active_role_link_id: z.string().nullable(),
      active_ig_id: z.string().nullable(),
      ig_name: z.string().nullable(),
      is_verified: z.boolean(),
    })
    .nullable(),
  authorized_igs: z.array(
    z.object({
      role_link_id: z.string(),
      ig_id: z.string(),
      ig_name: z.string(),
      is_primary: z.boolean(),
      is_verified: z.boolean(),
    }),
  ),
  stats: z.object({
    total_mentees: z.number(),
    sessions_conducted: z.number(),
    pending_task_approvals: z.number(),
    volunteer_hours: z.number(),
  }),
});
export type MentorOverview = z.infer<typeof MentorOverviewSchema>;

export const MentorOverviewResponseSchema =
  ApiResponseSchema(MentorOverviewSchema);

// ============================================
// Mentor Sessions (/mentor/sessions/)
// ============================================

export const MentorSessionParticipantSchema = z.object({
  user_id: z.string(),
  full_name: z.string(),
  participant_role: z.string(),
  attendance_status: z.string().nullable(),
});

export const MentorSessionSchema = z.object({
  id: z.string(),
  ig_name: z.string().nullable(),
  title: z.string(),
  mode: z.string(),
  starts_at: z.string(),
  ends_at: z.string(),
  status: z.string(),
  meeting_link: z.string().nullable(),
  participants: z.array(MentorSessionParticipantSchema),
});
export type MentorSession = z.infer<typeof MentorSessionSchema>;

export const MentorSessionsResponseSchema = ApiResponseSchema(
  z.object({
    data: z.array(MentorSessionSchema),
    pagination: PaginationSchema,
  }),
);

// ============================================
// Mentor Mentees (/mentor/mentees/)
// ============================================

export const MentorMenteeSchema = z.object({
  user_id: z.string(),
  full_name: z.string(),
  muid: z.string(),
  profile_pic: z.string().nullable(),
  karma: z.number(),
  level: z.string().nullable(),
  ig_karma: z.number(),
  ig_level: z.string().nullable(),
  session_count: z.number(),
  last_session_at: z.string().nullable(),
});
export type MentorMentee = z.infer<typeof MentorMenteeSchema>;

export const MentorMenteesResponseSchema = ApiResponseSchema(
  z.object({
    active_ig_id: z.string().nullable(),
    data: z.array(MentorMenteeSchema),
    pagination: PaginationSchema,
  }),
);

// ============================================
// Public Jobs Count (/public/jobs/)
// ============================================

export const PublicJobsResponseSchema = ApiResponseSchema(
  z.object({
    data: z.array(z.unknown()),
    pagination: PaginationSchema,
  }),
);

// ============================================
// Mentor Persona — IG Roles + Switch
// ============================================

export const MentorIgRoleSchema = z.object({
  role_link_id: z.string(),
  ig_id: z.string(),
  ig_name: z.string(),
  role: z.string(),
  is_primary: z.boolean(),
  is_verified: z.boolean(),
  mentor_tier: z.string(),
});

export type MentorIgRole = z.infer<typeof MentorIgRoleSchema>;

export const MentorIgRolesResponseSchema = ApiResponseSchema(
  z.object({
    ig_roles: z.array(MentorIgRoleSchema),
  }),
);

export const MentorPersonaSwitchResponseSchema = ApiResponseSchema(
  z.object({
    active_persona: z.string(),
    active_role_link_id: z.string(),
    active_ig_id: z.string(),
    ig_name: z.string(),
    is_verified: z.boolean(),
    mentor_tier: z.string(),
    profile_created: z.boolean().optional(),
    last_persona_switched_at: z.string().optional(),
    access: z.string().nullable().optional(),
  }),
);
