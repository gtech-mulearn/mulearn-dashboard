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

// ─── §4 Mentor scope grants ───────────────────────────────────────────────────
export const GRANT_SCOPE_TYPES = [
  "MENTOR",
  "IG_MENTOR",
  "COMPANY_MENTOR",
  "CAMPUS_MENTOR",
] as const;

export const MentorGrantSchema = z
  .object({
    id: z.string(),
    scope_type: z.enum(GRANT_SCOPE_TYPES),
    scope_id: z.string().nullable(),
    is_active: z.boolean(),
    granted_by_name: z.string().nullable().optional(),
    granted_at: z.string().nullable().optional(),
    revoked_by_name: z.string().nullable().optional(),
    revoked_at: z.string().nullable().optional(),
  })
  .passthrough();
export type MentorGrant = z.infer<typeof MentorGrantSchema>;

export const MentorGrantsResponseSchema = z.object({
  statusCode: z.number().optional(),
  response: z.array(MentorGrantSchema),
});

// ─── §5.1 Bulk assign payload ─────────────────────────────────────────────────
export const AssignMentorsPayloadSchema = z
  .object({
    user_muids: z.array(z.string().min(1)).min(1, "Add at least one muid"),
    mentor_tier: z.enum(MENTOR_TIERS),
    org_id: z.string().nullable().optional(),
    ig_ids: z.array(z.string()).optional().default([]),
    about: z.string().optional(),
    expertise: z.string().optional(),
    hours: z.number().int().min(0).optional(),
  })
  .superRefine((v, ctx) => {
    if (
      (v.mentor_tier === "COMPANY_MENTOR" ||
        v.mentor_tier === "CAMPUS_MENTOR") &&
      !v.org_id
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["org_id"],
        message: `An organisation is required for ${v.mentor_tier}.`,
      });
    }
    if (v.mentor_tier === "IG_MENTOR" && (!v.ig_ids || v.ig_ids.length === 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["ig_ids"],
        message: "Select at least one Interest Group.",
      });
    }
  });
export type AssignMentorsPayload = z.infer<typeof AssignMentorsPayloadSchema>;

export const AssignMentorsResponseSchema = z.object({
  statusCode: z.number().optional(),
  response: z.object({
    assigned_user_muids: z.array(z.string()).optional().default([]),
  }),
});
