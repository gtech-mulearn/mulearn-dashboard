import { apiClient, endpoints } from "@/api";
import type {
  CollaboratorInviteBody,
  CollaboratorsListData,
  CoOwnersListData,
  EventCoOwner,
  EventCoOwnerInput,
  EventDeleteData,
  EventDetailData,
  EventDetailManageData,
  EventInterestData,
  EventListData,
  EventListQueryParams,
  EventMutationData,
  EventPatchBody,
  EventWriteBody,
  IGCluster,
} from "../types";

// ─── HELPERS ────────────────────────────────────────────────────────────────

function buildQueryString(params?: EventListQueryParams): string {
  if (!params) return "";

  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set("page", String(params.page));
  if (params.perPage) searchParams.set("perPage", String(params.perPage));
  if (params.search) searchParams.set("search", params.search);
  if (params.event_type) searchParams.set("event_type", params.event_type);
  if (params.scope) searchParams.set("scope", params.scope);
  if (params.status) searchParams.set("status", params.status);
  if (params.ig_id) searchParams.set("ig_id", params.ig_id);
  if (params.campus_id) searchParams.set("campus_id", params.campus_id);
  if (params.company_id) searchParams.set("company_id", params.company_id);
  if (params.campus_ig_id)
    searchParams.set("campus_ig_id", params.campus_ig_id);
  if (params.cluster) searchParams.set("cluster", params.cluster);
  if (params.is_featured !== undefined)
    searchParams.set("is_featured", String(params.is_featured));
  if (params.tags) searchParams.set("tags", params.tags);
  if (params.eligible_only !== undefined)
    searchParams.set("eligible_only", String(params.eligible_only));
  if (params.start_date) searchParams.set("start_date", params.start_date);
  if (params.end_date) searchParams.set("end_date", params.end_date);
  if (params.sortBy) searchParams.set("sortBy", params.sortBy);

  const qs = searchParams.toString();
  return qs ? `?${qs}` : "";
}

// ─── EVENTS API ────────────────────────────────────────────────────────────

