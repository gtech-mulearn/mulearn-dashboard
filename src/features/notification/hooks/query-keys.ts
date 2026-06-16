export const notificationKeys = {
  all: ["notifications"] as const,
  list: () => [...notificationKeys.all, "list"] as const,
  adminBroadcasts: () => [...notificationKeys.all, "admin-broadcasts"] as const,
};
