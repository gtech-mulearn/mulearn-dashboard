import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import type {
  AdminBroadcast,
  BroadcastCreatePayload,
  NotificationListResponse,
  TargetOption,
} from "../schemas";

export async function getUserNotifications(): Promise<NotificationListResponse> {
  return apiClient.get<NotificationListResponse>(endpoints.notifications.list);
}

export async function deleteDirectNotification(id: string): Promise<void> {
  await apiClient.delete(endpoints.notifications.deleteOne(id));
}

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
