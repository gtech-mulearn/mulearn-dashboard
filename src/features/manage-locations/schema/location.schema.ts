import { z } from "zod";

// ─── Envelope ────────────────────────────────────────────────────────────────

export const ApiEnvelopeSchema = <T extends z.ZodTypeAny>(schema: T) =>
  z.object({
    hasError: z.boolean(),
    statusCode: z.number(),
    message: z.any().optional(),
    response: schema,
  });

// ─── Pagination ──────────────────────────────────────────────────────────────

export const PaginationSchema = z.object({
  count: z.number(),
  totalPages: z.number(),
  isNext: z.boolean(),
  isPrev: z.boolean(),
  nextPage: z.number().nullable().optional(),
});

export const PaginatedDataSchema = <T extends z.ZodTypeAny>(schema: T) =>
  z.object({
    data: z.array(schema),
    pagination: PaginationSchema,
  });

// ─── Base Items (Paginated List) ─────────────────────────────────────────────
// Fields match paginated list API: label, value, created_at, etc.

export const LocationItemSchema = z.object({
  label: z.string(),
  value: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  created_by: z.string(),
  updated_by: z.string(),
});

export const StateItemSchema = LocationItemSchema.extend({
  country: z.string().nullable(),
});

export const ZoneItemSchema = LocationItemSchema.extend({
  country: z.string().nullable(),
  state: z.string().nullable(),
});

export const DistrictItemSchema = LocationItemSchema.extend({
  country: z.string().nullable(),
  state: z.string().nullable(),
  zone: z.string().nullable(),
});

// ─── Paginated List Schemas (GET /countries/, /states/, etc.) ────────────────

export const LocationDataSchema = ApiEnvelopeSchema(
  PaginatedDataSchema(LocationItemSchema),
);

export const StateDataSchema = ApiEnvelopeSchema(
  PaginatedDataSchema(StateItemSchema),
);

export const ZoneDataSchema = ApiEnvelopeSchema(
  PaginatedDataSchema(ZoneItemSchema),
);

export const DistrictDataSchema = ApiEnvelopeSchema(
  PaginatedDataSchema(DistrictItemSchema),
);

// ─── Dropdown Schemas ───────────────────────────────────────────

export const DropdownItemSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export const DropdownResponseSchema = ApiEnvelopeSchema(
  z.array(DropdownItemSchema),
);

export type DropdownItem = z.infer<typeof DropdownItemSchema>;

// ─── Mutation Response (POST / PATCH / DELETE) ───────────────────────────────

export const MutationResponseSchema = ApiEnvelopeSchema(z.any());

// ─── Create Inputs ───────────────────────────────────────────────────────────

export const CreateCountrySchema = z.object({
  label: z.string(),
});
export type CreateCountryInput = z.infer<typeof CreateCountrySchema>;

export const CreateStateSchema = z.object({
  label: z.string(),
  country: z.string(),
});
export type CreateStateInput = z.infer<typeof CreateStateSchema>;

export const CreateZoneSchema = z.object({
  label: z.string(),
  country: z.string(),
  state: z.string(),
});
export type CreateZoneInput = z.infer<typeof CreateZoneSchema>;

export const CreateDistrictSchema = z.object({
  label: z.string(),
  country: z.string(),
  state: z.string(),
  zone: z.string(),
});
export type CreateDistrictInput = z.infer<typeof CreateDistrictSchema>;

// ─── Update Inputs ───────────────────────────────────────────────────────────

export const UpdateCountrySchema = CreateCountrySchema.extend({
  id: z.string(),
});
export type UpdateCountryInput = z.infer<typeof UpdateCountrySchema>;

export const UpdateStateSchema = CreateStateSchema.extend({
  id: z.string(),
});
export type UpdateStateInput = z.infer<typeof UpdateStateSchema>;

export const UpdateZoneSchema = CreateZoneSchema.extend({
  id: z.string(),
});
export type UpdateZoneInput = z.infer<typeof UpdateZoneSchema>;

export const UpdateDistrictSchema = CreateDistrictSchema.extend({
  id: z.string(),
});
export type UpdateDistrictInput = z.infer<typeof UpdateDistrictSchema>;
