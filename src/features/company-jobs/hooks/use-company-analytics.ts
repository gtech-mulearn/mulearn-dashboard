"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchAdminSummary,
  fetchCompanyDashboardSummary,
  fetchGigAnalytics,
  fetchJobEngagementAnalytics,
  fetchTalentPoolAnalytics,
  trackJobView,
} from "../api";
import type { TalentPoolAnalyticsParams } from "../types";

export const COMPANY_ANALYTICS_KEYS = {
  all: ["company-analytics"] as const,
  gigs: () => [...COMPANY_ANALYTICS_KEYS.all, "gigs"] as const,
  summary: (params?: Record<string, any>) =>
    [...COMPANY_ANALYTICS_KEYS.all, "summary", params ?? {}] as const,
  jobEngagement: (jobId: string) =>
    [...COMPANY_ANALYTICS_KEYS.all, "job-engagement", jobId] as const,
  talentPool: (params?: TalentPoolAnalyticsParams) =>
    [...COMPANY_ANALYTICS_KEYS.all, "talent-pool", params ?? {}] as const,
  adminSummary: () => [...COMPANY_ANALYTICS_KEYS.all, "admin-summary"] as const,
};

export function useGigAnalytics() {
  return useQuery({
    queryKey: COMPANY_ANALYTICS_KEYS.gigs(),
    queryFn: fetchGigAnalytics,
    refetchOnWindowFocus: false,
  });
}

export function useCompanyDashboardSummary(params?: {
  period?: string;
  karma_min?: number;
  karma_max?: number;
  level_order_min?: number;
  interested_in_work?: boolean;
  interested_in_gig_work?: boolean;
  ig_ids?: string;
}) {
  return useQuery({
    queryKey: COMPANY_ANALYTICS_KEYS.summary(params),
    queryFn: () => fetchCompanyDashboardSummary(params),
    refetchOnWindowFocus: false,
  });
}

export function useTrackJobView() {
  return useMutation({
    mutationFn: (jobId: string) => trackJobView(jobId),
  });
}

export function useJobEngagementAnalytics(jobId: string) {
  return useQuery({
    queryKey: COMPANY_ANALYTICS_KEYS.jobEngagement(jobId),
    queryFn: () => fetchJobEngagementAnalytics(jobId),
    enabled: !!jobId,
    refetchOnWindowFocus: false,
  });
}

export function useTalentPoolAnalytics(params?: TalentPoolAnalyticsParams) {
  return useQuery({
    queryKey: COMPANY_ANALYTICS_KEYS.talentPool(params),
    queryFn: () => fetchTalentPoolAnalytics(params),
    refetchOnWindowFocus: false,
  });
}

export function useAdminSummary() {
  return useQuery({
    queryKey: COMPANY_ANALYTICS_KEYS.adminSummary(),
    queryFn: fetchAdminSummary,
    refetchOnWindowFocus: false,
  });
}
