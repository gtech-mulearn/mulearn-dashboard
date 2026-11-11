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

/** Matches the UserMentor serializer returned by nominate, apply, and list endpoints. */
export const CompanyMentorSchema = z
  .object({
    id: z.string(),
    user_id: z.string().optional().nullable(),
    user_name: z.string().optional().nullable(),
    user_email: z.string().optional().nullable(),
    org_name: z.string().optional().nullable(),
    mentor_tier: z.string().optional().default("COMPANY_MENTOR"),
    status: z.string().optional().default("APPROVED"),
    reason: z.string().nullable().optional(),
    verification_note: z.string().nullable().optional(),
    verified_at: z.string().nullable().optional(),
  })
  .passthrough();
export type CompanyMentor = z.infer<typeof CompanyMentorSchema>;

const NominateResponseSchema = z.union([
  DjangoResponse(CompanyMentorSchema),
  CompanyMentorSchema,
  z.object({
    general_message: z.string().optional(),
    response: CompanyMentorSchema,
  }),
]);

/** List is returned as array or enveloped array. */
const MentorListResponseSchema = z.union([
  DjangoResponse(z.array(CompanyMentorSchema)),
  DjangoResponse(z.object({ data: z.array(CompanyMentorSchema) })),
  z.object({
    response: z.array(CompanyMentorSchema),
  }),
  z.object({
    data: z.array(CompanyMentorSchema),
  }),
  z.array(CompanyMentorSchema),
]);

export const ApplyMentorResponseSchema = z.union([
  DjangoResponse(z.object({ status: z.string() }).passthrough()),
  z.object({
    general_message: z.string().optional(),
    response: z.object({ status: z.string() }).passthrough(),
  }),
  z
    .object({
      status: z.string(),
    })
    .passthrough(),
]);

// ─── Request Payloads ─────────────────────────────────────────────────────────

export interface NominateMentorPayload {
  /** MuID of the user to nominate (e.g. "john-doe@mulearn") */
  muid: string;
  /** Optional reason / recommendation note */
  reason?: string;
}

export interface ApplyMentorPayload {
  /** Company ID to apply to */
  company_id: string;
  /** About mentor experience */
  about?: string;
  /** Area of expertise */
  expertise?: string;
  /** Motivation / Reason */
  reason?: string;
  /** Weekly available hours */
  hours?: number;
}

// ─── API Functions ────────────────────────────────────────────────────────────

const OPT = { skipAuthRedirectOn403: true } as const;

/**
 * POST /api/v1/dashboard/company/mentor/nominate/
 *
 * Nominate a platform user (by muid) as Company Mentor for the authenticated
 * company. The backend automatically approves company-nominated mentors.
 */
export async function nominateCompanyMentor(
  payload: NominateMentorPayload,
): Promise<CompanyMentor> {
  const res = await apiClient.post(
    endpoints.company.mentorNominate,
    payload,
    NominateResponseSchema,
    OPT,
  );
  if ("response" in res && res.response) {
    return res.response as CompanyMentor;
  }
  return res as CompanyMentor;
}

/**
 * POST /api/v1/dashboard/company/mentor/apply/
 *
 * User applies to be a mentor linked to a company.
 * Status starts as PENDING until company owner reviews.
 */
export async function applyAsCompanyMentor(
  payload: ApplyMentorPayload,
): Promise<{ status: string }> {
  const res = await apiClient.post(
    endpoints.company.mentorApply,
    payload,
    ApplyMentorResponseSchema,
    OPT,
  );
  if ("response" in res && res.response) {
    return res.response as { status: string };
  }
  return res as { status: string };
}

/**
 * GET /api/v1/dashboard/company/mentor/list/
 *
 * List all Company Mentor nominations for the authenticated company.
 */
export async function fetchCompanyMentors(): Promise<CompanyMentor[]> {
  const res = await apiClient.get(
    endpoints.company.mentorList,
    MentorListResponseSchema,
    OPT,
  );
  if ("response" in res && res.response) {
    if (Array.isArray(res.response)) return res.response;
    if ("data" in res.response && Array.isArray(res.response.data)) {
      return res.response.data;
    }
  }
  if ("data" in res && Array.isArray(res.data)) {
    return res.data;
  }
  if (Array.isArray(res)) {
    return res;
  }
  return [];
}
