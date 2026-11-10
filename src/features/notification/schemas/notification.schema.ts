import { z } from "zod";
import { ApiResponseSchema } from "@/lib/schemas/api-response";

export const DirectNotificationSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  button: z.string().nullable().optional(),
  url: z.string().nullable().optional(),
  created_at: z.string(),
  user: z.string(),
  created_by: z.string(),
});

export const BroadcastNotificationSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  url: z.string().nullable().optional(),
  target_type: z.enum([
    "global",
    "campus",
    "interest_group",
    "campus_ig",
    "event_interest",
  ]),
  target_id: z.string().nullable(),
  created_by: z.string(),
  created_at: z.string(),
  expires_at: z.string(),
});

export const AdminBroadcastSchema = BroadcastNotificationSchema.extend({
  target_details: z.object({ type: z.string(), name: z.string() }),
  created_by_name: z.string(),
});

export const NotificationListResponseSchema = z.object({
  direct: z.array(DirectNotificationSchema),
  broadcasts: z.array(BroadcastNotificationSchema),
});

export const AdminBroadcastListResponseSchema = z.array(AdminBroadcastSchema);

export const TARGET_TYPES = [
  "global",
  "campus",
  "interest_group",
  "campus_ig",
  "event_interest",
] as const;

export type TargetType = (typeof TARGET_TYPES)[number];

export const TARGET_TYPE_LABELS: Record<TargetType, string> = {
  global: "Everyone (All Members)",
  campus: "Campus",
  interest_group: "Interest Group",
  campus_ig: "Campus IG Chapter",
  event_interest: "Event Interest",
};

/**
 * Restricts URLs to relative paths (e.g. /dashboard) and HTTPS URLs.
 * Rejects protocol-relative URLs (//), javascript:, data:, and insecure HTTP schemes.
 */
export function isSafeRedirectUrl(url: string): boolean {
  if (!url) return false;
  if (url.startsWith("/") && !url.startsWith("//") && !url.startsWith("/\\")) {
    return true;
  }
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:";
  } catch {
    return false;
  }
}

// broadcast/create/ only accepts these 4 fields — backend auto-sets target_type=global
export const BroadcastCreateSchema = z.object({
  title: z.string().min(1, "Title required"),
  description: z.string().min(1, "Description required"),
  url: z
    .string()
    .refine(
      (val) => !val || isSafeRedirectUrl(val),
      "URL must be a relative path (e.g. /dashboard) or an HTTPS URL (https://...)",
    )
    .optional()
    .or(z.literal("")),
  expires_at: z.string().min(1, "Expiry date required"),
});

export interface TargetOption {
  id: string;
  name: string;
}

export type DirectNotification = z.infer<typeof DirectNotificationSchema>;
export type BroadcastNotification = z.infer<typeof BroadcastNotificationSchema>;
export type AdminBroadcast = z.infer<typeof AdminBroadcastSchema>;
export type NotificationListResponse = z.infer<
  typeof NotificationListResponseSchema
>;
export type BroadcastCreatePayload = z.infer<typeof BroadcastCreateSchema>;

// ─── New unified feed schemas ─────────────────────────────────────────────────

/** A single item from the unified notification feed (personal or broadcast). */
export const NotificationItemSchema = z.object({
  id: z.string(),
  type: z.string(),
  category: z.string(),
  title: z.string(),
  description: z.string(),
  entity_type: z.string().nullable(),
  entity_id: z.string().nullable(),
  is_read: z.boolean(),
  is_archived: z.boolean(),
  created_at: z.string(),
  read_at: z.string().nullable(),
  source: z.enum(["personal", "broadcast"]),
  redirect_url: z
    .string()
    .nullable()
    .refine(
      (val) => val === null || val === "" || isSafeRedirectUrl(val),
      "redirect_url must be a relative path or an HTTPS URL",
    ),
});

/** Paginated wrapper returned by GET /api/v1/notification/ */
export const NotificationFeedSchema = z.object({
  count: z.number(),
  page: z.number(),
  page_size: z.number(),
  results: z.array(NotificationItemSchema),
});

export const NotificationFeedApiResponseSchema = ApiResponseSchema(
  NotificationFeedSchema,
);

export const UnreadCountResponseSchema = z.object({
  unread_count: z.number(),
});

export const UnreadCountApiResponseSchema = ApiResponseSchema(
  UnreadCountResponseSchema,
);

export type NotificationItem = z.infer<typeof NotificationItemSchema>;
export type NotificationFeed = z.infer<typeof NotificationFeedSchema>;
export type UnreadCountResponse = z.infer<typeof UnreadCountResponseSchema>;

// ─── Admin broadcast dispatch (POST /api/v1/notification/admin/broadcast/) ────

export const AdminBroadcastDispatchSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must be 100 characters or fewer"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(300, "Description must be 300 characters or fewer"),
  redirect_url: z
    .string()
    .max(255, "URL must be 255 characters or fewer")
    .refine(
      (val) => !val || isSafeRedirectUrl(val),
      "URL must be a relative path (e.g. /dashboard) or an HTTPS URL (https://...)",
    )
    .optional()
    .or(z.literal("")),
  expires_in_days: z
    .number()
    .int()
    .min(1, "Must be at least 1 day")
    .max(90, "Must be 90 days or fewer")
    .optional(),
});

export type AdminBroadcastDispatchPayload = z.infer<
  typeof AdminBroadcastDispatchSchema
>;
