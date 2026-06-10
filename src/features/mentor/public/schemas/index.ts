import { z } from "zod";

const PaginationSchema = z.object({
  count: z.number().optional(),
  totalPages: z.coerce.number().default(1),
  isNext: z.boolean().optional(),
  isPrev: z.boolean().optional(),
  nextPage: z.number().nullable().optional(),
});

// ─── #8 Public availability slot — GET /public/availability/<mentor_id>/ ─────
// Doc shape mirrors the private availability slot response
export const PublicMentorAvailabilitySlotSchema = z.object({
  id: z.string(),
  mentor_user_id: z.string().optional(),
  ig_id: z.string().nullable().optional(),
  ig_name: z.string().nullable().optional(),
  weekday: z.coerce.number().int().min(1).max(7), // doc: 1=Mon … 7=Sun
  start_time: z.string(),
  end_time: z.string(),
  timezone: z.string().optional().default("Asia/Kolkata"),
  is_active: z.boolean().optional().default(true),
  valid_from: z.string().nullable().optional(),
  valid_to: z.string().nullable().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});
export type PublicMentorAvailabilitySlot = z.infer<
  typeof PublicMentorAvailabilitySlotSchema
>;

// ─── #7 Public mentor profile — GET /public/profile/<mentor_id>/ ─────────────
// Doc: returns the full mentor detail object (same shape as /profile/ GET)
export const PublicMentorProfileSchema = z.object({
  id: z.string().optional(),
  user: z.string().optional(),
  user_full_name: z.string().optional(),
  user_email: z.string().optional(),
  about: z.string().nullable().optional(),
  expertise: z.string().nullable().optional(),
  reason: z.string().nullable().optional(),
  hours: z.coerce.number().optional().default(0),
  mentor_tier: z.string().nullable().optional(),
  status: z.string().optional(),
  preferred_ig_ids: z.array(z.string()).optional().default([]),
  org: z.string().nullable().optional(),
  verified_by: z.string().nullable().optional(),
  verified_at: z.string().nullable().optional(),
  verification_note: z.string().nullable().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});
export type PublicMentorProfile = z.infer<typeof PublicMentorProfileSchema>;

// ─── Response wrappers ────────────────────────────────────────────────────────

export const PublicMentorProfileResponseSchema = z.object({
  hasError: z.boolean().optional(),
  statusCode: z.number().optional(),
  message: z.unknown().optional(),
  response: PublicMentorProfileSchema,
});

export const PublicMentorAvailabilityResponseSchema = z.object({
  hasError: z.boolean().optional(),
  statusCode: z.number().optional(),
  message: z.unknown().optional(),
  response: z.array(PublicMentorAvailabilitySlotSchema),
});

// ─── Backward compat aliases (previously used by public page components) ──────
export const PublicMentorCardSchema = PublicMentorProfileSchema;
export type PublicMentorCard = PublicMentorProfile;

// Legacy: paginated session list for public page (not in doc — kept for compat)
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

export const PublicMentorSessionsResponseSchema = z.object({
  statusCode: z.number().optional(),
  response: z.object({
    data: z.array(PublicMentorSessionSchema),
    pagination: PaginationSchema.optional(),
  }),
});

// Legacy response type for existing code that destructures { mentor, availability }
export const PublicMentorAvailabilityResponseDataSchema = z.object({
  mentor: z
    .object({
      full_name: z.string().optional(),
      muid: z.string().optional(),
      user_full_name: z.string().optional(),
    })
    .optional(),
  availability: z.array(PublicMentorAvailabilitySlotSchema),
});
export type PublicMentorAvailabilityResponse = z.infer<
  typeof PublicMentorAvailabilityResponseDataSchema
>;

export const PublicMentorCardResponseSchema = PublicMentorProfileResponseSchema;
