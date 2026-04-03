/**
 * Interest Groups Schemas
 *
 * 📍 src/features/interest-groups/schemas/interest-groups.schema.ts
 */

import { z } from "zod";
import { ApiResponseSchema } from "@/lib/schemas/api-response";

export { ApiResponseSchema };

// ============================================
// Interest Group List Item
// ============================================

export const InterestGroupSchema = z.object({
  id: z.string(),
  name: z.string(),
  code: z.string().optional(),
  icon: z.string().optional(),
  category: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  member_count: z.number().optional(),
});

export type InterestGroup = z.infer<typeof InterestGroupSchema>;

// ============================================
// Interest Groups List Response
// ============================================

// Real API shape: { response: { interestGroup: [...] } }
export const InterestGroupsListDataSchema = z.object({
  interestGroup: z.array(InterestGroupSchema),
});

export type InterestGroupsListData = z.infer<
  typeof InterestGroupsListDataSchema
>;

export const InterestGroupsListResponseSchema = ApiResponseSchema(
  InterestGroupsListDataSchema,
);

export type InterestGroupsListResponse = z.infer<
  typeof InterestGroupsListResponseSchema
>;

// ============================================
// Interest Group Detail Response
// ============================================

export const InterestGroupDetailSchema = z.object({
  id: z.string(),
  name: z.string(),
  code: z.string().optional().nullable(),
  icon: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  status: z.string().optional().nullable(),

  // The member count comes as "members" (a number), not "member_count"
  members: z.number().optional().nullable(),

  // Simple string / URL fields
  about: z.string().optional().nullable(),
  resource: z.string().optional().nullable(),
  thinktank: z.string().optional().nullable(),
  office_hours: z.string().optional().nullable(),

  // Array of strings
  prerequisites: z.array(z.string()).optional().nullable().catch(undefined),
  career_opportunities: z
    .array(z.string())
    .optional()
    .nullable()
    .catch(undefined),

  // Array of { title, url }
  top_blogs: z
    .array(
      z.object({
        title: z.string(),
        url: z.string(),
      }),
    )
    .optional()
    .nullable()
    .catch(undefined),

  // Array of { name, twitter, designation }
  people_to_follow: z
    .array(
      z.object({
        name: z.string(),
        twitter: z.string().optional().nullable(),
        designation: z.string().optional().nullable(),
      }),
    )
    .optional()
    .nullable()
    .catch(undefined),

  // Array of { name, email, muid }
  leads: z
    .array(
      z.object({
        name: z.string(),
        email: z.string().optional().nullable(),
        muid: z.string().optional().nullable(),
      }),
    )
    .optional()
    .nullable()
    .catch(undefined),

  // Array of { name, expertise, linkedin, muid }
  mentors: z
    .array(
      z.object({
        name: z.string(),
        expertise: z.string().optional().nullable(),
        linkedin: z.string().optional().nullable(),
        muid: z.string().optional().nullable(),
      }),
    )
    .optional()
    .nullable()
    .catch(undefined),

  // Audit fields
  created_at: z.string().optional().nullable(),
  updated_at: z.string().optional().nullable(),
  created_by: z.string().optional().nullable(),
  updated_by: z.string().optional().nullable(),
});

export type InterestGroupDetail = z.infer<typeof InterestGroupDetailSchema>;

// Real API shape: { response: { interestGroup: { id, name, ... } } }
export const InterestGroupDetailDataSchema = z.object({
  interestGroup: InterestGroupDetailSchema,
});

export type InterestGroupDetailData = z.infer<
  typeof InterestGroupDetailDataSchema
>;

export const InterestGroupDetailResponseSchema = ApiResponseSchema(
  InterestGroupDetailDataSchema,
);

export type InterestGroupDetailResponse = z.infer<
  typeof InterestGroupDetailResponseSchema
>;
