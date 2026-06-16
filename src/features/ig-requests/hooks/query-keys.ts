export const igRequestKeys = {
  all: ["ig-requests"] as const,
  list: (params?: Record<string, unknown>) =>
    [...igRequestKeys.all, "list", params] as const,
};
