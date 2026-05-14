import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import {
  CalendarEventsResponseSchema,
  InterestGroupsListResponseSchema,
  KarmaFeedResponseSchema,
  MentorMenteesResponseSchema,
  MentorOverviewResponseSchema,
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
  );
  return response.response;
}

// ============================================
// Mentor Sessions
// ============================================

export async function getMentorSessions(status = "SCHEDULED") {
  const url = `${endpoints.mentor.sessions}?status=${status}`;
  const response = await apiClient.get(url, MentorSessionsResponseSchema);
  return response.response.data;
}

// ============================================
// Mentor Mentees
// ============================================

export async function getMentorMentees() {
  const response = await apiClient.get(
    endpoints.mentor.mentees,
    MentorMenteesResponseSchema,
  );
  return response.response.data;
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
