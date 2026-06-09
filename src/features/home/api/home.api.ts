import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import {
  CalendarEventsResponseSchema,
  CampusCircleHealthResponseSchema,
  CampusHomeSummaryResponseSchema,
  CampusMemberFunnelResponseSchema,
  CampusRecentActivityResponseSchema,
  CompanyHomeSummaryResponseSchema,
  InterestGroupsListResponseSchema,
  KarmaFeedResponseSchema,
  LearnerHomeSummaryResponseSchema,
  LearnerStreakResponseSchema,
  MentorIgRolesResponseSchema,
  MentorMenteesResponseSchema,
  MentorMyIgsResponseSchema,
  MentorOverviewResponseSchema,
  MentorPersonaSwitchResponseSchema,
  MentorSessionsResponseSchema,
  PublicJobsResponseSchema,
} from "../schemas";

// ============================================
// Interest Groups
// ============================================

export async function getInterestGroupsList() {
  const response = await apiClient.get(
    endpoints.dashboard.interestGroups,
    InterestGroupsListResponseSchema,
  );
  return response.response.interestGroup;
}

// ============================================
// Karma Feed
// ============================================

export async function getKarmaFeed() {
  const response = await apiClient.get(
    endpoints.dashboard.karmaFeed,
    KarmaFeedResponseSchema,
  );
  return response.response;
}

// ============================================
// Calendar Events
// ============================================

export async function getCalendarEvents() {
  const response = await apiClient.get(
    endpoints.dashboard.calendarEvents,
    CalendarEventsResponseSchema,
  );
  return response.response.events;
}

// ============================================
// Mentor Overview
// ============================================

export async function getMentorOverview() {
  const response = await apiClient.get(
    endpoints.mentor.overview,
    MentorOverviewResponseSchema,
    { skipAuthRedirectOn403: true },
  );
  return response.response.overview;
}

// ============================================
// Mentor Sessions
// ============================================

export async function getMentorSessions(status = "SCHEDULED") {
  const url = `${endpoints.mentor.sessions}?status=${status}`;
  const response = await apiClient.get(url, MentorSessionsResponseSchema, {
    skipAuthRedirectOn403: true,
  });
  return response.response.data;
}

// ============================================
// Mentor Mentees
// ============================================

export async function getMentorMentees() {
  const response = await apiClient.get(
    endpoints.mentor.mentees,
    MentorMenteesResponseSchema,
    { skipAuthRedirectOn403: true },
  );
  return response.response.data;
}

// ============================================
// Mentor Persona — IG Roles + Switch
// ============================================

export async function getMentorIgRoles() {
  const response = await apiClient.get(
    endpoints.mentor.personaIgRoles,
    MentorIgRolesResponseSchema,
  );
  return response.response.ig_roles;
}

export async function switchMentorPersona(roleLinkId: string) {
  const response = await apiClient.post(
    endpoints.mentor.personaSwitch,
    { active_role_link_id: roleLinkId },
    MentorPersonaSwitchResponseSchema,
  );
  return response.response;
}

// ============================================
// Public Jobs Count (for QuickActionRow)
// ============================================

export async function getPublicJobsCount(): Promise<number> {
  const response = await apiClient.get(
    endpoints.public.jobs,
    PublicJobsResponseSchema,
  );
  return response.response.pagination.totalCount;
}

// ============================================
// Learner Home Summary
// ============================================

// Learner endpoints require auth — 403 intentionally triggers global redirect
export async function getLearnerHomeSummary() {
  const response = await apiClient.get(
    endpoints.learner.homeSummary,
    LearnerHomeSummaryResponseSchema,
  );
  return response.response;
}

// ============================================
// Mentor Home Summary
// ============================================

