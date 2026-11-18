/** Mobile push admin types (backend `/api/v1/push/admin/`). */

export type PushGlobalConfig = {
  kill_switch: boolean;
  daily_cap: number;
  engagement_daily_cap: number;
  max_per_minute: number;
  default_quiet_start: number;
  default_quiet_end: number;
  default_timezone: string;
  nudge_window_start: number;
  nudge_window_end: number;
  fatigue_lookback_days: number;
  max_backoff_days: number;
  chunk_size: number;
};

/** One engagement rule; fields beyond these vary per rule. */
export type PushRuleConfig = {
  enabled: boolean;
  weight: number;
  urgent: boolean;
  /** Only present when an admin saved custom copy before versions existed. */
  title?: string;
  variants?: PushVariant[];
  [key: string]: unknown;
};

export type PushVariant = {
  key: string;
  title: string;
  body: string;
  body_no_tasks?: string | null;
  voice?: string;
};

export type PushVariantStat = { variant: string; sent: number; opened: number };

export type PushConfig = {
  /** False when the server has no Firebase credentials: nothing is sent. */
  configured: boolean;
  global: PushGlobalConfig;
  rules: Record<string, PushRuleConfig>;
  /** Notification type → pushes on/off. */
  types: Record<string, boolean>;
};

export type PushConfigPatch = {
  global?: Partial<PushGlobalConfig>;
  rules?: Record<string, Partial<PushRuleConfig>>;
  types?: Record<string, boolean>;
};

export type PushAudienceType = "all" | "roles" | "igs" | "colleges" | "muids";

export type PushAudience = { type: PushAudienceType; ids: string[] };

export type PushCampaignStatus =
  | "draft"
  | "scheduled"
  | "sending"
  | "sent"
  | "cancelled"
  | "failed";

export type PushCampaign = {
  id: string;
  title: string;
  body: string;
  route: string | null;
  audience: PushAudience;
  status: PushCampaignStatus;
  scheduled_at: string | null;
  respect_quiet_hours: boolean;
  target_count: number;
  sent_count: number;
  skipped_count: number;
  failed_count: number;
  created_at: string;
  sent_at: string | null;
  created_by: string | null;
};

export type PushCampaignInput = {
  title: string;
  body: string;
  route?: string;
  audience: PushAudience;
  scheduled_at?: string;
  respect_quiet_hours: boolean;
};

export type PushStatsRow = {
  source: "activity" | "engagement" | "campaign" | "test";
  kind: string;
  status: string;
  n: number;
  opened: number;
};

export type PushStats = {
  days: number;
  devices: { devices: number; users: number };
  rows: PushStatsRow[];
  variants?: PushVariantStat[];
};
