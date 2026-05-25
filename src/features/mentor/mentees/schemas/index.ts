import { z } from "zod";

// Backend returns raw queryset rows with Django ORM field paths
// (`.values("user_id", "user__full_name", ...)`).
// We re-shape into camel-clean fields via z.preprocess.
const MenteeRawSchema = z.object({
  user_id: z.string(),
  user__full_name: z.string().nullable().optional(),
  user__muid: z.string().nullable().optional(),
  user__email: z.string().nullable().optional(),
  total_sessions: z.coerce.number().default(0),
});

export const MenteeSchema = z.preprocess(
  (raw) => {
    if (!raw || typeof raw !== "object") return raw;
    const r = raw as Record<string, unknown>;
    // Allow already-flattened records to pass through unchanged
    if ("full_name" in r) return r;
    return {
      user_id: r.user_id,
      full_name: r["user__full_name"] ?? "",
      muid: r["user__muid"] ?? "",
      email: r["user__email"] ?? "",
      total_sessions: r.total_sessions ?? 0,
    };
  },
  z.object({
    user_id: z.string(),
    full_name: z.string().default(""),
    muid: z.string().default(""),
    email: z.string().default(""),
    total_sessions: z.coerce.number().default(0),
  }),
);
export type Mentee = z.infer<typeof MenteeSchema>;
export type MenteeRaw = z.infer<typeof MenteeRawSchema>;

export const MenteeListResponseSchema = z.object({
  statusCode: z.number().optional(),
  response: z.object({
    data: z.array(MenteeSchema),
    pagination: z
      .object({
        count: z.number().optional(),
        totalPages: z.coerce.number().default(1),
        isNext: z.boolean().optional(),
        isPrev: z.boolean().optional(),
        nextPage: z.number().nullable().optional(),
      })
      .optional(),
  }),
});

// Activity log — matches backend SystemActionLogSerializer
export const ActivityLogItemSchema = z.object({
  id: z.string(),
  action_type: z.string(),
  actor_name: z.string().nullable().optional(),
  subject_name: z.string().nullable().optional(),
  ig_name: z.string().nullable().optional(),
  entity_name: z.string().optional(),
  entity_id: z.string().optional(),
  old_data: z.unknown().optional(),
  new_data: z.unknown().optional(),
  remarks: z.string().nullable().optional(),
  created_at: z.string(),
});
export type ActivityLogItem = z.infer<typeof ActivityLogItemSchema>;

export const ActivityLogResponseSchema = z.object({
  statusCode: z.number().optional(),
  response: z.object({
    data: z.array(ActivityLogItemSchema),
    pagination: z
      .object({
        count: z.number().optional(),
        totalPages: z.coerce.number().default(1),
        isNext: z.boolean().optional(),
        isPrev: z.boolean().optional(),
        nextPage: z.number().nullable().optional(),
      })
      .optional(),
  }),
});
