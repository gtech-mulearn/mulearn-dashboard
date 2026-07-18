import { z } from "zod";
import { ApiResponseSchema } from "@/lib/schemas/api-response";

export const RoleVerificationOrganizationSchema = z.object({
  org_id: z.string().uuid(),
  org_title: z.string(),
  org_type: z.string(),
  department: z.string().nullable(),
  graduation_year: z.string().nullable(),
  verified: z.boolean(),
});

export const RoleVerificationItemSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  discord_id: z.string().nullable(),
  muid: z.string(),
  full_name: z.string(),
  verified: z.boolean(),
  role_id: z.string().uuid(),
  role_title: z.string(),
  email: z.string(),
  mobile: z.string().nullable(),
  gender: z.string().nullable().optional(),
  dob: z.string().nullable().optional(),
  joined: z.string().nullable().optional(),
  district: z.string().nullable().optional(),
  state: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
  organizations: z.array(RoleVerificationOrganizationSchema).optional(),
  interest_groups: z.array(z.any()).optional(),
  role_profile: z.record(z.string(), z.any()).nullable().optional(),
});

export type RoleVerificationOrganization = z.infer<
  typeof RoleVerificationOrganizationSchema
>;
export type RoleVerificationItem = z.infer<typeof RoleVerificationItemSchema>;

export const PaginationSchema = z.object({
  count: z.number(),
  totalPages: z.number(),
  isNext: z.boolean(),
  isPrev: z.boolean(),
  nextPage: z.number().nullable(),
});

export type Pagination = z.infer<typeof PaginationSchema>;

export const RoleVerificationListSchema = z.object({
  data: z.array(RoleVerificationItemSchema),
  pagination: PaginationSchema,
});

export type RoleVerificationList = z.infer<typeof RoleVerificationListSchema>;

export const RoleVerificationListResponseSchema = ApiResponseSchema(
  RoleVerificationListSchema,
);

export const GenericMutationResponseSchema = ApiResponseSchema(z.unknown());
