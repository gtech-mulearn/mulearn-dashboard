import { z } from "zod";

// ─── VENUE TYPE SCHEMA ──────────────────────────────────────────────────────

export const venueTypeSchema = z.enum(["physical", "online", "hybrid"]);

// ─── CREATE/UPDATE EVENT SCHEMA ─────────────────────────────────────────────

// Base object shape — kept separate so .partial() can be called without hitting
// the Zod restriction: ".partial() cannot be used on object schemas containing refinements"
const createEventBaseSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  description: z.string().min(1, "Description is required"),
  event_scope: z.string().min(1, "Please select a cluster"),
  category: z.string().uuid("Please select an event type"),
  event_type: z.string().optional(),
  scope: z.enum(["global", "campus", "ig", "campus_ig"]),
  start_datetime: z
    .string()
    .refine(
      (val) => val === "" || /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(val),
      "Invalid date format",
    ),
  end_datetime: z
    .string()
    .refine(
      (val) => val === "" || /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(val),
      "Invalid date format",
    ),
  venue_type: z.enum(["physical", "online", "hybrid"]),
  address: z
    .union([z.string(), z.literal("")])
    .optional()
    .transform((v) => (v === "" ? null : v)),
  city: z
    .union([z.string(), z.literal("")])
    .optional()
    .transform((v) => (v === "" ? null : v)),
  maps_url: z
    .union([z.string().url("Invalid URL"), z.literal("")])
    .optional()
    .transform((v) => (v === "" ? null : v)),
  online_link: z
    .union([z.string().url("Invalid URL"), z.literal("")])
    .optional()
    .transform((v) => (v === "" ? null : v)),
  platform: z
    .union([z.string(), z.literal("")])
    .optional()
    .transform((v) => (v === "" ? null : v)),
  cover_image: z.string().optional().nullable(),
  banner_image: z.string().optional().nullable(),
  registration_url: z
    .union([z.string().url("Invalid URL"), z.literal("")])
    .optional()
    .transform((v) => (v === "" ? null : v)),
  registration_deadline: z
    .union([
      z
        .string()
        .refine(
          (val) => val === "" || /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(val),
          "Invalid date format",
        ),
      z.literal(""),
    ])
    .nullable()
    .optional()
    .transform((v) => (v === "" ? null : v)),
  min_karma: z.number().int().min(0).nullable().optional(),
  linked_tasks: z
    .array(
      z.object({
        task_id: z.string().uuid(),
      }),
    )
    .optional(),
  is_collaboration: z.boolean().optional().default(false),
  target_campus_id: z
    .union([z.string().uuid(), z.literal("")])
    .nullable()
    .optional()
    .transform((v) => (v === "" ? null : v)),
  target_ig_id: z
    .union([z.string().uuid(), z.literal("")])
    .nullable()
    .optional()
    .transform((v) => (v === "" ? null : v)),
  target_campus_ig_id: z
    .union([z.string().uuid(), z.literal("")])
    .nullable()
    .optional()
    .transform((v) => (v === "" ? null : v)),
  tags: z.array(z.string()).optional(),
  is_featured: z.boolean().optional(),
});

function applyEventRefinements<T extends z.ZodTypeAny>(
  schema: T,
  _options?: { isUpdate?: boolean },
) {
  return schema.superRefine((val, ctx) => {
    const data = val as Partial<z.infer<typeof createEventBaseSchema>>;
    // Validate scope → target ID pairing
    if (data.scope === "campus" && !data.target_campus_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["target_campus_id"],
        message: "Target campus is required for campus scope",
      });
    }
    if (data.scope === "ig" && !data.target_ig_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["target_ig_id"],
        message: "Target IG is required for IG scope",
      });
    }
    if (data.scope === "campus_ig" && !data.target_campus_ig_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["target_campus_ig_id"],
        message: "Target campus IG is required for campus_ig scope",
      });
    }

    // Validate venue_type → required fields
    if (data.venue_type === "physical") {
      if (!data.address) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["address"],
          message: "Address is required for physical venues",
        });
      }
      if (!data.city) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["city"],
          message: "City is required for physical venues",
        });
      }
      if (!data.maps_url) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["maps_url"],
          message: "Maps URL is required for physical venues",
        });
      }
    }
    if (data.venue_type === "online") {
      if (!data.online_link) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["online_link"],
          message: "Online link is required for online venues",
        });
      }
      if (!data.platform) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["platform"],
          message: "Platform is required for online venues",
        });
      }
    }
    if (data.venue_type === "hybrid") {
      if (!data.address) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["address"],
          message: "Address is required for hybrid venues",
        });
      }
      if (!data.city) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["city"],
          message: "City is required for hybrid venues",
        });
      }
      if (!data.maps_url) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["maps_url"],
          message: "Maps URL is required for hybrid venues",
        });
      }
      if (!data.online_link) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["online_link"],
          message: "Online link is required for hybrid venues",
        });
      }
      if (!data.platform) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["platform"],
          message: "Platform is required for hybrid venues",
        });
      }
    }

    // Validate end_datetime > start_datetime
    if (data.start_datetime && data.end_datetime) {
      const start = new Date(data.start_datetime).getTime();
      const end = new Date(data.end_datetime).getTime();
      if (end <= start) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["end_datetime"],
          message: "End datetime must be after start datetime",
        });
      }
    }
  });
}

