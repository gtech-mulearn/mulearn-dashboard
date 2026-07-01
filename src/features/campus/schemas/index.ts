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

// Campus session creation was removed (sessions are IG-scoped; campus mentors
// don't create sessions). The list schema below remains for viewing sessions.

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
