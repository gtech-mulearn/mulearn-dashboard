import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import type { OnboardingFormValues } from "../schemas";
import {
  type MentorApplication,
  type MentorStatusData,
  MentorApplicationResponseSchema,
  MentorStatusResponseSchema,
} from "../schemas";

// ─── GET /status/ ─────────────────────────────────────────────────────────────
// Returns status, verification_note, mentor_id for the authenticated user.
export async function getMentorApplicationStatus(): Promise<MentorStatusData> {
  const res = await apiClient.get(
    endpoints.mentor.status,
    MentorStatusResponseSchema,
    { skipAuthRedirectOn403: true },
  );
  return res.response;
}

// ─── POST /register/ ──────────────────────────────────────────────────────────
// Submit a new mentor application.
export async function submitMentorApplication(
  data: OnboardingFormValues,
): Promise<MentorApplication> {
  const res = await apiClient.post(
    endpoints.mentor.register,
    data,
    MentorApplicationResponseSchema,
    { skipAuthRedirectOn403: true },
  );
  return res.response;
}

// ─── PATCH /register/ ─────────────────────────────────────────────────────────
// Update a PENDING or REJECTED application (re-submits rejected ones as PENDING).
export async function updateMentorApplication(
  data: Partial<OnboardingFormValues>,
): Promise<MentorApplication> {
  const res = await apiClient.patch(
    endpoints.mentor.register,
    data,
    MentorApplicationResponseSchema,
    { skipAuthRedirectOn403: true },
  );
  return res.response;
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
  data: Partial<OnboardingFormValues>,
): Promise<MentorApplication> {
  const res = await apiClient.patch(
    endpoints.mentor.profile,
    data,
    MentorApplicationResponseSchema,
    { skipAuthRedirectOn403: true },
  );
  return res.response;
}
