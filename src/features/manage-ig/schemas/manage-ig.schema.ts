import { z } from "zod";

export const InterestGroupSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "Name is required"),
  resource: z.string().nullable().optional(),
  about: z.string().nullable().optional(),
  prerequisites: z
    .union([z.array(z.string()), z.string()])
    .nullable()
    .optional(),
  career_opportunities: z
    .union([z.array(z.string()), z.string()])
    .nullable()
    .optional(),
  top_blogs: z
    .union([
      z.array(z.object({ title: z.string(), url: z.string() })),
      z.array(z.string()),
      z.string(),
    ])
    .nullable()
    .optional(),
  people_to_follow: z
    .union([
      z.array(
        z.object({
          name: z.string(),
          twitter: z.string().optional().nullable(),
          designation: z.string().optional().nullable(),
        }),
      ),
      z.array(z.string()),
      z.string(),
    ])
    .nullable()
    .optional(),
  leads: z
    .union([
      z.array(
        z.object({
          name: z.string().optional().nullable(),
          email: z.string().optional().nullable(),
          muid: z.string().optional().nullable(),
        }),
      ),
      z.array(z.string()),
      z.string(),
    ])
    .nullable()
    .optional(),
  mentors: z
    .union([
      z.array(
        z.object({
          name: z.string().optional().nullable(),
          expertise: z.string().optional().nullable(),
          linkedin: z.string().optional().nullable(),
          muid: z.string().optional().nullable(),
        }),
      ),
      z.array(z.string()),
      z.string(),
    ])
    .nullable()
    .optional(),
  thinktank: z.string().nullable().optional(),
  office_hours: z.string().nullable().optional(),
  icon: z.string().min(1, "Icon is required"),
  code: z.string().min(1, "Code is required"),
  category: z.enum([
    "maker",
    "coder",
    "creative",
    "manager",
    "others",
    "hardware",
  ]),
  status: z.enum(["active", "requested", "cancelled", "rejected"]),
  members: z.number().optional().default(0),
  updated_by: z.string().optional(),
  updated_at: z.string().optional(),
  created_by: z.string().optional(),
  created_at: z.string().optional(),
});

export const InterestGroupCreateSchema = InterestGroupSchema.omit({
  id: true,
  members: true,
  updated_by: true,
  updated_at: true,
  created_by: true,
  created_at: true,
  status: true,
});

export const InterestGroupUpdateSchema = InterestGroupCreateSchema.partial();

export const InterestGroupRequestSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  user_full_name: z.string(),
  ig_name: z.string(),
  status: z.enum(["active", "requested", "cancelled", "rejected"]),
  created_at: z.string(),
  updated_at: z.string(),
});

export type InterestGroup = z.infer<typeof InterestGroupSchema>;
export type InterestGroupCreate = z.infer<typeof InterestGroupCreateSchema>;
export type InterestGroupUpdate = z.infer<typeof InterestGroupUpdateSchema>;
export type InterestGroupRequest = z.infer<typeof InterestGroupRequestSchema>;

export const InterestGroupListResponseSchema = z.object({
  hasError: z.boolean(),
  statusCode: z.number(),
  message: z.object({
    general: z.array(z.string()),
  }),
  response: z.object({
    data: z.array(InterestGroupSchema),
    pagination: z.object({
      count: z.number(),
      totalPages: z.number(),
      isNext: z.boolean(),
      isPrev: z.boolean(),
      nextPage: z.number().nullable(),
    }),
  }),
});

export type InterestGroupListResponse = z.infer<
  typeof InterestGroupListResponseSchema
>["response"];

export const InterestGroupRequestListResponseSchema = z.object({
  hasError: z.boolean(),
  statusCode: z.number(),
  message: z.object({
    general: z.array(z.string()),
  }),
  response: z.object({
    data: z.array(z.union([InterestGroupRequestSchema, InterestGroupSchema])),
    pagination: z.object({
      count: z.number(),
      totalPages: z.number(),
      isNext: z.boolean(),
      isPrev: z.boolean(),
      nextPage: z.number().nullable(),
    }),
  }),
});

export type InterestGroupRequestListResponse = z.infer<
  typeof InterestGroupRequestListResponseSchema
>["response"];
