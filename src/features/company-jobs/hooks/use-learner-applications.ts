"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchLearnerApplications } from "../api";

export const LEARNER_APPLICATIONS_KEYS = {
  all: ["learner-applications"] as const,
  list: (params?: {
    search?: string;
    sortBy?: string;
    pageIndex?: number;
    perPage?: number;
  }) => [...LEARNER_APPLICATIONS_KEYS.all, "list", params ?? {}] as const,
};

export function useLearnerApplications(params?: {
  search?: string;
  sortBy?: string;
  pageIndex?: number;
  perPage?: number;
}) {
  return useQuery({
    queryKey: LEARNER_APPLICATIONS_KEYS.list(params),
    queryFn: () => fetchLearnerApplications(params),
    refetchOnWindowFocus: false,
  });
}
