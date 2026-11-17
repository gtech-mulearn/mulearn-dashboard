import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import type {
  PushCampaign,
  PushCampaignInput,
  PushConfig,
  PushConfigPatch,
  PushStats,
} from "./types";

export function getPushConfig(): Promise<PushConfig> {
  return apiClient.get<PushConfig>(endpoints.push.adminConfig);
}

export function updatePushConfig(patch: PushConfigPatch): Promise<PushConfig> {
  return apiClient.patch<PushConfig>(endpoints.push.adminConfig, patch);
}

export async function getPushCampaigns(): Promise<PushCampaign[]> {
  const res = await apiClient.get<{ campaigns: PushCampaign[] }>(
    endpoints.push.adminCampaigns,
  );
  return res.campaigns ?? [];
}

export function createPushCampaign(
  input: PushCampaignInput,
): Promise<PushCampaign> {
  return apiClient.post<PushCampaign>(endpoints.push.adminCampaigns, input);
}

export function pushCampaignAction(
  id: string,
  action: "send" | "cancel",
): Promise<{ status: string }> {
  return apiClient.post<{ status: string }>(
    endpoints.push.adminCampaignAction(id, action),
    {},
  );
}

export function sendTestPush(input: {
  title: string;
  body: string;
  route?: string;
}): Promise<unknown> {
  return apiClient.post(endpoints.push.adminTest, input);
}

export function getPushStats(days = 14): Promise<PushStats> {
  return apiClient.get<PushStats>(`${endpoints.push.adminStats}?days=${days}`);
}
