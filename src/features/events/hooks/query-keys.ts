/**
 * Events Query Key Factory
 *
 * 📍 src/features/events/hooks/query-keys.ts
 *
 * Hierarchical query key factory for all events data.
 * Invalidating a parent key cascades to all child keys.
 *
 * Depends on: ../schemas (types only)
 */

import type { EventListQueryParams, IGCluster } from "../types";

export const eventKeys = {
  /** Root key — invalidating this clears ALL event-related cache */
  all: ["events"] as const,

  // ── Public ──────────────────────────────────────────────────
  lists: () => [...eventKeys.all, "list"] as const,
  list: (params: EventListQueryParams) =>
    [...eventKeys.lists(), params] as const,

  featured: () => [...eventKeys.all, "featured"] as const,

  details: () => [...eventKeys.all, "detail"] as const,
  detail: (id: string) => [...eventKeys.details(), id] as const,

  // ── Manage ─────────────────────────────────────────────────
  manage: () => [...eventKeys.all, "manage"] as const,
  manageLists: () => [...eventKeys.manage(), "list"] as const,
  manageList: (params: EventListQueryParams) =>
    [...eventKeys.manageLists(), params] as const,
  manageDetails: () => [...eventKeys.manage(), "detail"] as const,
  manageDetail: (id: string) => [...eventKeys.manageDetails(), id] as const,

  // ── Co-owners ──────────────────────────────────────────────
  coOwners: (eventId: string) =>
    [...eventKeys.manage(), "co-owners", eventId] as const,

  // ── Collaborators ──────────────────────────────────────────
  collaborators: (eventId: string) =>
    [...eventKeys.manage(), "collaborators", eventId] as const,
  pendingCollaboratorInvites: (scope: "global") =>
    [...eventKeys.manage(), "pending-collaborator-invites", scope] as const,

  // ── Admin ──────────────────────────────────────────────────
  admin: () => [...eventKeys.all, "admin"] as const,
  adminList: (params: Record<string, unknown>) =>
    [...eventKeys.admin(), "list", params] as const,

  // ── Meta ───────────────────────────────────────────────────
  meta: () => [...eventKeys.all, "meta"] as const,
  organizerOptions: () => [...eventKeys.meta(), "organizer-options"] as const,
  eventTypeScope: () => [...eventKeys.meta(), "event-type-scope"] as const,
  collaborationTargets: (params: { search: string; type?: string }) =>
    [...eventKeys.meta(), "collaboration-targets", params] as const,
  userSearch: (query: string) =>
    [...eventKeys.meta(), "user-search", query] as const,

  // ── Scoped Feeds ───────────────────────────────────────────
  feeds: () => [...eventKeys.all, "feed"] as const,
  igFeed: (igId: string, params: EventListQueryParams) =>
    [...eventKeys.feeds(), "ig", igId, params] as const,
  clusterFeed: (cluster: IGCluster, params: EventListQueryParams) =>
    [...eventKeys.feeds(), "cluster", cluster, params] as const,
  campusFeed: (campusId: string, params: EventListQueryParams) =>
    [...eventKeys.feeds(), "campus", campusId, params] as const,
  campusIgFeed: (campusIgId: string, params: EventListQueryParams) =>
    [...eventKeys.feeds(), "campus-ig", campusIgId, params] as const,
  companyFeed: (companyId: string, params: EventListQueryParams) =>
    [...eventKeys.feeds(), "company", companyId, params] as const,
};
