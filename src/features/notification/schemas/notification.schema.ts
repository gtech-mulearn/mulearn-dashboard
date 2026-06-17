import { z } from "zod";

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
  global: "Global (All Users)",
  campus: "Campus",
  interest_group: "Interest Group",
  campus_ig: "Campus IG Chapter",
  event_interest: "Event Interest",
};

// broadcast/create/ only accepts these 4 fields — backend auto-sets target_type=global
export const BroadcastCreateSchema = z.object({
  title: z.string().min(1, "Title required"),
  description: z.string().min(1, "Description required"),
  url: z.string().optional(),
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
