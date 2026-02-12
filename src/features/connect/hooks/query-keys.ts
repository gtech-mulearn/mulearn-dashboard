export const connectKeys = {
  all: ["connect"] as const,
  discord: () => [...connectKeys.all, "discord"] as const,
  qsverse: () => [...connectKeys.all, "qsverse"] as const,
};
