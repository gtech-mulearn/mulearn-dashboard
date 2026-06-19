"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiResponseError } from "@/hooks/use-get-error";
import {
  createBroadcast,
  deleteAllBroadcasts,
  deleteAllDirectNotifications,
  deleteBroadcast,
  deleteDirectNotification,
  getAllBroadcasts,
  getTargetCampusIGChapters,
  getTargetCampusList,
  getTargetEventList,
  getTargetIGList,
  getUserNotifications,
  updateBroadcast,
} from "../api";
import type { BroadcastCreatePayload, TargetType } from "../schemas";
import { notificationKeys } from "./query-keys";

const REFETCH_INTERVAL = 60 * 1000;

export function useNotifications() {
  return useQuery({
    queryKey: notificationKeys.list(),
    queryFn: getUserNotifications,
    refetchInterval: REFETCH_INTERVAL,
    refetchIntervalInBackground: false,
  });
}

export function useDeleteDirectNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteDirectNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.list() });
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to delete notification",
        }),
      );
    },
  });
}

export function useDeleteAllDirectNotifications() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAllDirectNotifications,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.list() });
      toast.success("All notifications cleared");
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to clear notifications",
        }),
      );
    },
  });
}

export function useAdminBroadcasts() {
  return useQuery({
    queryKey: notificationKeys.adminBroadcasts(),
    queryFn: getAllBroadcasts,
  });
}

export function useCreateBroadcast() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: BroadcastCreatePayload) => createBroadcast(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: notificationKeys.adminBroadcasts(),
      });
      toast.success("Broadcast created");
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, { fallback: "Failed to create broadcast" }),
      );
    },
  });
}

export function useUpdateBroadcast() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<BroadcastCreatePayload>;
    }) => updateBroadcast(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: notificationKeys.adminBroadcasts(),
      });
      toast.success("Broadcast updated");
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, { fallback: "Failed to update broadcast" }),
      );
    },
  });
}

export function useDeleteBroadcast() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteBroadcast(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: notificationKeys.adminBroadcasts(),
      });
      toast.success("Broadcast deleted");
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, { fallback: "Failed to delete broadcast" }),
      );
    },
  });
}

export function useDeleteAllBroadcasts() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAllBroadcasts,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: notificationKeys.adminBroadcasts(),
      });
      toast.success("All broadcasts deleted");
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, { fallback: "Failed to delete broadcasts" }),
      );
    },
  });
}

export function useTargetOptions(targetType: TargetType | undefined) {
  return useQuery({
    queryKey: [...notificationKeys.all, "target-options", targetType],
    queryFn: () => {
      switch (targetType) {
        case "campus":
          return getTargetCampusList();
        case "interest_group":
          return getTargetIGList();
        case "campus_ig":
          return getTargetCampusIGChapters();
        case "event_interest":
          return getTargetEventList();
        default:
          return Promise.resolve([]);
      }
    },
    enabled: !!targetType && targetType !== "global",
    staleTime: 5 * 60 * 1000,
  });
}
