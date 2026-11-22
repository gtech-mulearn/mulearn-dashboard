import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import type { MentorSession } from "@/features/mentor";
import {
  CampusCircleHealthResponseSchema,
  CampusHomeSummaryResponseSchema,
  CampusMemberFunnelResponseSchema,
  CampusRecentActivityResponseSchema,
  type CompanyHomeSummaryData,
  CompanyHomeSummaryResponseSchema,
  KarmaFeedResponseSchema,
  LearnerHomeSummaryResponseSchema,
  LearnerStreakResponseSchema,
  MentorOverviewResponseSchema,
  PublicJobsResponseSchema,
} from "../schemas";

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
    upcoming_sessions: [] as MentorSession[],
    session_requests: [] as MentorSession[],
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
  if ("response" in response && response.response) {
    return response.response as CompanyHomeSummaryData;
  }
  return response as CompanyHomeSummaryData;
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
