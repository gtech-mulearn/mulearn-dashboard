import { z } from "zod";
import { ApiResponseSchema } from "@/lib/schemas/api-response";

// ─── Shared pagination ────────────────────────────────────────────────────────
export const CampusPaginationSchema = z.object({
  count: z.number().optional(),
  totalPages: z.coerce.number().default(1),
  isNext: z.boolean().optional(),
  isPrev: z.boolean().optional(),
  nextPage: z.number().nullable().optional(),
});

// ─── Session status & mode enums (doc-defined) ────────────────────────────────
export const CAMPUS_SESSION_STATUSES = [
  "PENDING_APPROVAL",
  "SCHEDULED",
  "COMPLETED",
  "CANCELLED",
  "REJECTED",
] as const;
export type CampusSessionStatus = (typeof CAMPUS_SESSION_STATUSES)[number];

export const CAMPUS_SESSION_MODES = ["ONLINE", "OFFLINE", "HYBRID"] as const;
export type CampusSessionMode = (typeof CAMPUS_SESSION_MODES)[number];

// ─── #1 POST assign-mentor/ ───────────────────────────────────────────────────
// Request body: { muid: string }
// Response: generic success envelope with empty response object
export const AssignMentorResponseSchema = ApiResponseSchema(z.unknown());

// ─── #2 POST sessions/create/ ─────────────────────────────────────────────────
// Request body shape (sent to API)
export const CampusSessionCreateSchema = z.object({
  title: z.string().min(1, "Title is required").max(150, "Max 150 characters"),
  description: z.string().optional(),
  mode: z.enum(CAMPUS_SESSION_MODES),
  starts_at: z.string().min(1, "Start time is required"),
  ends_at: z.string().min(1, "End time is required"),
  meeting_link: z.string().url().optional().or(z.literal("")),
  venue: z.string().max(255).nullable().optional(),
  max_participants: z.coerce.number().int().positive().optional(),
});
export type CampusSessionCreateValues = z.infer<
  typeof CampusSessionCreateSchema
>;

// Response: envelope with session data
export const CampusSessionCreatedSchema = z.object({
  entity_id: z.string().optional(),
  session_type: z.string().optional(),
  title: z.string(),
  description: z.string().nullable().optional(),
  mode: z.string(),
  starts_at: z.string(),
  ends_at: z.string(),
  meeting_link: z.string().nullable().optional(),
  venue: z.string().nullable().optional(),
  max_participants: z.number().nullable().optional(),
});
export type CampusSessionCreated = z.infer<typeof CampusSessionCreatedSchema>;

export const CampusSessionCreateResponseSchema = ApiResponseSchema(
  CampusSessionCreatedSchema,
);

// ─── #3 GET sessions/list/ ────────────────────────────────────────────────────
// A single item in the list
export const CampusSessionItemSchema = z.object({
  id: z.string(),
  entity_id: z.string().optional(),
  entity_name: z.string().nullable().optional(),
  session_type: z.string().optional(),
  title: z.string(),
  mode: z.enum(CAMPUS_SESSION_MODES),
  starts_at: z.string(),
  ends_at: z.string(),
  status: z.string().transform((v) => v.toUpperCase() as CampusSessionStatus),
  created_by_id: z.string().nullable().optional(),
  created_by_name: z.string().nullable().optional(),
  created_at: z.string().optional(),
  max_participants: z.number().nullable().optional(),
  meeting_link: z.string().nullable().optional(),
  venue: z.string().nullable().optional(),
});
export type CampusSessionItem = z.infer<typeof CampusSessionItemSchema>;

export const CampusSessionListResponseSchema = ApiResponseSchema(
  z.object({
    data: z.array(CampusSessionItemSchema),
    pagination: CampusPaginationSchema,
  }),
);
