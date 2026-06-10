import { z } from "zod";

// ─── Mentor tiers (all four from doc) ─────────────────────────────────────────
export const MENTOR_TIERS = [
  "IG_MENTOR",
  "MENTOR",
  "COMPANY_MENTOR",
  "CAMPUS_MENTOR",
] as const;
export type MentorTier = (typeof MENTOR_TIERS)[number];

// ─── Application statuses ─────────────────────────────────────────────────────
export const MENTOR_STATUSES = ["PENDING", "APPROVED", "REJECTED"] as const;
export type MentorAdminStatus = (typeof MENTOR_STATUSES)[number];

// ─── List item schema — matches GET /list/ paginated response ─────────────────
// Doc fields: id, user_id, user_full_name, user_email, mentor_tier, status, created_at, updated_at
export const MentorApplicationListItemSchema = z.object({
  id: z.string(),
  user_id: z.string().optional(),
  user_full_name: z.string().optional().default(""),
  user_email: z.string().optional().default(""),
  // Backward compat aliases (some older endpoints may still return these)
  full_name: z.string().optional(),
  email: z.string().optional(),
  muid: z.string().optional(),
  profile_pic: z.string().nullable().optional(),
  about: z.string().nullable().optional(),
  expertise: z.string().nullable().optional(),
  reason: z.string().nullable().optional(),
  status: z.enum(MENTOR_STATUSES).optional(),
  // Backward compat: old boolean field — we keep it but it's no longer primary
  is_verified: z.boolean().optional(),
  verified_by_name: z.string().nullable().optional(),
  verified_at: z.string().nullable().optional(),
  verification_note: z.string().nullable().optional(),
  mentor_tier: z.enum(MENTOR_TIERS).nullable().optional(),
  hours: z.number().optional().default(0),
  created_at: z.string().nullable().optional(),
  updated_at: z.string().nullable().optional(),
});
export type MentorApplicationListItem = z.infer<
  typeof MentorApplicationListItemSchema
>;

export const MentorListResponseSchema = z.object({
  statusCode: z.number().optional(),
  response: z.object({
    data: z.array(MentorApplicationListItemSchema),
    pagination: z
      .object({
        count: z.number().optional(),
        totalPages: z.coerce.number().default(1),
        isNext: z.boolean().optional(),
        isPrev: z.boolean().optional(),
        nextPage: z.number().nullable().optional(),
      })
      .optional(),
  }),
});

// ─── Verify action payload — doc: { status: "APPROVED"|"REJECTED", verification_note?: "..." }
export const VerifyActionSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
  verification_note: z.string().optional(),
});
export type VerifyActionValues = z.infer<typeof VerifyActionSchema>;

// ─── Generic response ─────────────────────────────────────────────────────────
export const GenericResponseSchema = z.object({
  statusCode: z.number().optional(),
  response: z.unknown(),
});
