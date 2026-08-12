/**
 * Community Partner Schemas
 *
 * 📍 src/features/manage-ig/schemas/community-partner.schema.ts
 *
 * Matches the Community Partner API documented in patch_3_8_2026.md § 5.
 */

import { z } from "zod";

// ─── Linked IG stub (embedded inside partner response) ───────────────────────
export const PartnerIgStubSchema = z.object({
  id: z.string(),
  name: z.string(),
  code: z.string().optional().nullable(),
});

export type PartnerIgStub = z.infer<typeof PartnerIgStubSchema>;

// ─── Community Partner (read shape) ──────────────────────────────────────────
export const CommunityPartnerSchema = z.object({
  id: z.string(),
  name: z.string(),
  logo_key: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  linkedin: z.string().nullable().optional(),
  github: z.string().nullable().optional(),
  website: z.string().nullable().optional(),
  instagram: z.string().nullable().optional(),
  interest_groups: z.array(PartnerIgStubSchema).optional().catch([]),
  created_at: z.string().optional().nullable(),
  updated_at: z.string().optional().nullable(),
});

export type CommunityPartner = z.infer<typeof CommunityPartnerSchema>;

// ─── Write shape (create / update) ───────────────────────────────────────────
export const CommunityPartnerWriteSchema = z.object({
  name: z.string().min(1, "Name is required"),
  logo_key: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  linkedin: z.string().optional().nullable(),
  github: z.string().optional().nullable(),
  website: z.string().min(1, "Website URL is required"),
  instagram: z.string().optional().nullable(),
  /** Array of IG ids to associate. Replaces the full link set on PATCH. */
  interest_groups: z.array(z.string()).optional(),
});

export type CommunityPartnerWrite = z.infer<typeof CommunityPartnerWriteSchema>;

// ─── API response envelopes ───────────────────────────────────────────────────

/** Single partner (create / detail) */
const BaseEnvelope = z.object({
  isSuccess: z.boolean().optional(),
  hasError: z.boolean().optional(),
  statusCode: z.number().optional(),
  message: z
    .union([z.string(), z.object({ general: z.array(z.string()) })])
    .optional()
    .nullable(),
});

export const CommunityPartnerDetailResponseSchema = BaseEnvelope.extend({
  response: CommunityPartnerSchema,
});

export type CommunityPartnerDetailResponse = z.infer<
  typeof CommunityPartnerDetailResponseSchema
>;

/** Paginated list */
export const CommunityPartnerListResponseSchema = BaseEnvelope.extend({
  response: z.object({
    data: z.array(CommunityPartnerSchema),
    pagination: z.object({
      count: z.number(),
      totalPages: z.number(),
      isNext: z.boolean(),
      isPrev: z.boolean(),
      nextPage: z.number().nullable(),
    }),
  }),
});

export type CommunityPartnerListResponse = z.infer<
  typeof CommunityPartnerListResponseSchema
>;

/** DELETE / mutation-only response */
export const CommunityPartnerMutationResponseSchema = BaseEnvelope;
