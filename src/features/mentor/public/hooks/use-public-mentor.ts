"use client";

import { useQuery } from "@tanstack/react-query";
import { mentorKeys } from "@/features/mentor/hooks/query-keys";
import {
  fetchPublicMentorAvailability,
  fetchPublicMentorProfile,
} from "../api/public-mentor.api";

// ─── #7 GET /public/profile/<mentor_id>/ ─────────────────────────────────────
// Renamed: was usePublicMentorCard (used muid), now uses mentor UUID
export function usePublicMentorProfile(mentorId: string | null | undefined) {
  return useQuery({
    queryKey: mentorKeys.public.profile(mentorId ?? ""),
    queryFn: () => fetchPublicMentorProfile(mentorId as string),
    enabled: !!mentorId,
  });
}

// Backward compat alias — components that used usePublicMentorCard still work
export const usePublicMentorCard = usePublicMentorProfile;

// ─── #8 GET /public/availability/<mentor_id>/ ────────────────────────────────
// Doc: single path param, no igId — cleaned up signature
export function usePublicMentorAvailability(
  mentorId: string | null | undefined,
) {
  return useQuery({
    queryKey: mentorKeys.public.availability(mentorId ?? ""),
    queryFn: () => fetchPublicMentorAvailability(mentorId as string),
    enabled: !!mentorId,
  });
}

// ─── Removed: usePublicMentorSessions — not in doc, no backend endpoint ──────
// Kept as stub to prevent broken imports in pages that still reference it
export function usePublicMentorSessions(
  _mentorId: string | null | undefined,
  _params?: Record<string, unknown>,
) {
  return useQuery({
    queryKey: ["public-mentor-sessions-stub"],
    queryFn: async () => ({ data: [] as unknown[], totalPages: 1 }),
    enabled: false,
  });
}
