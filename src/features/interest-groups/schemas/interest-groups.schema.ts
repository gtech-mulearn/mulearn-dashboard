/**
 * Interest Groups Schemas
 *
 * 📍 src/features/interest-groups/schemas/interest-groups.schema.ts
 */

import { z } from "zod";
import { ApiResponseSchema } from "@/lib/schemas/api-response";

export { ApiResponseSchema };

function withCacheBust(
  url: string | null | undefined,
  version: string | null | undefined,
): string | null | undefined {
  if (!url || !version) return url;
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}v=${encodeURIComponent(version)}`;
}

// ============================================
// Interest Group List Item
// ============================================

export const InterestGroupSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    code: z.string().optional(),
    icon: z.string().nullable().optional(),
    cover_image: z.string().nullable().optional(),
    icon_image: z.string().nullable().optional(),
    category: z.string().optional(),
    created_at: z.string().optional(),
    updated_at: z.string().optional(),
    member_count: z.number().optional(),
  })
  .transform((ig) => ({
    ...ig,
    cover_image: withCacheBust(ig.cover_image, ig.updated_at),
    icon_image: withCacheBust(ig.icon_image, ig.updated_at),
  }));

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

const InterestGroupDetailBaseSchema = z.object({
  id: z.string(),
  name: z.string(),
  code: z.string().optional().nullable(),
  icon: z.string().optional().nullable(),
  cover_image: z.string().optional().nullable(),
  icon_image: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  status: z.string().optional().nullable(),

  // The member count comes as "members" (a number), not "member_count"
  members: z.number().optional().nullable(),

  // Simple string / URL fields
  about: z.string().optional().nullable(),
  resource: z.string().optional().nullable(),
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

  // Socials sub-schema (shared by leads and mentors)
  // Array of lead objects from the API
  leads: z
    .array(
      z.object({
        muid: z.string().optional().nullable(),
        full_name: z.string().optional().nullable(),
        email: z.string().optional().nullable(),
        profile_pic: z.string().url().optional().nullable(),
        socials: z
          .object({
            github: z.string().optional().nullable(),
            facebook: z.string().optional().nullable(),
            instagram: z.string().optional().nullable(),
            linkedin: z.string().optional().nullable(),
            dribble: z.string().optional().nullable(),
            behance: z.string().optional().nullable(),
            stackoverflow: z.string().optional().nullable(),
            medium: z.string().optional().nullable(),
            hackerrank: z.string().optional().nullable(),
          })
          .optional()
          .nullable(),
      }),
    )
    .optional()
    .nullable()
    .catch(undefined),

  // Array of mentor objects from the API
  mentors: z
    .array(
      z.object({
        muid: z.string().optional().nullable(),
        full_name: z.string().optional().nullable(),
        profile_pic: z.string().url().optional().nullable(),
        socials: z
          .object({
            github: z.string().optional().nullable(),
            facebook: z.string().optional().nullable(),
            instagram: z.string().optional().nullable(),
            linkedin: z.string().optional().nullable(),
            dribble: z.string().optional().nullable(),
            behance: z.string().optional().nullable(),
            stackoverflow: z.string().optional().nullable(),
            medium: z.string().optional().nullable(),
            hackerrank: z.string().optional().nullable(),
          })
          .optional()
          .nullable(),
      }),
    )
    .optional()
    .nullable()
    .catch(undefined),

  // Array of think-tank member objects from the API — same shape as leads/mentors.
  thinktank: z
    .array(
      z.object({
        muid: z.string().optional().nullable(),
        full_name: z.string().optional().nullable(),
        profile_pic: z.string().url().optional().nullable(),
        socials: z
          .object({
            github: z.string().optional().nullable(),
            facebook: z.string().optional().nullable(),
            instagram: z.string().optional().nullable(),
            linkedin: z.string().optional().nullable(),
            dribble: z.string().optional().nullable(),
            behance: z.string().optional().nullable(),
            stackoverflow: z.string().optional().nullable(),
            medium: z.string().optional().nullable(),
            hackerrank: z.string().optional().nullable(),
          })
          .optional()
          .nullable(),
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

export const InterestGroupDetailSchema =
  InterestGroupDetailBaseSchema.transform((ig) => ({
    ...ig,
    cover_image: withCacheBust(ig.cover_image, ig.updated_at),
    icon_image: withCacheBust(ig.icon_image, ig.updated_at),
  }));

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
