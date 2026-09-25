"use client";

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiResponseError } from "@/hooks/use-get-error";
import {
  createBroadcast,
  deleteAllBroadcasts,
  deleteAllDirectNotifications,
  deleteBroadcast,
  deleteDirectNotification,
  deleteNotification,
  dispatchAdminBroadcast,
  getAllBroadcasts,
  getNotificationFeed,
  getTargetCampusIGChapters,
  getTargetCampusList,
  getTargetEventList,
  getTargetIGList,
  getUnreadCount,
  getUserNotifications,
  markAllNotificationsRead,
  markManyNotificationsRead,
  markNotificationRead,
  updateBroadcast,
} from "../api";
import type {
  AdminBroadcastDispatchPayload,
  BroadcastCreatePayload,
  TargetType,
} from "../schemas";
import { notificationKeys } from "./query-keys";

const REFETCH_INTERVAL = 60 * 1000;

// ─── New unified feed hooks ───────────────────────────────────────────────────

export function useNotificationFeed(enabled = true, pageSize = 20) {
  return useInfiniteQuery({
    queryKey: notificationKeys.feed(),
    queryFn: ({ pageParam = 1 }) =>
      getNotificationFeed({ page: pageParam, page_size: pageSize }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const hasMore = lastPage.page * lastPage.page_size < lastPage.count;
      return hasMore ? lastPage.page + 1 : undefined;
    },
    enabled,
    staleTime: 30 * 1000,
    refetchInterval: REFETCH_INTERVAL,
    refetchIntervalInBackground: false,
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: getUnreadCount,
    refetchInterval: REFETCH_INTERVAL,
    refetchIntervalInBackground: false,
    staleTime: 30 * 1000,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => markNotificationRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.feed() });
      queryClient.invalidateQueries({
        queryKey: notificationKeys.unreadCount(),
      });
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, { fallback: "Failed to mark as read" }),
      );
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.feed() });
      queryClient.invalidateQueries({
        queryKey: notificationKeys.unreadCount(),
      });
      toast.success("All notifications marked as read");
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, { fallback: "Failed to mark all as read" }),
      );
    },
  });
}

export function useMarkManyNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => markManyNotificationsRead(ids),
    onSuccess: (_data, ids) => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.feed() });
      queryClient.invalidateQueries({
        queryKey: notificationKeys.unreadCount(),
      });
      toast.success(
        ids.length === 1
          ? "Notification marked as read"
          : `${ids.length} notifications marked as read`,
      );
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, { fallback: "Failed to mark as read" }),
      );
    },
  });
}

export function useDeleteNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.feed() });
      queryClient.invalidateQueries({
        queryKey: notificationKeys.unreadCount(),
      });
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

/**
 * DELETE /api/v1/notification/delete/all/ — server-side exhaustive clear.
 *
 * Uses the bulk delete endpoint so ALL personal notifications are removed
 * regardless of how many pages exist, avoiding the pagination bug where the
 * client-side loop only cleared the first page of results.
 */
export function useDeleteAllPersonalNotifications() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAllDirectNotifications,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.feed() });
      queryClient.invalidateQueries({
        queryKey: notificationKeys.unreadCount(),
      });
      toast.success("Personal notifications cleared");
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to clear personal notifications",
        }),
      );
    },
  });
}

// ─── Admin broadcast dispatch hook ────────────────────────────────────────────

export function useDispatchAdminBroadcast() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AdminBroadcastDispatchPayload) =>
      dispatchAdminBroadcast(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: notificationKeys.adminBroadcasts(),
      });
      queryClient.invalidateQueries({
        queryKey: notificationKeys.feed(),
      });
      queryClient.invalidateQueries({
        queryKey: notificationKeys.unreadCount(),
      });
      toast.success("Announcement sent successfully.");
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to send announcement",
        }),
      );
    },
  });
}

// ─── Legacy admin management hooks ───────────────────────────────────────────

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
      toast.success("Personal notifications cleared");
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to clear personal notifications",
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
      toast.success("Announcement created");
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to create announcement",
        }),
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
      toast.success("Announcement updated");
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to update announcement",
        }),
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
      toast.success("Announcement deleted");
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to delete announcement",
        }),
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
      toast.success("All announcements deleted");
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to delete announcements",
        }),
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