export async function getMentorHomeSummary() {
  // Backend's home-summary endpoint is aliased to /mentor/overview/
  // and returns { overview: {...} }. Adapt to legacy MentorHomeSummaryData shape
  // so the existing dashboard cards keep working without a rewrite.
  const overview = await getMentorOverview();

  const mapSession = (s: (typeof overview.sessions.upcoming)[number]) => ({
    id: s.id,
    title: s.title,
    ig_name: s.ig_name ?? null,
    mode: s.mode ?? "",
    starts_at: s.starts_at,
    ends_at: s.ends_at,
    status: s.status,
    meeting_link: s.meeting_link ?? null,
    participants: [],
  });

  const counts = overview.sessions.counts;
  const totalMentees =
    "total_unique" in overview.mentees ? overview.mentees.total_unique : 0;

  const next = overview.sessions.upcoming[0] ?? null;

  return {
    next_session: next
      ? {
          id: next.id,
          title: next.title,
          mentee_name: "",
          mentee_muid: "",
          starts_at: next.starts_at,
          mode: next.mode ?? "",
          meeting_link: next.meeting_link ?? null,
        }
      : null,
    stat_cards: [
      {
        key: "sessions_scheduled",
        label: "Scheduled Sessions",
        value: counts.scheduled,
        delta: 0,
        delta_type: "neutral" as const,
        period: "all_time",
      },
      {
        key: "sessions_completed",
        label: "Completed Sessions",
        value: counts.completed,
        delta: 0,
        delta_type: "neutral" as const,
        period: "all_time",
      },
      {
        key: "pending_approvals",
        label: "Pending Approvals",
        value: overview.task_requests.pending,
        delta: 0,
        delta_type: "neutral" as const,
        period: "all_time",
      },
      {
        key: "total_mentees",
        label: "Unique Mentees",
        value: totalMentees,
        delta: 0,
        delta_type: "neutral" as const,
        period: "all_time",
      },
    ],
    upcoming_sessions: overview.sessions.upcoming.map(mapSession),
    session_requests: overview.sessions.pending_global.map(mapSession),
    mentee_progress: [],
    expertise_tags: [],
  };
}

// ============================================
// Company Home Summary
// ============================================

export async function getCompanyHomeSummary(params?: {
  period?: string;
  karma_min?: number;
  karma_max?: number;
  level_order_min?: number;
  interested_in_work?: boolean;
  interested_in_gig_work?: boolean;
  ig_ids?: string;
}) {
  const query = new URLSearchParams();
  if (params?.period) query.set("period", params.period);
  if (params?.karma_min !== undefined)
    query.set("karma_min", String(params.karma_min));
  if (params?.karma_max !== undefined)
    query.set("karma_max", String(params.karma_max));
  if (params?.level_order_min !== undefined)
    query.set("level_order_min", String(params.level_order_min));
  if (params?.interested_in_work !== undefined)
    query.set("interested_in_work", String(params.interested_in_work));
  if (params?.interested_in_gig_work !== undefined)
    query.set("interested_in_gig_work", String(params.interested_in_gig_work));
  if (params?.ig_ids) query.set("ig_ids", params.ig_ids);

  const queryString = query.toString();
  const url = queryString
    ? `${endpoints.company.homeSummary}?${queryString}`
    : endpoints.company.homeSummary;

  const response = await apiClient.get(url, CompanyHomeSummaryResponseSchema, {
    skipAuthRedirectOn403: true,
  });
  return response.response;
}

// Learner endpoints require auth — 403 intentionally triggers global redirect
export async function getLearnerStreak() {
  const response = await apiClient.get(
    endpoints.learner.streak,
    LearnerStreakResponseSchema,
  );
  return response.response;
}

// ============================================
// Campus Dashboard
// ============================================

export async function getCampusHomeSummary() {
  const response = await apiClient.get(
    endpoints.campusDashboard.homeSummary,
    CampusHomeSummaryResponseSchema,
    { skipAuthRedirectOn403: true },
  );
  return response.response;
}

export async function getCampusMemberFunnel() {
  const response = await apiClient.get(
    endpoints.campusDashboard.memberFunnel,
    CampusMemberFunnelResponseSchema,
    { skipAuthRedirectOn403: true },
  );
  return response.response;
}

export async function getCampusCircleHealth() {
  const response = await apiClient.get(
    endpoints.campusDashboard.circleHealth,
    CampusCircleHealthResponseSchema,
    { skipAuthRedirectOn403: true },
  );
  return response.response.data;
}

export async function getCampusRecentActivity(limit = 10) {
  const url = `${endpoints.campusDashboard.recentActivity}?limit=${limit}`;
  const response = await apiClient.get(
    url,
    CampusRecentActivityResponseSchema,
    { skipAuthRedirectOn403: true },
  );
  return response.response.data;
}

// ============================================
// Session Accept / Decline (Mentor Home)
// ============================================

export async function acceptSessionRequest(
  sessionId: string,
  userId: string,
): Promise<void> {
  await apiClient.post(
    endpoints.mentor.sessionParticipants(sessionId),
    { user: userId, participant_role: "MENTOR", attendance_status: "INVITED" },
    undefined,
    { skipAuthRedirectOn403: true },
  );
}

export async function declineSessionRequest(
  sessionId: string,
  userId: string,
): Promise<void> {
  await apiClient.delete(
    endpoints.mentor.sessionParticipant(sessionId, userId, "MENTOR"),
    undefined,
    undefined,
    { skipAuthRedirectOn403: true },
  );
}

// ============================================
// My IGs (Mentor)
// ============================================

export async function getMentorMyIgs() {
  const res = await apiClient.get(
    endpoints.mentor.myIgs,
    MentorMyIgsResponseSchema,
    { skipAuthRedirectOn403: true },
  );
  return res.response.igs;
}
