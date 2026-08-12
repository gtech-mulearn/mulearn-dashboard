/**
 * useProfileCompletion
 *
 * 📍 src/features/mentor/hooks/use-profile-completion.ts
 *
 * Fetches GET /mentor/profile/completion/ which returns the mentor's
 * profile fill percentage and a per-field checklist.
 *
 * Follows the exact same pattern as use-mentor-overview.ts:
 *   - staleTime: 5 min (profile fields rarely change mid-session)
 *   - no retry on 403 (non-mentor users gracefully get nothing)
 */

"use client";

import { useQuery } from "@tanstack/react-query";
import { getProfileCompletion } from "../api/mentor.api";
import { mentorKeys } from "./query-keys";

const no403Retry = (failureCount: number, error: unknown) => {
  if (
    error instanceof Error &&
    "status" in error &&
    (error as { status: number }).status === 403
  ) {
    return false;
  }
  return failureCount < 3;
};

export function useProfileCompletion(enabled = true) {
  return useQuery({
    queryKey: mentorKeys.profileCompletion(),
    queryFn: getProfileCompletion,
    enabled,
    staleTime: 1000 * 60 * 5,
    retry: no403Retry,
  });
}
