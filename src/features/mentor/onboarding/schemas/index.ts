import { z } from "zod";
import { ApiResponseSchema } from "@/lib/schemas/api-response";
import { MentorHoursSchema } from "../../lib/hours";
import {
  aggregateMentorStatus,
  pickPrimaryApplication,
} from "../lib/mentor-status";

// ─── Mentor application status (doc: PENDING | APPROVED | REJECTED) ──────────
export const MENTOR_STATUSES = ["PENDING", "APPROVED", "REJECTED"] as const;
export type MentorStatus = (typeof MENTOR_STATUSES)[number];

// ─── Full mentor profile object (GET /profile/ and GET /status/ response) ─────
export const MentorApplicationSchema = z.object({
  id: z.string(),
  // Session ratings (MentorDetailSerializer): weighted average and count.
  avg_rating: z.number().nullable().optional(),
  rating_count: z.number().optional(),
  user: z.string().optional(),
  user_full_name: z.string().optional(),
  user_email: z.string().optional(),
  about: z.string().nullable().optional(),
  expertise: z.string().nullable().optional(),
  reason: z.string().nullable().optional(),
  // A weekly-hours range ("2-5"); null when the mentor never picked one.
  hours: z.string().nullable().optional(),
  mentor_tier: z.string().nullable().optional(),
  status: z.enum([...MENTOR_STATUSES, "GRANT_REVOKED"]).optional(),
  preferred_ig_ids: z.array(z.string()).optional().default([]),
  org: z.string().nullable().optional(),
  company: z.string().nullable().optional(),
  linkedin: z.string().nullable().optional(),
  linkedin_url: z.string().nullable().optional(),
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
// Every application the user holds, newest first (release 1.91). Aggregated so
// an approved mentor stays verified while a newer request is pending; see
// ../lib/mentor-status. z.unknown() keeps legacy shapes from failing.
export type {
  MentorApplicationStatus,
  MentorApplicationSummary,
  MentorStatusData,
} from "../lib/mentor-status";

export const MentorStatusResponseSchema = ApiResponseSchema(
  z.unknown().transform(aggregateMentorStatus),
);

// ─── GET/PATCH /profile/ and POST/PATCH /register/ response wrapper ───────────
export const MentorApplicationResponseSchema = ApiResponseSchema(
  z.preprocess((val: unknown) => {
    if (
      val &&
      typeof val === "object" &&
      "applications" in val &&
      Array.isArray((val as Record<string, unknown>).applications) &&
      (val as Record<string, unknown[]>).applications.length > 0
    ) {
      const v = val as Record<string, unknown>;
      const apps = v.applications as Array<
        Record<string, unknown> & {
          status?: string | null;
          updated_at?: string | null;
          created_at?: string | null;
        }
      >;
      // `applications` has no guaranteed order: pick the approved (else the
      // most recently updated) application rather than the array's last item.
      const app = pickPrimaryApplication(apps) ?? apps[0];
      return {
        ...v,
        ...app,
        id: app.id, // Ensure the application ID overrides the profile ID
      };
    }
    return val;
  }, MentorApplicationSchema),
);

// ─── Form values for POST/PATCH /register/ ───────────────────────────────────
// `expertise` is collected as chips (an array) in the UI; it is joined to a
// comma-separated string at the API boundary (see MentorProfileWrite).
export const OnboardingFormSchema = z.object({
  mentor_tier: z.string().optional(),
  // `company` is the human-readable display name shown in the form.
  company: z.string().optional(),
  // `org` is the UUID sent to the API as `"org": "<uuid>"`. Optional because
  // pending-review (custom) organisations don't have a UUID yet.
  org: z.string().optional(),
  about: z.string().trim().min(50, "About must be at least 50 characters"),
  expertise: z
    .array(z.string())
    .min(3, "Please add at least three areas of expertise"),
  linkedin_url: z
    .string()
    .optional()
    .refine(
      (val) =>
        !val ||
        val === "" ||
        /^https:\/\/(www\.)?linkedin\.com\/(in|pub|company)\/[a-zA-Z0-9_-]+\/?/.test(
          val,
        ),
      {
        message:
          "Enter a valid LinkedIn URL (e.g. https://www.linkedin.com/in/username)",
      },
    ),
  reason: z.string().trim().min(30, "Reason must be at least 30 characters"),
  hours: MentorHoursSchema.optional(),
  preferred_ig_ids: z
    .array(z.string())
    .min(1, "Select at least one Interest Group"),
});
export type OnboardingFormValues = z.infer<typeof OnboardingFormSchema>;

// ─── Wire payload for register/profile endpoints ──────────────────────────────
// Derived from the form type, but with `expertise` as the comma-joined string
// the backend stores (the forms collect it as chips and join before sending).
// `company` is stripped — the API only understands `org` (the UUID).
// `linkedin_url` is mapped to `linkedin` to match the API expectation.
export type MentorProfileWrite = Omit<
  OnboardingFormValues,
  "expertise" | "company" | "linkedin_url"
> & {
  expertise: string;
  linkedin?: string;
};

// ─── UI state derived from status ─────────────────────────────────────────────
export type OnboardingState =
  | "loading"
  | "not_applied"
  | "pending_verification"
  | "rejected"
  | "verified";
