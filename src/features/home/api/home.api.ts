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
  // New API returns response directly (scopes + metrics)
  return response.response;
}

// ============================================
// Mentor Sessions
// ============================================

export async function getMentorSessions(status = "SCHEDULED") {
  const url = `${endpoints.mentor.sessionList}?status=${status}`;
  const response = await apiClient.get(url, MentorSessionsResponseSchema, {
    skipAuthRedirectOn403: true,
  });
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
  // /mentor/overview/ no longer returns sessions/task_requests.
  // Return safe empty defaults; individual sub-queries (sessions) are fetched separately.
  return {
    next_session: null,
    stat_cards: [] as {
      key: string;
      label: string;
      value: number;
      delta: number;
      delta_type: "positive" | "negative" | "neutral";
      period: string;
    }[],
    upcoming_sessions: [] as import("../schemas").MentorSession[],
    session_requests: [] as import("../schemas").MentorSession[],
    expertise_tags: [] as string[],
  };
}

// ============================================
// Company Home Summary
// ============================================

export async function getCompanyHomeSummary() {
  const response = await apiClient.get(
    endpoints.company.homeSummary,
    CompanyHomeSummaryResponseSchema,
    { skipAuthRedirectOn403: true },
  );
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
