import { z } from "zod";

// ─── VENUE TYPE SCHEMA ──────────────────────────────────────────────────────

export const venueTypeSchema = z.enum(["physical", "online", "hybrid"]);

// ─── CREATE/UPDATE EVENT SCHEMA ─────────────────────────────────────────────

// Base object shape — kept separate so .partial() can be called without hitting
// the Zod restriction: ".partial() cannot be used on object schemas containing refinements"
const createEventBaseSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  description: z.string().min(1, "Description is required"),
  event_type: z
    .enum([
      "workshop",
      "webinar",
      "hackathon",
      "meetup",
      "competition",
      "social_gathering",
      "other",
    ])
    .optional(),
  scope: z.enum(["global", "campus", "ig", "campus_ig"]),
  organiser_type: z.enum([
    "global_ig",
    "campus_ig",
    "campus",
    "company",
    "admin",
  ]),
  organiser_ig_id: z
    .union([z.string().uuid(), z.literal("")])
    .optional()
    .transform((v) => (v === "" ? undefined : v)),
  organiser_campus_id: z
    .union([z.string().uuid(), z.literal("")])
    .optional()
    .transform((v) => (v === "" ? undefined : v)),
  organiser_campus_ig_id: z
    .union([z.string().uuid(), z.literal("")])
    .optional()
    .transform((v) => (v === "" ? undefined : v)),
  organiser_company_id: z
    .union([z.string().uuid(), z.literal("")])
    .optional()
    .transform((v) => (v === "" ? undefined : v)),
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
    .union([z.string(), z.literal("")])
    .optional()
    .transform((v) => (v === "" ? null : v)),
  online_link: z
    .union([z.string(), z.literal("")])
    .optional()
    .transform((v) => (v === "" ? null : v)),
  platform: z
    .union([z.string(), z.literal("")])
    .optional()
    .transform((v) => (v === "" ? null : v)),
  cover_image: z
    .union([z.string().url("Invalid URL"), z.literal("")])
    .optional()
    .transform((v) => (v === "" ? null : v)),
  banner_image: z
    .union([z.string().url("Invalid URL"), z.literal("")])
    .optional()
    .transform((v) => (v === "" ? null : v)),
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
  co_owners: z
    .array(
      z.object({
        user_id: z.string().uuid(),
        role: z.enum(["co_owner", "admin"]).optional(),
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

// Re-usable cross-field refinement logic
function applyEventRefinements<T extends typeof createEventBaseSchema>(
  schema: T,
) {
  return schema.superRefine((data, ctx) => {
    // Validate organiser_type → entity ID pairing
    if (data.organiser_type === "global_ig" && !data.organiser_ig_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["organiser_ig_id"],
        message: "Organiser IG is required for global_ig",
      });
    }
    if (data.organiser_type === "campus" && !data.organiser_campus_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["organiser_campus_id"],
        message: "Organiser campus is required for campus",
      });
    }
    if (data.organiser_type === "campus_ig" && !data.organiser_campus_ig_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["organiser_campus_ig_id"],
        message: "Organiser campus IG is required for campus_ig",
      });
    }
    if (data.organiser_type === "company" && !data.organiser_company_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["organiser_company_id"],
        message: "Organiser company is required for company",
      });
    }

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
    if (data.venue_type === "physical" && !data.address) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["address"],
        message: "Address is required for physical venues",
      });
    }
    if (data.venue_type === "physical" && !data.city) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["city"],
        message: "City is required for physical venues",
      });
    }
    if (data.venue_type === "online" && !data.online_link) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["online_link"],
        message: "Online link is required for online venues",
      });
    }
    if (data.venue_type === "online" && !data.platform) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["platform"],
        message: "Platform is required for online venues",
      });
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

export const createEventSchema = applyEventRefinements(createEventBaseSchema);

// .partial() is called on the plain base object (no superRefine), which is valid in Zod
export const updateEventSchema = createEventBaseSchema.partial();

// ─── EVENT LIST PARAMS SCHEMA ──────────────────────────────────────────────

export const eventListParamsSchema = z.object({
  page: z.number().min(1).optional(),
  perPage: z.number().min(1).max(100).optional(),
  search: z.string().optional(),
  event_type: z
    .enum([
      "workshop",
      "webinar",
      "hackathon",
      "meetup",
      "competition",
      "social_gathering",
      "other",
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
  cluster: z.enum(["coder", "maker", "manager", "creative"]).optional(),
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

// ─── TYPE EXPORTS ──────────────────────────────────────────────────────────

export type CreateEventSchema = z.infer<typeof createEventSchema>;
export type UpdateEventSchema = z.infer<typeof updateEventSchema>;
export type EventListParamsSchema = z.infer<typeof eventListParamsSchema>;
