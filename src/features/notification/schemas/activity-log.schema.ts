export type ActivityLogCampaign = {
  status: string;
  target_count: number;
  sent_count: number;
  skipped_count: number;
  failed_count: number;
};

export type ActivityLogEntry = {
  id: string;
  action: string;
  label: string;
  actor: { full_name: string; muid: string };
  roles: string[];
  title: string | null;
  audience_size: number | null;
  audience_label: string | null;
  created_at: string;
  entity_name?: string | null;
  entity_id?: string | null;
  /** Live counts for push_campaign rows, null otherwise. */
  campaign?: ActivityLogCampaign | null;
  old_data: Record<string, unknown> | null;
  new_data: Record<string, unknown> | null;
};

export type ActivityLogQuery = {
  pageIndex: number;
  perPage: number;
  action?: string;
  actor?: string;
  from?: string;
  to?: string;
};

export type ActivityLogPage = {
  data: ActivityLogEntry[];
  pagination: {
    count: number;
    totalPages: number;
    isNext: boolean;
    isPrev: boolean;
  };
};

/** The action types the backend logs, in filter order. */
export const ACTIVITY_ACTIONS = [
  { value: "NOTIF_BROADCAST_CREATE", label: "Created announcement" },
  { value: "NOTIF_BROADCAST_SEND", label: "Sent announcement to everyone" },
  { value: "NOTIF_BROADCAST_UPDATE", label: "Edited announcement" },
  { value: "NOTIF_BROADCAST_DELETE", label: "Deleted announcement" },
  { value: "NOTIF_BROADCAST_DEL_ALL", label: "Deleted all announcements" },
  { value: "PUSH_CAMPAIGN_CREATE", label: "Created push campaign" },
  { value: "PUSH_CAMPAIGN_SEND", label: "Sent push campaign" },
  { value: "PUSH_CAMPAIGN_CANCEL", label: "Cancelled push campaign" },
  { value: "PUSH_TEST_SEND", label: "Sent test push" },
  { value: "PUSH_CONFIG_UPDATE", label: "Changed push settings" },
] as const;
