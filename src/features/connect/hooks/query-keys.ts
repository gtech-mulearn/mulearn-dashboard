export const connectKeys = {
  all: ["connect"] as const,
  user: () => [...connectKeys.all, "user"] as const,
  qsverse: () => [...connectKeys.all, "qsverse"] as const,
};
