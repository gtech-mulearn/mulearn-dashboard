// Doc: all public mentor endpoints require Bearer auth (not truly "public")
// Auth is handled by apiClient (not publicApiClient)
import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import type {
  PublicMentorAvailabilitySlot,
  PublicMentorProfile,
} from "../schemas";
import {
  PublicMentorAvailabilityResponseSchema,
  PublicMentorProfileResponseSchema,
} from "../schemas";

// ─── #7 GET /public/profile/<mentor_id>/ ─────────────────────────────────────
// Param: mentor_id is the UserMentor UUID (not muid)
// Auth: Bearer token required
export async function fetchPublicMentorProfile(
  mentorId: string,
): Promise<PublicMentorProfile> {
  const res = await apiClient.get(
    endpoints.mentor.publicProfile(mentorId),
    PublicMentorProfileResponseSchema,
    { skipAuthRedirectOn403: true },
  );
  return res.response;
}

// ─── #8 GET /public/availability/<mentor_id>/ ────────────────────────────────
// Param: mentor_id is the UserMentor UUID (not muid)
// Auth: Bearer token required
// Returns: flat array of slot objects (not paginated, not wrapped in {mentor, availability})
export async function fetchPublicMentorAvailability(
  mentorId: string,
): Promise<PublicMentorAvailabilitySlot[]> {
  const res = await apiClient.get(
    endpoints.mentor.publicAvailability(mentorId),
    PublicMentorAvailabilityResponseSchema,
    { skipAuthRedirectOn403: true },
  );
  return res.response;
}

// ─── Backward compat alias ────────────────────────────────────────────────────
// Old code called fetchPublicMentorCard(muid) — now wraps the correct UUID-based call
export const fetchPublicMentorCard = fetchPublicMentorProfile;
