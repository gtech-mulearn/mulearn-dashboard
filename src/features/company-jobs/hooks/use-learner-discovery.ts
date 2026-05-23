"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchLearnerDiscovery } from "../api";
import type { LearnerDiscoveryParams } from "../types";

export const LEARNER_DISCOVERY_KEYS = {
  all: ["learner-discovery"] as const,
  list: (params?: LearnerDiscoveryParams) =>
    [...LEARNER_DISCOVERY_KEYS.all, "list", params ?? {}] as const,
};

export function useLearnerDiscovery(params?: LearnerDiscoveryParams) {
  return useQuery({
    queryKey: LEARNER_DISCOVERY_KEYS.list(params),
    queryFn: () => fetchLearnerDiscovery(params),
    refetchOnWindowFocus: false,
  });
}
