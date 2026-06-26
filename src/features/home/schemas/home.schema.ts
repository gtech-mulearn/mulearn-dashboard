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
// New API shape: { scopes: [{scope_type, scope_id, scope_name}], metrics: any }
// ============================================

export const MentorOverviewScopeSchema = z.object({
  scope_type: z.string(),
  scope_id: z.string(),
  scope_name: z.string().nullable(),
});
export type MentorOverviewScope = z.infer<typeof MentorOverviewScopeSchema>;

export const MentorOverviewSchema = z.object({
  scopes: z.array(MentorOverviewScopeSchema),
  metrics: z.record(z.string(), z.unknown()).optional(),
});
export type MentorOverview = z.infer<typeof MentorOverviewSchema>;

export const MentorOverviewResponseSchema =
  ApiResponseSchema(MentorOverviewSchema);

// ============================================
// Legacy session/task-request types (used by getMentorHomeSummary adapter)
// ============================================

export const OverviewSessionListItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable().optional(),
  mode: z.string().optional(),
  starts_at: z.string(),
  ends_at: z.string(),
  meeting_link: z.string().nullable().optional(),
  status: z.string(),
  is_global: z.boolean().optional(),
  ig_id: z.string().nullable().optional(),
  ig_name: z.string().nullable().optional(),
  created_by_name: z.string().optional(),
  created_at: z.string().optional(),
  participant_count: z.number().optional().default(0),
});
export type OverviewSessionListItem = z.infer<
  typeof OverviewSessionListItemSchema
>;

export const OverviewTaskRequestItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  hashtag: z.string().optional(),
  karma: z.number().optional(),
  mentor_name: z.string().optional(),
  ig_name: z.string().optional(),
  ig_id: z.string().optional(),
  status: z.string(),
  created_at: z.string().optional(),
});
export type OverviewTaskRequestItem = z.infer<
  typeof OverviewTaskRequestItemSchema
>;

export const OverviewActivityItemSchema = z.object({
  id: z.string(),
  action_type: z.string(),
  actor_name: z.string().nullable().optional(),
  subject_name: z.string().nullable().optional(),
  ig_name: z.string().nullable().optional(),
  entity_name: z.string().optional(),
  entity_id: z.string().optional(),
  old_data: z.record(z.string(), z.unknown()).nullable().optional(),
  new_data: z.record(z.string(), z.unknown()).nullable().optional(),
  remarks: z.string().nullable().optional(),
  created_at: z.string(),
});
export type OverviewActivityItem = z.infer<typeof OverviewActivityItemSchema>;

// ============================================
// Mentor Sessions (/mentor/session/list/)
// Response: { data: MentorSession[], pagination: {...} }
// ============================================

