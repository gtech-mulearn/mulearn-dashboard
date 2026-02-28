import { z } from "zod";
import { ApiResponseSchema } from "@/lib/schemas/api-response";

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
});

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

export const GenericMutationResponseSchema = ApiResponseSchema(z.any());
