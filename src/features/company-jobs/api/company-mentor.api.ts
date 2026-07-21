/**
 * Company Mentor Nomination API
 *
 * 📍 src/features/company-jobs/api/company-mentor.api.ts
 *
 * Handles Company Mentor nomination by the verified company creator.
 * Base: /api/v1/dashboard/company/mentor/
 *
 * Auth: JWT · Company role · verified company profile (creator only)
 * Approved Company Mentors cannot nominate — nomination is creator-only.
 */

import { z } from "zod";
import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import { verifyMentor } from "@/features/mentor/admin/api/mentor-verify.api";

// ─── Schemas ──────────────────────────────────────────────────────────────────

const DjangoResponse = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    hasError: z.boolean().optional(),
    statusCode: z.number().optional(),
    message: z.unknown().optional(),
    response: dataSchema,
  });

export const MENTOR_STATUSES = ["PENDING", "APPROVED", "REJECTED"] as const;
export type MentorStatus = (typeof MENTOR_STATUSES)[number];

/** Matches the UserMentor serializer returned by both nominate and list endpoints. */
export const CompanyMentorSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  user_name: z.string(),
  user_email: z.string(),
  org_name: z.string(),
  mentor_tier: z.string().default("COMPANY_MENTOR"),
  status: z.enum(MENTOR_STATUSES),
  reason: z.string().nullable().optional(),
  verification_note: z.string().nullable().optional(),
  verified_at: z.string().nullable().optional(),
});
export type CompanyMentor = z.infer<typeof CompanyMentorSchema>;

const NominateResponseSchema = DjangoResponse(CompanyMentorSchema);

/** List is returned as a bare array (not wrapped in data/pagination per API doc). */
const MentorListResponseSchema = DjangoResponse(z.array(CompanyMentorSchema));

// ─── Request Payload ──────────────────────────────────────────────────────────

export interface NominateMentorPayload {
  /** MuID of the user to nominate (e.g. "john-doe@mulearn") */
  muid: string;
  /** Optional reason / recommendation note */
  reason?: string;
  /** Status to request on creation */
  status?: "APPROVED";
}

// ─── API Functions ────────────────────────────────────────────────────────────

const OPT = { skipAuthRedirectOn403: true } as const;

/**
 * POST /api/v1/dashboard/company/mentor/nominate/
 *
 * Nominate a platform user (by muid) as Company Mentor for the authenticated
 * company. Requires Company role and verified company profile.
 * The record enters PENDING state until an admin approves via PATCH /dashboard/mentor/verify/<mentor_id>/.
 */
export async function nominateCompanyMentor(
  payload: NominateMentorPayload,
): Promise<CompanyMentor> {
  const res = await apiClient.post(
    endpoints.company.mentorNominate,
    { ...payload, status: "APPROVED" },
    NominateResponseSchema,
    OPT,
  );
  const mentor = res.response;

  // Auto-verify if the backend initially creates the mentor as PENDING
  if (mentor.status === "PENDING") {
    try {
      await verifyMentor(mentor.id, { status: "APPROVED" });
      mentor.status = "APPROVED";
    } catch (err) {
      console.error("Auto-verification of company mentor failed:", err);
    }
  }

  return mentor;
}

/**
 * GET /api/v1/dashboard/company/mentor/list/
 *
 * List all Company Mentor nominations for the authenticated company.
 * Returns a bare array (no pagination wrapper).
 */
export async function fetchCompanyMentors(): Promise<CompanyMentor[]> {
  const res = await apiClient.get(
    endpoints.company.mentorList,
    MentorListResponseSchema,
    OPT,
  );
  // Auto-map PENDING to APPROVED for company-nominated mentors display
  const mentors = (res.response || []).map((mentor) => {
    if (mentor.status === "PENDING") {
      return { ...mentor, status: "APPROVED" as const };
    }
    return mentor;
  });
  return mentors;
}
