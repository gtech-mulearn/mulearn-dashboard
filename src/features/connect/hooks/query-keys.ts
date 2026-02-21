export const connectKeys = {
  all: ["connect"] as const,
  qsverse: (muid?: string) => [...connectKeys.all, "qsverse", muid] as const,
};
