export const notificationKeys = {
  all: ["notifications"] as const,
  /** @deprecated Legacy — use feed() instead for user-facing popover */
  list: () => [...notificationKeys.all, "list"] as const,
  adminBroadcasts: () => [...notificationKeys.all, "admin-broadcasts"] as const,
  /** Unified notification feed (new API) */
  feed: () => [...notificationKeys.all, "feed"] as const,
  /** Personal unread count (new API) */
  unreadCount: () => [...notificationKeys.all, "unread-count"] as const,
};
