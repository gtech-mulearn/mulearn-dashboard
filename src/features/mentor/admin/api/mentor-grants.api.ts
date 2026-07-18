import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import type { MentorGrant } from "../schemas";
import { GenericResponseSchema, MentorGrantsResponseSchema } from "../schemas";

const OPT = { skipAuthRedirectOn403: true } as const;

// ─── §4.1 GET /mentor/<mentor_id>/grants/ ────────────────────────────────────
export async function fetchMentorGrants(
  mentorId: string,
): Promise<MentorGrant[]> {
  const res = await apiClient.get(
    endpoints.mentor.grants(mentorId),
    MentorGrantsResponseSchema,
    OPT,
  );
  return res.response;
}

// ─── §4.2 DELETE /mentor/<mentor_id>/grants/<grant_id>/ ──────────────────────
export async function revokeMentorGrant(
  mentorId: string,
  grantId: string,
): Promise<void> {
  await apiClient.delete(
    endpoints.mentor.grantRevoke(mentorId, grantId),
    undefined,
    GenericResponseSchema,
    OPT,
  );
}
