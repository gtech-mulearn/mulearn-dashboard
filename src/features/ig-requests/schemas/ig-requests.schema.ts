import { z } from "zod";
import { ApiResponseSchema } from "@/lib/schemas/api-response";

// ─── Enums ──────────────────────────────────────────────

export const IG_STATUS_OPTIONS = [
  "active",
  "requested",
  "cancelled",
  "rejected",
] as const;
export const IGStatusSchema = z.enum(IG_STATUS_OPTIONS);

export const IG_CATEGORY_OPTIONS = [
  "maker",
  "coder",
  "creative",
  "manager",
  "others",
] as const;
export const IGCategorySchema = z.enum(IG_CATEGORY_OPTIONS);

// ─── IG Request Item ────────────────────────────────────

export const IGRequestItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  code: z.string(),
  icon: z.string(),
  category: IGCategorySchema,
  status: IGStatusSchema,
  about: z.string().nullable().optional(),
  prerequisites: z.any().nullable().optional(),
  career_opportunities: z.any().nullable().optional(),
  top_blogs: z.any().nullable().optional(),
  people_to_follow: z.any().nullable().optional(),
  resource: z.string().nullable().optional(),
  leads: z.any().nullable().optional(),
  mentors: z.any().nullable().optional(),
  thinktank: z.string().nullable().optional(),
  office_hours: z.string().nullable().optional(),
  members: z.number(),
  updated_by: z.string().nullable(),
  updated_at: z.string(),
  created_by: z.string().nullable(),
  created_at: z.string(),
});

// ─── List Response ──────────────────────────────────────

export const IGRequestPaginationSchema = z.object({
  count: z.number(),
  totalPages: z.number(),
  isNext: z.boolean(),
  isPrev: z.boolean(),
  nextPage: z.number().nullable(),
});

export const IGRequestListDataSchema = z.object({
  data: z.array(IGRequestItemSchema),
  pagination: IGRequestPaginationSchema,
});
export const IGRequestListResponseSchema = ApiResponseSchema(
  IGRequestListDataSchema,
);

// ─── Create Request Form ────────────────────────────────

export const CreateIGRequestFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(75),
  code: z.string().min(1, "Code is required").max(10),
  category: IGCategorySchema,
  icon: z.string().min(1, "Icon is required").max(10),
  about: z.string().optional().or(z.literal("")),
  prerequisites: z.string().optional().or(z.literal("")),
  career_opportunities: z.string().optional().or(z.literal("")),
  resource: z.string().optional().or(z.literal("")),
  top_blogs: z.string().optional().or(z.literal("")),
  people_to_follow: z.string().optional().or(z.literal("")),
  leads: z.string().optional().or(z.literal("")),
  mentors: z.string().optional().or(z.literal("")),
  thinktank: z.string().optional().or(z.literal("")),
  office_hours: z.string().optional().or(z.literal("")),
});
export const CreateIGRequestResponseSchema = ApiResponseSchema(
  z.object({ interestGroup: IGRequestItemSchema }),
);

// ─── Update Status (Admin — used by Issue #3) ───────────

export const UpdateIGRequestStatusFormSchema = z.object({
  status: IGStatusSchema,
});
export const UpdateIGRequestStatusResponseSchema = ApiResponseSchema(
  z.object({ interestGroup: IGRequestItemSchema }),
);

// ─── Derived Types ──────────────────────────────────────

export type IGRequestItem = z.infer<typeof IGRequestItemSchema>;
export type IGRequestListResponse = z.infer<typeof IGRequestListResponseSchema>;
export type CreateIGRequestForm = z.infer<typeof CreateIGRequestFormSchema>;
export type UpdateIGRequestStatusForm = z.infer<
  typeof UpdateIGRequestStatusFormSchema
>;
export type IGStatus = z.infer<typeof IGStatusSchema>;
export type IGCategory = z.infer<typeof IGCategorySchema>;
