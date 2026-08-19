/**
 * Grit Meter Query Keys
 *
 * 📍 src/features/grit-meter/hooks/query-keys.ts
 */

export const gritMeterKeys = {
  all: ["grit-meter"] as const,
  status: () => [...gritMeterKeys.all, "status"] as const,
};
