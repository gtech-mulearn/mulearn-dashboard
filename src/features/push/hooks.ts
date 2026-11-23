"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiResponseError } from "@/hooks/use-get-error";
import {
  createPushCampaign,
  getPushCampaigns,
  getPushConfig,
  getPushStats,
  pushCampaignAction,
  sendTestPush,
  updatePushConfig,
} from "./api";
import type { PushCampaignInput, PushConfigPatch } from "./types";

export const pushKeys = {
  all: ["push-admin"] as const,
  config: () => [...pushKeys.all, "config"] as const,
  campaigns: () => [...pushKeys.all, "campaigns"] as const,
  stats: (days: number) => [...pushKeys.all, "stats", days] as const,
};

function errorText(error: unknown, fallback: string) {
  return getApiResponseError(error, { fallback });
}

export function usePushConfig() {
  return useQuery({ queryKey: pushKeys.config(), queryFn: getPushConfig });
}

export function useUpdatePushConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (patch: PushConfigPatch) => updatePushConfig(patch),
    onSuccess: (config) => {
      qc.setQueryData(pushKeys.config(), config);
      toast.success("Push settings saved");
    },
    onError: (e) => toast.error(errorText(e, "Couldn't save push settings")),
  });
}

export function usePushCampaigns() {
  return useQuery({
    queryKey: pushKeys.campaigns(),
    queryFn: getPushCampaigns,
    // A campaign that is sending updates its counters as chunks finish.
    refetchInterval: (query) =>
      query.state.data?.some((c) => c.status === "sending") ? 5000 : false,
  });
}

export function useCreatePushCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: PushCampaignInput) => createPushCampaign(input),
    onSuccess: (campaign) => {
      qc.invalidateQueries({ queryKey: pushKeys.campaigns() });
      toast.success(
        campaign.status === "scheduled" ? "Campaign scheduled" : "Draft saved",
      );
    },
    onError: (e) => toast.error(errorText(e, "Couldn't save the campaign")),
  });
}

export function usePushCampaignAction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: "send" | "cancel" }) =>
      pushCampaignAction(id, action),
    onSuccess: (_, { action }) => {
      qc.invalidateQueries({ queryKey: pushKeys.campaigns() });
      toast.success(
        action === "send" ? "Sending started" : "Campaign cancelled",
      );
    },
    onError: (e) => toast.error(errorText(e, "That didn't work")),
  });
}

export function useSendTestPush() {
  return useMutation({
    mutationFn: sendTestPush,
    onSuccess: () => toast.success("Test push sent to your devices"),
    onError: (e) => toast.error(errorText(e, "No test push was sent")),
  });
}

export function usePushStats(days = 14) {
  return useQuery({
    queryKey: pushKeys.stats(days),
    queryFn: () => getPushStats(days),
  });
}
