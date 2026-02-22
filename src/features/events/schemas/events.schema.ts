import { z } from "zod";

export const eventTagsSchema = z
  .object({
    topics: z.array(z.string()).optional(),
    level: z.string().optional(),
    tracks: z.array(z.string()).optional(),
    featured: z.boolean().optional(),
  })
  .passthrough();

export const createEventSchema = z.object({
  name: z.string().min(1, "Event name is required").max(200, "Name too long"),
  description: z.string().min(1, "Description is required"),
  registration_start_date: z.string().optional(),
  registration_end_date: z.string().optional(),
  event_start_date: z.string().optional(),
  event_end_date: z.string().optional(),
  event_start_time: z.string().optional().default("09:00:00"),
  event_end_time: z.string().optional().default("18:00:00"),
  user_limit: z.number().min(0).optional(),
  event_type: z.enum(["online", "offline", "hybrid"]),
  ticket_type: z.enum(["free", "paid", "karma"]),
  cover_image: z.string().url("Invalid image URL").optional().or(z.literal("")),
  location_name: z.string().optional(),
  location_address: z.string().optional(),
  ticket_value: z.number().min(0).optional(),
  link: z.string().url("Invalid URL").optional().or(z.literal("")),
  tag: eventTagsSchema.optional(),
  category: z.string().uuid("Invalid category ID").optional().or(z.literal("")),
});

export const updateEventSchema = createEventSchema.partial();

export const eventListParamsSchema = z.object({
  page: z.number().min(1).optional().default(1),
  page_size: z.number().min(1).max(100).optional().default(10),
  status: z
    .enum(["upcoming", "active", "request", "past", "draft", "completed"])
    .optional(),
  event_type: z.enum(["online", "offline", "hybrid"]).optional(),
  search: z.string().optional(),
});

export type CreateEventSchema = z.infer<typeof createEventSchema>;
export type UpdateEventSchema = z.infer<typeof updateEventSchema>;
export type EventListParamsSchema = z.infer<typeof eventListParamsSchema>;