export const MentorSessionSchema = z.object({
  id: z.string().max(36).optional(),
  entity_id: z.string().max(36).nullable().optional(),
  entity_name: z.string(),
  session_type: z
    .enum(["ig_session", "campus_session", "company_session"])
    .optional(),
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
/** @deprecated Use MentorSession instead */
export type MentorSessionPartial = MentorSession;

export const MentorSessionsResponseSchema = ApiResponseSchema(
  z.object({
    data: z.array(MentorSessionSchema),
    // Sessions API returns a different pagination shape — use passthrough to avoid mismatch
    pagination: z.record(z.string(), z.unknown()).optional(),
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

// mentor/my-igs/ returns a simpler shape than the persona endpoint
export const MentorMyIgSchema = z.object({
  ig_id: z.string(),
  ig_name: z.string(),
  ig_code: z.string(),
});
export type MentorMyIg = z.infer<typeof MentorMyIgSchema>;

export const MentorMyIgsResponseSchema = ApiResponseSchema(
  z.object({ igs: z.array(MentorMyIgSchema) }),
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

// ============================================
// Learner Home Summary (/dashboard/home/learner/summary/)
// ============================================

export const LearnerStatsSchema = z.object({
  weekly_karma: z.number(),
  total_karma: z.number(),
  rank: z.number().nullable(),
  active_circles: z.number(),
  streak_days: z.number(),
});
export type LearnerStats = z.infer<typeof LearnerStatsSchema>;

export const LearnerNextMeetingSchema = z
  .object({
    id: z.string(),
    circle_id: z.string(),
    circle_name: z.string(),
    title: z.string(),
    starts_at: z.string(),
    duration_minutes: z.number(),
    meeting_link: z.string().nullable(),
    rsvp_status: z.string(),
  })
  .nullable();
export type LearnerNextMeeting = z.infer<typeof LearnerNextMeetingSchema>;

export const LearnerQuickActionCountsSchema = z.object({
  circles: z.number(),
  leaderboard_rank: z.number().nullable(),
  job_openings: z.number(),
});
export type LearnerQuickActionCounts = z.infer<
  typeof LearnerQuickActionCountsSchema
>;

export const LearnerHomeSummaryDataSchema = z.object({
  stats: LearnerStatsSchema,
  next_meeting: LearnerNextMeetingSchema,
  quick_action_counts: LearnerQuickActionCountsSchema,
});
export type LearnerHomeSummaryData = z.infer<
  typeof LearnerHomeSummaryDataSchema
>;

export const LearnerHomeSummaryResponseSchema = ApiResponseSchema(
  LearnerHomeSummaryDataSchema,
);

// ============================================
// Mentor Home Summary (/mentor/overview/home-summary/)
// ============================================

export const MentorStatCardSchema = z.object({
  key: z.string(),
  label: z.string(),
  value: z.number(),
  delta: z.number(),
  delta_type: z.enum(["positive", "negative", "neutral"]),
  period: z.string(),
});
export type MentorStatCard = z.infer<typeof MentorStatCardSchema>;

export const MentorNextSessionSchema = z
  .object({
    id: z.string(),
    title: z.string(),
    mentee_name: z.string(),
    mentee_muid: z.string(),
    starts_at: z.string(),
    mode: z.string(),
    meeting_link: z.string().nullable(),
  })
  .nullable();
export type MentorNextSession = z.infer<typeof MentorNextSessionSchema>;

export const MentorHomeSummaryDataSchema = z
  .object({
    next_session: MentorNextSessionSchema.optional().default(null),
    stat_cards: z.array(MentorStatCardSchema).optional().default([]),
    upcoming_sessions: z.array(MentorSessionSchema).optional().default([]),
    session_requests: z.array(MentorSessionSchema).optional().default([]),
    expertise_tags: z.array(z.string()).optional().default([]),
  })
  .passthrough();
export type MentorHomeSummaryData = z.infer<typeof MentorHomeSummaryDataSchema>;

export const MentorHomeSummaryResponseSchema = ApiResponseSchema(
  MentorHomeSummaryDataSchema,
);

// ============================================
// Company Home Summary (/dashboard/company/home-summary/)
// ============================================

export const CompanyQuickStatsSchema = z.object({
  jobs_posted: z.number().catch(0),
  total_views: z.number().catch(0),
  applications: z.number().catch(0),
  hired: z.number().catch(0),
});
export type CompanyQuickStats = z.infer<typeof CompanyQuickStatsSchema>;

export const LevelDistributionItemSchema = z.object({
  level_id: z.string(),
  level_name: z.string(),
  level_order: z.number(),
  count: z.number(),
  percentage: z.number(),
});
export type LevelDistributionItem = z.infer<typeof LevelDistributionItemSchema>;

export const TalentPoolTopIgSchema = z.object({
  ig_id: z.string(),
  name: z.string(),
  learner_count: z.number(),
  total_karma: z.number(),
});
export type TalentPoolTopIg = z.infer<typeof TalentPoolTopIgSchema>;

export const CompanyTalentPoolSchema = z.object({
  total_learners: z.number(),
  level_distribution: z.array(LevelDistributionItemSchema),
  top_interest_groups: z.array(TalentPoolTopIgSchema),
});
export type CompanyTalentPool = z.infer<typeof CompanyTalentPoolSchema>;

export const CompanyStatCardSchema = z.object({
  key: z.string(),
  label: z.string(),
  value: z.number(),
  delta: z.number(),
  delta_type: z.string(),
  period: z.string(),
});
export type CompanyStatCard = z.infer<typeof CompanyStatCardSchema>;

export const CompanyHomeSummaryDataSchema = z.object({
  company: z.object({
    id: z.string(),
    name: z.string(),
    slug: z.string(),
    status: z.string(),
    logo: z.string().nullable(),
  }),
  quick_stats: CompanyQuickStatsSchema,
  stat_cards: z.array(CompanyStatCardSchema),
  talent_pool: CompanyTalentPoolSchema,
});
export type CompanyHomeSummaryData = z.infer<
  typeof CompanyHomeSummaryDataSchema
>;

export const CompanyHomeSummaryResponseSchema = ApiResponseSchema(
  CompanyHomeSummaryDataSchema,
);

// ============================================
// Learner Streak (/dashboard/home/learner/streak/)
// ============================================

export const LearnerStreakDataSchema = z.object({
  streak_days: z.number(),
  last_activity_at: z.string().nullable(),
  activity_dates: z.array(z.string()),
});
export type LearnerStreakData = z.infer<typeof LearnerStreakDataSchema>;

export const LearnerStreakResponseSchema = ApiResponseSchema(
  LearnerStreakDataSchema,
);

// ============================================
// Campus Dashboard (/dashboard/campus/*)
// ============================================

// Member Funnel
export const CampusFunnelStageSchema = z.object({
  key: z.string(),
  label: z.string(),
  count: z.number(),
  percentage: z.number(),
});
export type CampusFunnelStage = z.infer<typeof CampusFunnelStageSchema>;

export const CampusMemberFunnelDataSchema = z.object({
  max: z.number(),
  stages: z.array(CampusFunnelStageSchema),
});
export type CampusMemberFunnelData = z.infer<
  typeof CampusMemberFunnelDataSchema
>;

export const CampusMemberFunnelResponseSchema = ApiResponseSchema(
  CampusMemberFunnelDataSchema,
);

// Circle Health
export const CampusCircleHealthItemSchema = z.object({
  circle_id: z.string(),
  circle_name: z
    .string()
    .nullable()
    .optional()
    .transform((v) => (v || "").trim() || "Unnamed Circle"),
  ig_id: z.string(),
  ig_name: z.string(),
  member_count: z.number(),
  sessions_per_month: z.number(),
  last_session_at: z.string().nullable(),
  status: z.enum(["active", "slow", "inactive"]),
});
export type CampusCircleHealthItem = z.infer<
  typeof CampusCircleHealthItemSchema
>;

export const CampusCircleHealthResponseSchema = ApiResponseSchema(
  z.object({ data: z.array(CampusCircleHealthItemSchema) }),
);

// Recent Activity
export const CampusActivityActorSchema = z.object({
  id: z.string(),
  full_name: z.string(),
  muid: z.string(),
  profile_pic: z.string().nullable(),
});

export const CampusRecentActivityItemSchema = z.object({
  id: z.string(),
  type: z.string(),
  title: z.string(),
  description: z.string(),
  created_at: z.string(),
  actor: CampusActivityActorSchema,
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export type CampusRecentActivityItem = z.infer<
  typeof CampusRecentActivityItemSchema
>;

export const CampusRecentActivityResponseSchema = ApiResponseSchema(
  z.object({ data: z.array(CampusRecentActivityItemSchema) }),
);

// Stat Cards
export const CampusStatCardSchema = z.object({
  key: z.string(),
  label: z.string(),
  value: z.number().nullable(),
  delta: z.number(),
  delta_type: z.enum(["increase", "decrease", "neutral"]),
  period: z.string(),
});
export type CampusStatCard = z.infer<typeof CampusStatCardSchema>;

// Campus Home Summary (wraps all three)
export const CampusHomeSummaryDataSchema = z.object({
  campus: z.object({
    org_id: z.string(),
    college_name: z.string(),
    campus_code: z.string(),
    campus_zone: z.string(),
  }),
  stat_cards: z.array(CampusStatCardSchema),
  member_funnel: CampusMemberFunnelDataSchema,
  circle_health: z.array(CampusCircleHealthItemSchema),
  recent_activity: z.array(CampusRecentActivityItemSchema),
});
export type CampusHomeSummaryData = z.infer<typeof CampusHomeSummaryDataSchema>;

export const CampusHomeSummaryResponseSchema = ApiResponseSchema(
  CampusHomeSummaryDataSchema,
);