export const createEventSchema = applyEventRefinements(createEventBaseSchema, {
  isUpdate: false,
});

export const updateEventSchema = applyEventRefinements(
  createEventBaseSchema.partial(),
  { isUpdate: true },
);

// ─── EVENT LIST PARAMS SCHEMA ──────────────────────────────────────────────

export const eventListParamsSchema = z.object({
  pageIndex: z.number().min(1).optional(),
  perPage: z.number().min(1).max(100).optional(),
  search: z.string().optional(),
  event_type: z
    .enum([
      "hackathon",
      "workshop",
      "webinar",
      "seminar",
      "bootcamp",
      "meetup",
      "conference",
      "competition",
      "ideathon",
      "cultural_event",
      "sports_event",
      "community_event",
      "expo",
      "networking_event",
      "tech_talk",
      "others",
    ])
    .optional(),
  scope: z.enum(["global", "campus", "ig", "campus_ig"]).optional(),
  status: z
    .enum([
      "draft",
      "pending_campus_approval",
      "pending_approval",
      "pending_mentor_approval",
      "published",
      "ongoing",
      "completed",
      "cancelled",
    ])
    .optional(),
  ig_id: z.string().uuid().optional(),
  campus_id: z.string().uuid().optional(),
  company_id: z.string().uuid().optional(),
  campus_ig_id: z.string().uuid().optional(),
  cluster: z.string().optional(),
  is_featured: z.boolean().optional(),
  tags: z.string().optional(),
  eligible_only: z.boolean().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  sortBy: z
    .enum([
      "start_datetime",
      "-start_datetime",
      "created_at",
      "-created_at",
      "interest_count",
      "-interest_count",
    ])
    .optional(),
});

// ─── CATEGORY API RESPONSE SCHEMA ────────────────────────────────────────────

/**
 * Shape of a single item returned by the categories endpoint.
 * Matches the object inside `response[]` of the Django envelope.
 */
export const categorySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string(),
});

/**
 * Full Django-envelope shape returned by the categories endpoint.
 * The apiClient passes rawData (the envelope) directly to safeParse when a
 * schema is supplied, so this schema must cover the wrapper object.
 */
export const categoryListResponseSchema = z.object({
  hasError: z.boolean(),
  response: z.array(categorySchema),
});

// ─── EVENT TYPE / SCOPE API RESPONSE SCHEMA ──────────────────────────────────

/**
 * Validates the payload returned by the eventTypeScope endpoint.
 * This endpoint is wrapped in a Django envelope.
 */
export const eventTypeScopeSchema = z.object({
  event_type: z.array(z.string()),
  event_scope: z.array(z.string()),
});

export const eventTypeScopeResponseSchema = z.object({
  hasError: z.boolean(),
  response: eventTypeScopeSchema,
});

// ─── TYPE EXPORTS ──────────────────────────────────────────────────────────

export type CreateEventSchema = z.infer<typeof createEventSchema>;
export type UpdateEventSchema = z.infer<typeof updateEventSchema>;
export type EventListParamsSchema = z.infer<typeof eventListParamsSchema>;
export type CategoryItem = z.infer<typeof categorySchema>;
export type EventTypeScopeData = z.infer<typeof eventTypeScopeSchema>;
export type EventTypeScopeResponseData = z.infer<
  typeof eventTypeScopeResponseSchema
>;
