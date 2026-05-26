import { z } from "zod";

const parseExpertise = z.preprocess((val) => {
  if (typeof val === "string") {
    try {
      return JSON.parse(val);
    } catch {
      return [];
    }
  }
  return val ?? [];
}, z.array(z.string()));

export const MentorApplicationListItemSchema = z.object({
  id: z.string(),
  full_name: z.string(),
  muid: z.string().optional().default(""),
  email: z.string().optional().default(""),
  profile_pic: z.string().nullable().optional(),
  about: z.string().nullable().optional(),
  expertise: parseExpertise,
  reason: z.string().nullable().optional(),
  is_verified: z.boolean().default(false),
  verified_by_name: z.string().nullable().optional(),
  verified_at: z.string().nullable().optional(),
  verification_note: z.string().nullable().optional(),
  mentor_tier: z.string().nullable().optional(),
  hours: z.number().optional().default(0),
  created_at: z.string().nullable().optional(),
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

export const MENTOR_TIERS = ["IG_MENTOR", "MENTOR"] as const;

export const VerifyActionSchema = z.object({
  action: z.enum(["approve", "reject"]),
  note: z.string().optional(),
  mentor_tier: z.enum(MENTOR_TIERS).optional(),
});
export type VerifyActionValues = z.infer<typeof VerifyActionSchema>;

export const TierUpdateSchema = z.object({
  mentor_tier: z.enum(MENTOR_TIERS),
});
export type TierUpdateValues = z.infer<typeof TierUpdateSchema>;

export const GenericResponseSchema = z.object({
  statusCode: z.number().optional(),
  response: z.unknown(),
});
