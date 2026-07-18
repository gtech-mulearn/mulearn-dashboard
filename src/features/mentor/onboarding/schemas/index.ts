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
  company: z.string().nullable().optional(),
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
// The backend response shape for this endpoint varies in practice:
//   • { status, verification_note, mentor_id }  (object)
//   • [{ status, verification_note, mentor_id }] (array with one item)
//   • null / undefined (no application yet)
// Using z.unknown() + manual transform makes the schema accept every shape
// without ever throwing a validation error.
function normaliseMentorStatus(raw: unknown): MentorStatusData {
  // Unwrap array if the backend returned [{...}]
  const item = Array.isArray(raw) ? raw[0] : raw;

  if (item && typeof item === "object") {
    const obj = item as Record<string, unknown>;
    const rawStatus =
      typeof obj.status === "string" ? obj.status.toUpperCase() : "PENDING";
    const status =
      rawStatus === "APPROVED" || rawStatus === "REJECTED"
        ? rawStatus
        : "PENDING";
    return {
      status: status as MentorStatusData["status"],
      verification_note:
        typeof obj.verification_note === "string"
          ? obj.verification_note
          : null,
      mentor_id: typeof obj.mentor_id === "string" ? obj.mentor_id : null,
      organization:
        typeof obj.organization === "string" ? obj.organization : null,
    };
  }

  // Fallback: no application / unexpected shape
  return {
    status: "PENDING",
    verification_note: null,
    mentor_id: null,
    organization: null,
  };
}

export const MentorStatusResponseSchema = ApiResponseSchema(
  z.unknown().transform(normaliseMentorStatus),
);
export type MentorStatusData = {
  status: "PENDING" | "APPROVED" | "REJECTED";
  verification_note?: string | null;
  mentor_id?: string | null;
  // Mentor's affiliated organization, shown in the mentor profile sidebar. Same
  // `GET /mentor/status/` response previously read via a separate `useMentorStatus`
  // hook; consolidated onto this canonical hook/key.
  organization?: string | null;
};

// ─── GET/PATCH /profile/ and POST/PATCH /register/ response wrapper ───────────
export const MentorApplicationResponseSchema = ApiResponseSchema(
  MentorApplicationSchema,
);

// ─── Form values for POST/PATCH /register/ ───────────────────────────────────
// `expertise` is collected as chips (an array) in the UI; it is joined to a
// comma-separated string at the API boundary (see MentorProfileWrite).
export const OnboardingFormSchema = z.object({
  about: z.string().min(50, "About must be at least 50 characters"),
  expertise: z
    .array(z.string())
    .min(3, "Please add at least three areas of expertise"),
  reason: z.string().min(30, "Reason must be at least 30 characters"),
  hours: z.number().min(0).optional(),
  preferred_ig_ids: z
    .array(z.string())
    .min(1, "Select at least one Interest Group"),
});
export type OnboardingFormValues = z.infer<typeof OnboardingFormSchema>;

// ─── Wire payload for register/profile endpoints ──────────────────────────────
// Derived from the form type, but with `expertise` as the comma-joined string
// the backend stores (the forms collect it as chips and join before sending).
// Keeping it tied to OnboardingFormValues avoids drift between form and wire.
export type MentorProfileWrite = Omit<OnboardingFormValues, "expertise"> & {
  expertise: string;
};

// ─── UI state derived from status ─────────────────────────────────────────────
export type OnboardingState =
  | "loading"
  | "not_applied"
  | "pending_verification"
  | "rejected"
  | "verified";