export const eventsApi = {
  // ─── PUBLIC LIST ENDPOINTS ───────────────────────────────────────────────
  list: async (params?: EventListQueryParams): Promise<EventListData> => {
    const qs = buildQueryString(params);
    return apiClient.get<EventListData>(`${endpoints.events.list}${qs}`);
  },

  featured: async (params?: EventListQueryParams): Promise<EventListData> => {
    const qs = buildQueryString(params);
    return apiClient.get<EventListData>(`${endpoints.events.featured}${qs}`);
  },

  // ─── PUBLIC DETAIL & INTEREST ────────────────────────────────────────────
  detail: async (id: string): Promise<EventDetailData> => {
    return apiClient.get<EventDetailData>(endpoints.events.detail(id));
  },

  addInterest: async (id: string): Promise<EventInterestData> => {
    return apiClient.post<EventInterestData>(endpoints.events.interest(id), {});
  },

  removeInterest: async (id: string): Promise<EventDeleteData> => {
    return apiClient.delete<EventDeleteData>(endpoints.events.interest(id));
  },

  // ─── MANAGE: LIST & CRUD ─────────────────────────────────────────────────
  manageList: async (params?: EventListQueryParams): Promise<EventListData> => {
    const qs = buildQueryString(params);
    return apiClient.get<EventListData>(`${endpoints.events.manageList}${qs}`);
  },

  create: async (body: EventWriteBody): Promise<EventMutationData> => {
    return apiClient.post<EventMutationData>(
      endpoints.events.manageCreate,
      body,
    );
  },

  manageDetail: async (id: string): Promise<EventDetailManageData> => {
    return apiClient.get<EventDetailManageData>(
      endpoints.events.manageDetail(id),
    );
  },

  update: async (
    id: string,
    body: EventWriteBody,
  ): Promise<EventMutationData> => {
    return apiClient.put<EventMutationData>(
      endpoints.events.manageUpdate(id),
      body,
    );
  },

  patch: async (
    id: string,
    body: EventPatchBody,
  ): Promise<EventMutationData> => {
    return apiClient.patch<EventMutationData>(
      endpoints.events.managePatch(id),
      body,
    );
  },

  delete: async (id: string): Promise<EventDeleteData> => {
    return apiClient.delete<EventDeleteData>(endpoints.events.manageDelete(id));
  },

  publish: async (id: string): Promise<EventMutationData> => {
    return apiClient.post<EventMutationData>(endpoints.events.publish(id), {});
  },

  // ─── CO-OWNERS ───────────────────────────────────────────────────────────
  getCoOwners: async (id: string): Promise<CoOwnersListData> => {
    return apiClient.get<CoOwnersListData>(endpoints.events.coOwners(id));
  },

  addCoOwner: async (
    id: string,
    body: EventCoOwnerInput,
  ): Promise<EventCoOwner> => {
    return apiClient.post<EventCoOwner>(endpoints.events.coOwners(id), body);
  },

  removeCoOwner: async (
    id: string,
    coOwnerId: string,
  ): Promise<EventDeleteData> => {
    return apiClient.delete<EventDeleteData>(
      endpoints.events.coOwnerItem(id, coOwnerId),
    );
  },

  // ─── COLLABORATORS ──────────────────────────────────────────────────────
  getCollaborators: async (id: string): Promise<CollaboratorsListData> => {
    return apiClient.get<CollaboratorsListData>(
      endpoints.events.collaborators(id),
    );
  },

  inviteCollaborator: async (
    id: string,
    body: CollaboratorInviteBody,
  ): Promise<EventDeleteData> => {
    return apiClient.post<EventDeleteData>(
      endpoints.events.collaborators(id),
      body,
    );
  },

  acceptCollaborator: async (
    id: string,
    cId: string,
  ): Promise<EventDeleteData> => {
    return apiClient.post<EventDeleteData>(
      endpoints.events.collaboratorAccept(id, cId),
      {},
    );
  },

  rejectCollaborator: async (
    id: string,
    cId: string,
    reason?: string,
  ): Promise<EventDeleteData> => {
    return apiClient.post<EventDeleteData>(
      endpoints.events.collaboratorReject(id, cId),
      { reason },
    );
  },

  removeCollaborator: async (
    id: string,
    cId: string,
  ): Promise<EventDeleteData> => {
    return apiClient.delete<EventDeleteData>(
      endpoints.events.collaboratorItem(id, cId),
    );
  },

  // ─── SCOPED FEEDS ───────────────────────────────────────────────────────
  igEvents: async (
    igId: string,
    params?: EventListQueryParams,
  ): Promise<EventListData> => {
    const qs = buildQueryString(params);
    return apiClient.get<EventListData>(
      `${endpoints.events.igEvents(igId)}${qs}`,
    );
  },

  clusterEvents: async (
    cluster: IGCluster,
    params?: EventListQueryParams,
  ): Promise<EventListData> => {
    const qs = buildQueryString(params);
    return apiClient.get<EventListData>(
      `${endpoints.events.clusterEvents(cluster)}${qs}`,
    );
  },

  campusEvents: async (
    campusId: string,
    params?: EventListQueryParams,
  ): Promise<EventListData> => {
    const qs = buildQueryString(params);
    return apiClient.get<EventListData>(
      `${endpoints.events.campusEvents(campusId)}${qs}`,
    );
  },

  campusIgEvents: async (
    campusIgId: string,
    params?: EventListQueryParams,
  ): Promise<EventListData> => {
    const qs = buildQueryString(params);
    return apiClient.get<EventListData>(
      `${endpoints.events.campusIgEvents(campusIgId)}${qs}`,
    );
  },

  companyEvents: async (
    companyId: string,
    params?: EventListQueryParams,
  ): Promise<EventListData> => {
    const qs = buildQueryString(params);
    return apiClient.get<EventListData>(
      `${endpoints.events.companyEvents(companyId)}${qs}`,
    );
  },

  // ─── META / FORM OPTIONS ────────────────────────────────────────────────
  getOrganizerOptions: async (): Promise<unknown> => {
    return apiClient.get<unknown>(endpoints.events.organizerOptions);
  },
};
