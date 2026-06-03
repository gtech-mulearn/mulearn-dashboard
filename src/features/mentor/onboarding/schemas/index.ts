import { z } from "zod";
import { ApiResponseSchema } from "@/lib/schemas/api-response";

// ─── Mentor application status (doc: PENDING | APPROVED | REJECTED) ──────────
export const MENTOR_STATUSES = ["PENDING", "APPROVED", "REJECTED"] as const;
export type MentorStatus = (typeof MENTOR_STATUSES)[number];

// ─── Full mentor profile object (GET /profile/ and GET /status/ response) ─────
export const MentorApplicationSchema = z.object({
  id: z.string(),
  user: z.string().optional(),
  user_full_name: z.string().optional(),
  user_email: z.string().optional(),
  about: z.string().nullable().optional(),
  expertise: z.string().nullable().optional(),
  reason: z.string().nullable().optional(),
  hours: z.number().optional().default(0),
  mentor_tier: z.string().nullable().optional(),
  status: z.enum(MENTOR_STATUSES).optional(),
  preferred_ig_ids: z.array(z.string()).optional().default([]),
  org: z.string().nullable().optional(),
  verified_by: z.string().nullable().optional(),
  verified_at: z.string().nullable().optional(),
  verification_note: z.string().nullable().optional(),
  created_by: z.string().optional(),
  updated_by: z.string().optional(),
  created_at: z.string().nullable().optional(),
  updated_at: z.string().nullable().optional(),
});
export type MentorApplication = z.infer<typeof MentorApplicationSchema>;

// ─── GET /status/ response ────────────────────────────────────────────────────
// Backend returns a single object. Status may arrive in any case; we normalise
// to uppercase so deriveOnboardingState comparisons always work.
export const MentorStatusResponseSchema = ApiResponseSchema(
  z.object({
    status: z
      .string()
      .transform((v) => v.toUpperCase() as "PENDING" | "APPROVED" | "REJECTED"),
    verification_note: z.string().nullable().optional(),
    mentor_id: z.string().nullable().optional(),
  }),
);
export type MentorStatusData = {
  status: "PENDING" | "APPROVED" | "REJECTED";
  verification_note?: string | null;
  mentor_id?: string | null;
};

// ─── GET/PATCH /profile/ and POST/PATCH /register/ response wrapper ───────────
export const MentorApplicationResponseSchema = ApiResponseSchema(
  MentorApplicationSchema,
);

// ─── Form values for POST/PATCH /register/ ───────────────────────────────────
export const OnboardingFormSchema = z.object({
  about: z.string().min(50, "About must be at least 50 characters"),
  expertise: z.string().min(3, "Expertise is required"),
  reason: z.string().min(30, "Reason must be at least 30 characters"),
  hours: z.number().min(0).optional(),
  preferred_ig_ids: z
    .array(z.string())
    .min(1, "Select at least one Interest Group"),
});
export type OnboardingFormValues = z.infer<typeof OnboardingFormSchema>;

// ─── UI state derived from status ─────────────────────────────────────────────
export type OnboardingState =
  | "loading"
  | "not_applied"
  | "pending_verification"
  | "rejected"
  | "verified";
