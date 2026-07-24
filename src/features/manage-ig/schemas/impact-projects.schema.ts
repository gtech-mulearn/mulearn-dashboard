import { z } from "zod";

export const ImpactProjectTeamMemberSchema = z.object({
  muid: z.string(),
  name: z.string(),
  avatar: z.string().nullable().optional(),
  is_lead: z.boolean(),
});

export const ImpactProjectTeamMemberInputSchema = z.object({
  muid: z.string().min(1, "muid is required"),
  is_lead: z.boolean(),
});

export const ImpactProjectLinkSchema = z.object({
  label: z.string().min(1, "Label is required"),
  url: z.string().url("Must be a valid URL"),
});

export const ImpactProjectSchema = z.object({
  id: z.string().uuid(),
  ig_id: z.string(),
  title: z.string().min(1, "Title is required"),
  image: z.string().nullable().optional(),
  description: z.string().min(50, "Description must be at least 50 characters"),
  team: z.array(ImpactProjectTeamMemberSchema).default([]),
  links: z.array(ImpactProjectLinkSchema).default([]),
  created_by: z.string().optional(),
  updated_by: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export const ImpactProjectCreateSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(50, "Description must be at least 50 characters"),
  team: z.array(ImpactProjectTeamMemberInputSchema).optional(),
  links: z.array(ImpactProjectLinkSchema).optional(),
});

export const ImpactProjectUpdateSchema = z.object({
  title: z.string().min(1, "Title is required").optional(),
  description: z
    .string()
    .min(50, "Description must be at least 50 characters")
    .optional(),
  team: z.array(ImpactProjectTeamMemberInputSchema).optional(),
  links: z.array(ImpactProjectLinkSchema).optional(),
});

export type ImpactProjectTeamMember = z.infer<
  typeof ImpactProjectTeamMemberSchema
>;
export type ImpactProjectTeamMemberInput = z.infer<
  typeof ImpactProjectTeamMemberInputSchema
>;
export type ImpactProjectLink = z.infer<typeof ImpactProjectLinkSchema>;
export type ImpactProject = z.infer<typeof ImpactProjectSchema>;
export type ImpactProjectCreate = z.infer<typeof ImpactProjectCreateSchema>;
export type ImpactProjectUpdate = z.infer<typeof ImpactProjectUpdateSchema>;

const EnvelopeSchema = z.object({
  hasError: z.boolean(),
  statusCode: z.number(),
  message: z.object({
    general: z.array(z.string()),
  }),
});

export const ImpactProjectsListResponseSchema = EnvelopeSchema.extend({
  response: z.object({
    data: z.array(ImpactProjectSchema).default([]),
    pagination: z
      .object({
        count: z.number(),
        totalPages: z.number(),
        isNext: z.boolean(),
        isPrev: z.boolean(),
        nextPage: z.number().nullable(),
      })
      .optional(),
  }),
});

export const ImpactProjectResponseSchema = EnvelopeSchema.extend({
  response: z.object({
    impactProject: ImpactProjectSchema,
  }),
});

export const ImpactProjectImageResponseSchema = EnvelopeSchema.extend({
  response: z.object({
    image: z.string(),
  }),
});
