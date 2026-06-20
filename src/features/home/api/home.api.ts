import { apiClient, publicApiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import { OrgListResponseSchema } from "@/features/organizations/schemas";
import {
  fetchCampusEventCalendar,
  fetchCampusMentorSessionCalendar,
  fetchCompanyEventCalendar,
  fetchCompanySessionCalendar,
  fetchGlobalEventCalendar,
  fetchIgEventCalendar,
  fetchIgMentorSessionCalendar,
  type CalendarBuckets,
  type CalendarEventBuckets,
  type CalendarEventItem,
  type CalendarSessionItem,
} from "@/features/company-jobs/api";
import type { CalendarEvent } from "../schemas";

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

// ============================================
// Company Org ID (from Organisation table)
// ============================================

export async function getCompanyOrgId(
  companyName: string,
): Promise<string | null> {
  const url = `${endpoints.organizations.listByType("company")}?search=${encodeURIComponent(companyName)}&perPage=1&pageIndex=1`;
  const response = await apiClient.get(url, OrgListResponseSchema);
  const match = response.response.data[0];
  return match?.id ?? null;
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

// ============================================
// Global Event Calendar (/api/v1/calendar/events/)
// ============================================

const CATEGORY_TO_TYPE: Record<string, CalendarEvent["type"]> = {
  hackathon: "hackathon",
  workshop: "workshop",
  meetup: "meetup",
};

function mapEventItemToCalendarEvent(item: CalendarEventItem): CalendarEvent {
  const rawCategory = (item.category_name ?? "").toLowerCase();
  return {
    id: item.id,
    title: item.title,
    description: "",
    date: item.start,
    type: CATEGORY_TO_TYPE[rawCategory] ?? "other",
    location: item.venue_type ?? "",
    link: item.slug ? `/dashboard/events/${item.slug}` : "",
  };
}

function flattenBuckets(buckets: CalendarEventBuckets): CalendarEvent[] {
  return [...buckets.upcoming, ...buckets.ongoing, ...buckets.completed].map(
    mapEventItemToCalendarEvent,
  );
}

export async function getGlobalCalendarEvents(): Promise<CalendarEvent[]> {
  const buckets = await fetchGlobalEventCalendar();
  return flattenBuckets(buckets);
}

export async function getCompanyCalendarEvents(
  companyId: string,
): Promise<CalendarEvent[]> {
  const buckets = await fetchCompanyEventCalendar(companyId);
  return flattenBuckets(buckets);
}

export async function getCampusCalendarEvents(
  campusId: string,
): Promise<CalendarEvent[]> {
  const buckets = await fetchCampusEventCalendar(campusId);
  return flattenBuckets(buckets);
}

export async function getIgCalendarEvents(
  igId: string,
): Promise<CalendarEvent[]> {
  const buckets = await fetchIgEventCalendar(igId);
  return flattenBuckets(buckets);
}

// ============================================
// Session Calendar → CalendarEvent mapping
// ============================================

const SESSION_STATUS_TYPE: Record<string, CalendarEvent["type"]> = {
  SCHEDULED: "workshop",
  COMPLETED: "other",
  CANCELLED: "deadline",
};

function mapSessionItemToCalendarEvent(
  item: CalendarSessionItem,
): CalendarEvent {
  return {
    id: item.id,
    title: item.title,
    description: item.description ?? "",
    date: item.starts_at,
    type: SESSION_STATUS_TYPE[item.status] ?? "other",
    location: item.venue ?? item.mode ?? "",
    link: item.meeting_link ?? "",
  };
}

function flattenSessionBuckets(buckets: CalendarBuckets): CalendarEvent[] {
  return [...buckets.upcoming, ...buckets.ongoing, ...buckets.completed].map(
    mapSessionItemToCalendarEvent,
  );
}

export async function getCompanySessionCalendarEvents(
  companyOrgId: string,
): Promise<CalendarEvent[]> {
  const buckets = await fetchCompanySessionCalendar(companyOrgId);
  return flattenSessionBuckets(buckets);
}

export async function getIgMentorSessionCalendarEvents(
  igId: string,
): Promise<CalendarEvent[]> {
  const buckets = await fetchIgMentorSessionCalendar(igId);
  return flattenSessionBuckets(buckets);
}

export async function getCampusMentorSessionCalendarEvents(
  campusId: string,
): Promise<CalendarEvent[]> {
  const buckets = await fetchCampusMentorSessionCalendar(campusId);
  return flattenSessionBuckets(buckets);
}
