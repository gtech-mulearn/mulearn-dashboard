import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import type {
  AdminBroadcast,
  AdminBroadcastDispatchPayload,
  BroadcastCreatePayload,
  NotificationFeed,
  TargetOption,
} from "../schemas";
import {
  NotificationFeedApiResponseSchema,
  UnreadCountApiResponseSchema,
} from "../schemas";

/** Clears every personal notification server-side (all pages). */
export async function deleteAllDirectNotifications(): Promise<void> {
  await apiClient.delete(endpoints.notifications.deleteAll);
}

export async function getAllBroadcasts(): Promise<AdminBroadcast[]> {
  return apiClient.get<AdminBroadcast[]>(
    endpoints.notifications.broadcast.listAll,
  );
}

export async function createBroadcast(
  payload: BroadcastCreatePayload,
): Promise<AdminBroadcast> {
  return apiClient.post<AdminBroadcast>(
    endpoints.notifications.broadcast.create,
    payload,
  );
}

export async function updateBroadcast(
  id: string,
  payload: Partial<BroadcastCreatePayload>,
): Promise<AdminBroadcast> {
  return apiClient.patch<AdminBroadcast>(
    endpoints.notifications.broadcast.update(id),
    payload,
  );
}

export async function deleteBroadcast(id: string): Promise<void> {
  await apiClient.delete(endpoints.notifications.broadcast.deleteOne(id));
}

export async function deleteAllBroadcasts(): Promise<void> {
  await apiClient.delete(endpoints.notifications.broadcast.deleteAll);
}

// ─── New unified feed API ──────────────────────────────────────────────────────────

/** GET /api/v1/notification/ — paginated unified feed (personal + broadcast). */
export async function getNotificationFeed(
  params?: Record<string, string | number | boolean>,
): Promise<NotificationFeed> {
  const query = params
    ? `?${new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)])).toString()}`
    : "";
  const res = await apiClient.get(
    `${endpoints.notifications.feed}${query}`,
    NotificationFeedApiResponseSchema,
  );
  return res.response;
}

/** GET /api/v1/notification/unread-count/ */
export async function getUnreadCount(): Promise<number> {
  const res = await apiClient.get(
    endpoints.notifications.unreadCount,
    UnreadCountApiResponseSchema,
  );
  return res.response.unread_count;
}

/** PATCH /api/v1/notification/<id>/read/ — mark one notification as read. */
export async function markNotificationRead(id: string): Promise<void> {
  await apiClient.patch(endpoints.notifications.markOneRead(id), {});
}

/** PATCH /api/v1/notification/read-all/ — mark all notifications as read. */
export async function markAllNotificationsRead(): Promise<void> {
  await apiClient.patch(endpoints.notifications.markAllRead, {});
}

/** PATCH /api/v1/notification/read/ — mark a list of notifications as read. */
export async function markManyNotificationsRead(ids: string[]): Promise<void> {
  await apiClient.patch(endpoints.notifications.markManyRead, { ids });
}

/** DELETE /api/v1/notification/<id>/ — soft-delete one notification. */
export async function deleteNotification(id: string): Promise<void> {
  await apiClient.delete(endpoints.notifications.deleteNotification(id));
}

// ─── Admin broadcast dispatch (POST /api/v1/notification/admin/broadcast/) ─────

/**
 * Dispatches a free-text announcement to every active user on the platform.
 * Internally stored as notification type ADMIN_BROADCAST (category ADMIN).
 */
export async function dispatchAdminBroadcast(
  payload: AdminBroadcastDispatchPayload,
): Promise<void> {
  const body: Record<string, unknown> = {
    title: payload.title,
    description: payload.description,
  };
  if (payload.redirect_url) body.redirect_url = payload.redirect_url;
  if (payload.expires_in_days !== undefined)
    body.expires_in_days = payload.expires_in_days;
  await apiClient.post<unknown>(endpoints.notifications.adminBroadcast, body);
}

// ─── Legacy API ────────────────────────────────────────────────────────────────────

// ─── Target option fetchers ──────────────────────────────────────────────────

export async function getTargetCampusList(): Promise<TargetOption[]> {
  const raw = await apiClient.get<unknown>(endpoints.onboarding.colleges);
  const arr = Array.isArray(raw) ? raw : [];
  return arr.map((c: Record<string, unknown>) => ({
    id: String(c.id ?? ""),
    name: String(c.org ?? c.name ?? c.id ?? ""),
  }));
}

export async function getTargetIGList(): Promise<TargetOption[]> {
  const raw = await apiClient.get<unknown>(endpoints.interestGroups.list());
  const data =
    raw && typeof raw === "object" && "interestGroup" in (raw as object)
      ? (raw as Record<string, unknown>).interestGroup
      : raw;
  const arr = Array.isArray(data) ? data : [];
  return arr.map((ig: Record<string, unknown>) => ({
    id: String(ig.id ?? ""),
    name: String(ig.name ?? ig.id ?? ""),
  }));
}

export async function getTargetCampusIGChapters(): Promise<TargetOption[]> {
  const raw = await apiClient.get<unknown>(endpoints.campusManage.igChapters);
  const arr = Array.isArray(raw) ? raw : [];
  return arr.map((ch: Record<string, unknown>) => {
    const ig =
      ch.ig && typeof ch.ig === "object"
        ? (ch.ig as Record<string, unknown>)
        : {};
    return {
      id: String(ch.id ?? ""),
      name: String(ch.ig_name ?? ig.name ?? ch.name ?? ch.id ?? ""),
    };
  });
}

export async function getTargetEventList(): Promise<TargetOption[]> {
  const raw = await apiClient.get<unknown>(endpoints.events.admin);
  const data =
    raw && typeof raw === "object" && "data" in (raw as object)
      ? (raw as Record<string, unknown>).data
      : raw;
  const arr = Array.isArray(data) ? data : [];
  return arr.map((ev: Record<string, unknown>) => ({
    id: String(ev.id ?? ""),
    name: String(ev.title ?? ev.name ?? ev.id ?? ""),
  }));
}
