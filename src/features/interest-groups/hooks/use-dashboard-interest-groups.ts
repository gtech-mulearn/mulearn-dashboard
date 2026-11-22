"use client";

import { useQuery } from "@tanstack/react-query";
import { getDashboardInterestGroups } from "../api";
import { dashboardIgKeys } from "./query-keys";

/** The signed-in dashboard's interest-group list. It was useInterestGroupsList in the home feature. */
export function useDashboardInterestGroups() {
  return useQuery({
    queryKey: dashboardIgKeys.list(),
    queryFn: getDashboardInterestGroups,
    staleTime: 10 * 60 * 1000,
  });
}
