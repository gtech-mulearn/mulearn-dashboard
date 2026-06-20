import { useQuery } from "@tanstack/react-query";
import { getMentorOverview, getMentorStatus } from "../api/mentor.api";
import type { MentorOverview, MentorStatus } from "../types";
import { mentorKeys } from "./query-keys";

export function useMentorOverview(enabled = true) {
  return useQuery({
    queryKey: mentorKeys.overview(),
    queryFn: async () => {
      const { response } = await getMentorOverview();
      return response as MentorOverview;
    },
    enabled,
    retry: (failureCount, error: any) => {
      if (error?.status === 403) return false;
      return failureCount < 3;
    },
    // Useful because it contains stats that might change, but maybe not constantly
    staleTime: 1000 * 60 * 5,
  });
}

export function useMentorStatus(enabled = true) {
  return useQuery({
    queryKey: mentorKeys.status(),
    queryFn: async () => {
      const { response } = await getMentorStatus();
      return response as MentorStatus;
    },
    enabled,
    retry: (failureCount, error: any) => {
      if (error?.status === 403) return false;
      return failureCount < 3;
    },
    staleTime: 1000 * 60 * 5,
  });
}
