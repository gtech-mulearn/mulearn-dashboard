import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import type { AssignMentorsPayload } from "../schemas";
import { AssignMentorsResponseSchema, GenericResponseSchema } from "../schemas";

// ─── §5.1 POST /mentor/admin/assign/ ─────────────────────────────────────────
// Assignments are immediate (no pending stage), additive, and idempotent.
export async function assignMentors(
  payload: AssignMentorsPayload,
): Promise<string[]> {
  const body: Record<string, unknown> = {
    user_muids: payload.user_muids,
    mentor_tier: payload.mentor_tier,
  };
  if (payload.org_id) body.org_id = payload.org_id;
  if (payload.ig_ids?.length) body.ig_ids = payload.ig_ids;
  if (payload.about) body.about = payload.about;
  if (payload.expertise) body.expertise = payload.expertise;
  if (payload.hours !== undefined) body.hours = payload.hours;

  const res = await apiClient.post(
    endpoints.mentor.adminAssign,
    body,
    AssignMentorsResponseSchema,
  );
  return res.response.assigned_user_muids;
}

// ─── §5.2 DELETE /mentor/admin/assign/<muid>/ ────────────────────────────────
// Omitting mentorTier revokes ALL of the user's approved tiers.
export async function revokeMentorAssignment(
  muid: string,
  mentorTier?: string,
): Promise<void> {
  const url = mentorTier
    ? `${endpoints.mentor.adminRevoke(muid)}?mentor_tier=${mentorTier}`
    : endpoints.mentor.adminRevoke(muid);
  await apiClient.delete(url, undefined, GenericResponseSchema);
}

// ─── §5.3 POST /mentor/admin/deactivate/<user_mentor_id>/ ────────────────────
// Sets is_active=False on the UserMentor profile (global kill-switch).
// Blocks session/event creation, persona switch, removes from roster.
// Does NOT touch application/grant rows — those stay APPROVED.
// reason is required (max 500 chars).
export async function deactivateMentor(
  userMentorId: string,
  reason: string,
): Promise<void> {
  await apiClient.post(
    endpoints.mentor.adminDeactivate(userMentorId),
    { reason },
    GenericResponseSchema,
  );
}

// ─── §5.4 POST /mentor/admin/reactivate/<user_mentor_id>/ ────────────────────
// Flips is_active back to True — restores all gates without re-verification.
export async function reactivateMentor(userMentorId: string): Promise<void> {
  await apiClient.post(
    endpoints.mentor.adminReactivate(userMentorId),
    {},
    GenericResponseSchema,
  );
}
