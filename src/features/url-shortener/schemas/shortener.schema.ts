import { z } from "zod";

const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    hasError: z.boolean(),
    statusCode: z.number(),
    message: z.record(z.string(), z.array(z.string())).optional(),
    response: dataSchema,
  });

export const ShortUrlItemSchema = z.object({
  id: z.union([z.string(), z.number()]).transform((v) => String(v)),
  title: z.string().nullable().optional().default(""),
  short_url: z.string().nullable().optional().default(""),
  long_url: z.string().nullable().optional().default(""),
  created_at: z.string().nullable().optional(),
  updated_at: z.string().nullable().optional(),
  click_count: z
    .union([z.number(), z.string(), z.null(), z.undefined()])
    .transform((v) => (v == null ? 0 : Number(v) || 0))
    .optional()
    .default(0),
});

export const PaginationSchema = z.object({
  page: z.number().optional(),
  perPage: z.number().optional(),
  total: z.number().optional(),
  totalPages: z.number().optional(),
});

export const ShortUrlListDataSchema = z.object({
  data: z.array(ShortUrlItemSchema),
  pagination: PaginationSchema,
});

export const ShortUrlListResponseSchema = ApiResponseSchema(
  ShortUrlListDataSchema,
);

export const GenericMutationResponseSchema = ApiResponseSchema(
  z.object({}).passthrough(),
);

export const ShortUrlFormSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  long_url: z.string().trim().url("Enter a valid URL"),
  short_url: z.string().trim().optional(),
});

// Analytics
const StringCountMapSchema = z.record(z.string(), z.number());

export const AnalyticsDataSchema = z.object({
  total_clicks: z.number().default(0),
  created_on: z.string().optional(),
  browsers: StringCountMapSchema.default({}),
  platforms: StringCountMapSchema.default({}),
  devices: StringCountMapSchema.default({}),
  sources: StringCountMapSchema.default({}),
  ip_address: StringCountMapSchema.default({}),
  city: StringCountMapSchema.default({}),
  region: StringCountMapSchema.default({}),
  countries: StringCountMapSchema.default({}),
  time_based_data: z
    .object({
      all_time: z.array(z.tuple([z.string(), z.number()])).default([]),
    })
    .default({ all_time: [] }),
  long_url: z.string().optional(),
  short_url: z.string().optional(),
  title: z.string().optional(),
});

export const AnalyticsResponseSchema = ApiResponseSchema(AnalyticsDataSchema);

export type ShortUrlItem = z.infer<typeof ShortUrlItemSchema>;
export type ShortUrlListData = z.infer<typeof ShortUrlListDataSchema>;
export type ShortUrlFormValues = z.infer<typeof ShortUrlFormSchema>;
export type AnalyticsData = z.infer<typeof AnalyticsDataSchema>;
