"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ApiError } from "@/api/client";
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
  });
}

export function useDeleteDirectNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteDirectNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.list() });
    },
    onError: (err) => {
      const msg =
        err instanceof ApiError ? err.message : "Failed to delete notification";
      toast.error(msg);
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
    onError: (err) => {
      const msg =
        err instanceof ApiError ? err.message : "Failed to clear notifications";
      toast.error(msg);
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
    onError: (err) => {
      const msg =
        err instanceof ApiError ? err.message : "Failed to create broadcast";
      toast.error(msg);
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
    onError: (err) => {
      const msg =
        err instanceof ApiError ? err.message : "Failed to update broadcast";
      toast.error(msg);
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
    onError: (err) => {
      const msg =
        err instanceof ApiError ? err.message : "Failed to delete broadcast";
      toast.error(msg);
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
    onError: (err) => {
      const msg =
        err instanceof ApiError ? err.message : "Failed to delete broadcasts";
      toast.error(msg);
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
