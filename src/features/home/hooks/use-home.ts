import { useQuery } from "@tanstack/react-query";
import { fetchStudentLeaderboard } from "@/features/leaderboard/api/leaderboard.api";
import {
  fetchDashboardCalendar,
  getCampusCircleHealth,
  getCampusHomeSummary,
  getCampusMemberFunnel,
  getCampusRecentActivity,
  getCompanyHomeSummary,
  getInterestGroupsList,
  getKarmaFeed,
  getLearnerHomeSummary,
  getLearnerStreak,
  getMentorHomeSummary,
  getMentorOverview,
  getMentorSessions,
  getPublicJobsCount,
} from "../api";
import type { DashboardCalendarParams } from "../schemas";
import { homeKeys } from "./query-keys";

const HOME_STALE_TIME = 5 * 60 * 1000;

export function useInterestGroupsList() {
  return useQuery({
    queryKey: homeKeys.interestGroups(),
    queryFn: getInterestGroupsList,
    staleTime: 10 * 60 * 1000,
  });
}

export function useKarmaFeed() {
  return useQuery({
    queryKey: homeKeys.karmaFeed(),
    queryFn: getKarmaFeed,
    staleTime: HOME_STALE_TIME,
  });
}

export function useDashboardCalendar(params: DashboardCalendarParams) {
  return useQuery({
    queryKey: homeKeys.dashboardCalendar(params),
    queryFn: () => fetchDashboardCalendar(params),
    staleTime: HOME_STALE_TIME,
  });
}

export function useTopPerformers() {
  return useQuery({
    queryKey: homeKeys.topPerformers(),
    queryFn: () => fetchStudentLeaderboard(false),
    staleTime: HOME_STALE_TIME,
    select: (data) => data.slice(0, 5),
  });
}

const no403Retry = (failureCount: number, error: unknown) => {
  if (
    error instanceof Error &&
    "status" in error &&
    (error as { status: number }).status === 403
  ) {
    return false;
  }
  return failureCount < 2;
};

export function useMentorOverview(enabled = true) {
  return useQuery({
    queryKey: homeKeys.mentorOverview(),
    queryFn: getMentorOverview,
    staleTime: HOME_STALE_TIME,
    retry: no403Retry,
    enabled,
  });
}

export function useMentorSessions(status = "SCHEDULED") {
  return useQuery({
    queryKey: homeKeys.mentorSessions(status),
    queryFn: () => getMentorSessions(status),
    staleTime: 2 * 60 * 1000,
    retry: no403Retry,
  });
}

export function usePublicJobsCount() {
  return useQuery({
    queryKey: homeKeys.publicJobsCount(),
    queryFn: getPublicJobsCount,
    staleTime: 15 * 60 * 1000,
  });
}

export function useMentorHomeSummary() {
  return useQuery({
    queryKey: homeKeys.mentorHomeSummary(),
    queryFn: getMentorHomeSummary,
    staleTime: HOME_STALE_TIME,
    retry: no403Retry,
  });
}

export function useLearnerHomeSummary() {
  return useQuery({
    queryKey: homeKeys.learnerHomeSummary(),
    queryFn: getLearnerHomeSummary,
    staleTime: HOME_STALE_TIME,
  });
}

export function useCompanyHomeSummary(params?: {
  period?: string;
  karma_min?: number;
  karma_max?: number;
  level_order_min?: number;
  interested_in_work?: boolean;
  interested_in_gig_work?: boolean;
  ig_ids?: string;
}) {
  return useQuery({
    queryKey: homeKeys.companyHomeSummary(params),
    queryFn: () => getCompanyHomeSummary(params),
    staleTime: HOME_STALE_TIME,
    retry: no403Retry,
  });
}

export function useLearnerStreak() {
  return useQuery({
    queryKey: homeKeys.learnerStreak(),
    queryFn: getLearnerStreak,
    staleTime: HOME_STALE_TIME,
  });
}

export function useCampusHomeSummary() {
  return useQuery({
    queryKey: homeKeys.campusHomeSummary(),
    queryFn: getCampusHomeSummary,
    staleTime: HOME_STALE_TIME,
    retry: no403Retry,
  });
}

export function useCampusMemberFunnel() {
  return useQuery({
    queryKey: homeKeys.campusMemberFunnel(),
    queryFn: getCampusMemberFunnel,
    staleTime: HOME_STALE_TIME,
    retry: no403Retry,
  });
}

export function useCampusCircleHealth() {
  return useQuery({
    queryKey: homeKeys.campusCircleHealth(),
    queryFn: getCampusCircleHealth,
    staleTime: HOME_STALE_TIME,
    retry: no403Retry,
  });
}

export function useCampusRecentActivity() {
  return useQuery({
    queryKey: homeKeys.campusRecentActivity(),
    queryFn: () => getCampusRecentActivity(),
    staleTime: 2 * 60 * 1000,
    retry: no403Retry,
  });
}
