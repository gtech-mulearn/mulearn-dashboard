import { z } from "zod";

export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z
    .object({
      hasError: z.boolean().optional(),
      statusCode: z.number().optional(),
      message: z.unknown().optional(),
      data: dataSchema.optional(),
      response: dataSchema.optional(),
      pagination: z.unknown().optional(),
    })
    .passthrough();

// ─── Pagination ──────────────────────────────────────────────────────────────

export const PaginatedDataSchema = <T extends z.ZodTypeAny>(schema: T) =>
  z.object({
    data: z.array(schema).default([]),
    pagination: z
      .object({
        count: z.number().default(0),
        totalPages: z.number().default(1),
        isNext: z.boolean().default(false),
        isPrev: z.boolean().default(false),
        nextPage: z.number().nullable().optional(),
      })
      .default({
        count: 0,
        totalPages: 1,
        isNext: false,
        isPrev: false,
      }),
  });

export const ChannelItemSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  discord_id: z.string(),
  created_by: z.string(),
  updated_by: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type ChannelData = z.infer<typeof ChannelItemSchema>;
//─── Create Inputs ───────────────────────────────────────────────────────────

export const MutationResponseSchema = z.any();
export const CreateChannelSchema = z.object({
  name: z.string(),
  discord_id: z.string(),
});

export type CreateChannelInput = z.infer<typeof CreateChannelSchema>;

// ─── Update Inputs ───────────────────────────────────────────────────────────

export const UpdateChannelSchema = CreateChannelSchema.extend({
  name: z.string(),
  discord_id: z.string(),
});

export type UpdateChannelInput = z.infer<typeof UpdateChannelSchema>;

export const ChannelListResponseSchema = ApiResponseSchema(
  PaginatedDataSchema(ChannelItemSchema),
);
