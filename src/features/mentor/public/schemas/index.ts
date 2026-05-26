import { z } from "zod";

const PaginationSchema = z.object({
  count: z.number().optional(),
  totalPages: z.coerce.number().default(1),
  isNext: z.boolean().optional(),
  isPrev: z.boolean().optional(),
  nextPage: z.number().nullable().optional(),
});

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

export const PublicMentorAvailabilitySlotSchema = z.object({
  id: z.string(),
  mentor_user_id: z.string().optional(),
  mentor_full_name: z.string().optional(),
  mentor_name: z.string().optional(),
  ig_id: z.string().nullable().optional(),
  ig_name: z.string().nullable().optional(),
  weekday: z.coerce.number(),
  start_time: z.string(),
  end_time: z.string(),
  timezone: z.string().optional().default("Asia/Kolkata"),
  is_active: z.boolean().optional().default(true),
  valid_from: z.string().nullable().optional(),
  valid_to: z.string().nullable().optional(),
  created_at: z.string().optional(),
});
export type PublicMentorAvailabilitySlot = z.infer<
  typeof PublicMentorAvailabilitySlotSchema
>;

export const PublicMentorCardSchema = z.object({
  full_name: z.string(),
  muid: z.string(),
  profile_pic: z.string().nullable().optional(),
  about: z.string().nullable().optional(),
  expertise: parseExpertise,
  mentor_tier: z.enum(["IG_MENTOR", "MENTOR"]).nullable().optional(),
  hours: z.coerce.number().optional(),
  linked_igs: z
    .array(
      z.object({
        ig_id: z.string(),
        name: z.string(),
      }),
    )
    .optional()
    .default([]),
  availability_slots: z
    .array(PublicMentorAvailabilitySlotSchema)
    .optional()
    .default([]),
  session_stats: z
    .object({
      completed_sessions: z.coerce.number().default(0),
      hours: z.coerce.number().default(0),
    })
    .optional(),
});
export type PublicMentorCard = z.infer<typeof PublicMentorCardSchema>;

export const PublicMentorSessionSchema = z.object({
  id: z.string(),
  title: z.string(),
  mode: z.string().optional(),
  ig_name: z.string().nullable().optional(),
  starts_at: z.string().nullable().optional(),
  ends_at: z.string().nullable().optional(),
  participant_count: z.coerce.number().optional(),
});
export type PublicMentorSession = z.infer<typeof PublicMentorSessionSchema>;

export const PublicMentorAvailabilityResponseDataSchema = z.object({
  mentor: z.object({
    full_name: z.string(),
    muid: z.string(),
  }),
  availability: z.array(PublicMentorAvailabilitySlotSchema),
});
export type PublicMentorAvailabilityResponse = z.infer<
  typeof PublicMentorAvailabilityResponseDataSchema
>;

export const PublicMentorCardResponseSchema = z.object({
  statusCode: z.number().optional(),
  response: PublicMentorCardSchema,
});

export const PublicMentorSessionsResponseSchema = z.object({
  statusCode: z.number().optional(),
  response: z.object({
    data: z.array(PublicMentorSessionSchema),
    pagination: PaginationSchema.optional(),
  }),
});

export const PublicMentorAvailabilityResponseSchema = z.object({
  statusCode: z.number().optional(),
  response: PublicMentorAvailabilityResponseDataSchema,
});
