import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import type { CampusInfo, WeeklyKarma } from "../types";

export const campusService = {
  getCampusInfo: (id: string) =>
    apiClient.get<CampusInfo>(endpoints.campus.info(id)),

  getWeeklyKarma: (id: string) =>
    apiClient.get<WeeklyKarma>(endpoints.campus.weeklykarma(id)),
};
