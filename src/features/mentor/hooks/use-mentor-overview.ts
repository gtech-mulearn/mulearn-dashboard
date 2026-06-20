import { useQuery } from "@tanstack/react-query";
import { getMentorOverview } from "../api/mentor.api";
import type { MentorOverview } from "../types";
import { mentorKeys } from "./query-keys";

export function useMentorOverview(enabled = true) {
  return useQuery({
    queryKey: mentorKeys.overview(),
    queryFn: async () => {
      const { response } = await getMentorOverview();
      return response as MentorOverview;
    },
    enabled,
    // Useful because it contains stats that might change, but maybe not constantly
    staleTime: 1000 * 60 * 5,
  });
}

// `useMentorStatus` was removed: it fetched `GET /mentor/status/` under a separate
// `mentorKeys.status()` key, duplicating `useMentorApplicationStatus`
// (`@/features/mentor/onboarding/hooks/use-onboarding`). Use that single canonical
// hook instead so the status request is shared/deduped.
