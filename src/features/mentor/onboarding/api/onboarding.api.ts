import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import type { MentorProfileWrite } from "../schemas";
import {
  type MentorApplication,
  MentorApplicationMutationResponseSchema,
  MentorApplicationResponseSchema,
  type MentorStatusData,
  MentorStatusResponseSchema,
} from "../schemas";

// ─── GET /status/ ─────────────────────────────────────────────────────────────
// Returns status, verification_note, mentor_id for the authenticated user.
export async function getMentorApplicationStatus(): Promise<MentorStatusData> {
  const res = await apiClient.get(
    endpoints.mentor.status,
    MentorStatusResponseSchema,
    {
      skipAuthRedirectOn403: true,
      // The backend represents an absent application as 400. The onboarding
      // hook intentionally maps that response to the "not applied" state.
      expectedErrorStatuses: [400],
    },
  );
  return res.response;
}

// ─── POST /register/ ──────────────────────────────────────────────────────────
// Submit a new mentor application.
export async function submitMentorApplication(
  data: MentorProfileWrite,
): Promise<void> {
  await apiClient.post(
    endpoints.mentor.register,
    data,
    MentorApplicationMutationResponseSchema,
    { skipAuthRedirectOn403: true },
  );
}

// ─── PATCH /register/ ─────────────────────────────────────────────────────────
// Update a PENDING or REJECTED application (re-submits rejected ones as PENDING).
export async function updateMentorApplication(
  data: Partial<MentorProfileWrite>,
): Promise<void> {
  await apiClient.patch(
    endpoints.mentor.register,
    data,
    MentorApplicationMutationResponseSchema,
    { skipAuthRedirectOn403: true },
  );
}

// ─── GET /profile/ ────────────────────────────────────────────────────────────
// Full profile — only available for APPROVED mentors.
export async function getMentorProfile(): Promise<MentorApplication> {
  const res = await apiClient.get(
    endpoints.mentor.profile,
    MentorApplicationResponseSchema,
    { skipAuthRedirectOn403: true },
  );
  return res.response;
}

// ─── PATCH /profile/ ──────────────────────────────────────────────────────────
// Update approved mentor profile.
export async function updateMentorProfile(
  data: Partial<MentorProfileWrite>,
): Promise<MentorApplication> {
  const res = await apiClient.patch(
    endpoints.mentor.profile,
    data,
    MentorApplicationResponseSchema,
    { skipAuthRedirectOn403: true },
  );
  return res.response;
}

// ── POST /change-company/ ─────────────────────────────────────────────────────
// Submit a company affiliation change request (pending admin approval).
export async function requestMentorCompanyChange(payload: {
  company_id: string;
  reason: string;
}): Promise<void> {
  await apiClient.post(
    endpoints.mentor.changeCompany,
    payload,
    MentorApplicationMutationResponseSchema,
    { skipAuthRedirectOn403: true },
  );
}
