/**
 * Grit Meter API Functions
 *
 * 📍 src/features/grit-meter/api/grit-meter.api.ts
 */

import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import type { GritMeterStatus } from "../types";

export const getGritMeterStatus = async (): Promise<GritMeterStatus> => {
  const res = await apiClient.get<GritMeterStatus>(
    endpoints.admin.features.gritMeter,
  );
  return { enabled: res?.enabled ?? false };
};

export const toggleGritMeterStatus = async (
  enabled: boolean,
): Promise<GritMeterStatus> => {
  const res = await apiClient.post<GritMeterStatus>(
    endpoints.admin.features.gritMeter,
    { enabled },
  );
  return { enabled: res?.enabled ?? enabled };
};
