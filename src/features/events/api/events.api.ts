import { apiClient, endpoints } from "@/api";
import type {
  CollaboratorInviteBody,
  CollaboratorsListData,
  CoOwnersListData,
  EventCollaborator,
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
  MinimalCampus,
  MinimalIG,
  MinimalUser,
  OrganizerOptionsResponse,
  PaginatedData,
} from "../types";

type EventShape = {
  event_type?: string | null;
  category_name?: string | null;
};

// Compatibility shim:
// If the backend returns event_type but omits category_name, mirror it here so
// existing event views keep showing the selected type after refresh.
function mirrorEventTypeToCategory<T extends EventShape>(event: T): T {
  if (!event || typeof event !== "object") {
    return event;
  }

  const eventType = event.event_type ?? null;
  const categoryName = event.category_name ?? null;

  if (!eventType || categoryName) {
    return event;
  }

  return {
    ...event,
    category_name: eventType,
  };
}

function mirrorEventTypeToCategoryList<T extends EventShape>(
  data: PaginatedData<T>,
): PaginatedData<T> {
  return {
    ...data,
    data: data.data.map((event) => mirrorEventTypeToCategory(event)),
  };
}

// ─── HELPERS ────────────────────────────────────────────────────────────────

function buildQueryString(params?: EventListQueryParams): string {
  if (!params) return "";

  const searchParams = new URLSearchParams();
  if (params.pageIndex) searchParams.set("pageIndex", String(params.pageIndex));
  if (params.perPage) searchParams.set("perPage", String(params.perPage));
  if (params.search) searchParams.set("search", params.search);
  if (params.event_type) searchParams.set("event_type", params.event_type);
  if (params.scope) searchParams.set("scope", params.scope);
  if (params.status) searchParams.set("status", params.status);
  if (params.ig_id) searchParams.set("ig_id", params.ig_id);
  if (params.campus_id) searchParams.set("campus_id", params.campus_id);
  if (params.cluster) searchParams.set("cluster", params.cluster);
  if (params.is_featured !== undefined)
    searchParams.set("is_featured", String(params.is_featured));
  if (params.tags) searchParams.set("tags", params.tags);
  if (params.eligible_only !== undefined)
    searchParams.set("eligible_only", String(params.eligible_only));
  if (params.start_date) searchParams.set("start_date", params.start_date);
  if (params.end_date) searchParams.set("end_date", params.end_date);
  if (params.sortBy) searchParams.set("sortBy", params.sortBy);
  if (params.organiser_type)
    searchParams.set("organiser_type", params.organiser_type);
  if (params.created_by) searchParams.set("created_by", params.created_by);

  const qs = searchParams.toString();
  return qs ? `?${qs}` : "";
}

function buildQueryStringWithStatusOverride(
  params: EventListQueryParams | undefined,
  status: string,
): string {
  if (!params) {
    return `?status=${encodeURIComponent(status)}`;
  }

  const searchParams = new URLSearchParams();
  if (params.pageIndex) searchParams.set("pageIndex", String(params.pageIndex));
  if (params.perPage) searchParams.set("perPage", String(params.perPage));
  if (params.search) searchParams.set("search", params.search);
  if (params.event_type) searchParams.set("event_type", params.event_type);
  if (params.scope) searchParams.set("scope", params.scope);
  searchParams.set("status", status);
  if (params.ig_id) searchParams.set("ig_id", params.ig_id);
  if (params.campus_id) searchParams.set("campus_id", params.campus_id);
  if (params.cluster) searchParams.set("cluster", params.cluster);
  if (params.is_featured !== undefined)
    searchParams.set("is_featured", String(params.is_featured));
  if (params.tags) searchParams.set("tags", params.tags);
  if (params.eligible_only !== undefined)
    searchParams.set("eligible_only", String(params.eligible_only));
  if (params.start_date) searchParams.set("start_date", params.start_date);
  if (params.end_date) searchParams.set("end_date", params.end_date);
  if (params.sortBy) searchParams.set("sortBy", params.sortBy);
  if (params.organiser_type)
    searchParams.set("organiser_type", params.organiser_type);
  if (params.created_by) searchParams.set("created_by", params.created_by);

  return `?${searchParams.toString()}`;
}

// ─── EVENTS API ────────────────────────────────────────────────────────────

export const eventsApi = {
  // ─── PUBLIC LIST ENDPOINTS ───────────────────────────────────────────────
  list: async (params?: EventListQueryParams): Promise<EventListData> => {
    const qs = buildQueryString(params);
    const response = await apiClient.get<EventListData>(
      `${endpoints.events.base}${qs}`,
    );
    return mirrorEventTypeToCategoryList(response);
  },

  featured: async (params?: EventListQueryParams): Promise<EventListData> => {
    const qs = buildQueryString(params);
    const response = await apiClient.get<EventListData>(
      `${endpoints.events.featured}${qs}`,
    );
    return mirrorEventTypeToCategoryList(response);
  },

  // ─── PUBLIC DETAIL & INTEREST ────────────────────────────────────────────
  detail: async (id: string): Promise<EventDetailData> => {
    const response = await apiClient.get<EventDetailData>(
      `${endpoints.events.base}${id}/`,
    );
    return mirrorEventTypeToCategory(response);
  },

  addInterest: async (id: string): Promise<EventInterestData> => {
    return apiClient.post<EventInterestData>(
      `${endpoints.events.base}${id}/interest/`,
      {},
    );
  },

  removeInterest: async (id: string): Promise<EventDeleteData> => {
    return apiClient.delete<EventDeleteData>(
      `${endpoints.events.base}${id}/interest/`,
    );
  },

  // ─── MANAGE: LIST & CRUD ─────────────────────────────────────────────────
  manageList: async (params?: EventListQueryParams): Promise<EventListData> => {
    const qs = buildQueryString(params);
    let response = await apiClient.get<EventListData>(
      `${endpoints.events.manage}${qs}`,
    );
    response = mirrorEventTypeToCategoryList(response);

    // Some deployments use American spelling in query parsing (`canceled`).
    if (params?.status === "cancelled" && response.data.length === 0) {
      const fallbackQs = buildQueryStringWithStatusOverride(params, "canceled");
      const fallbackResponse = await apiClient.get<EventListData>(
        `${endpoints.events.manage}${fallbackQs}`,
      );
      return mirrorEventTypeToCategoryList(fallbackResponse);
    }

    return response;
  },

  create: async (body: EventWriteBody): Promise<EventMutationData> => {
    const response = await apiClient.post<EventMutationData>(
      endpoints.events.manage,
      body,
    );
    return mirrorEventTypeToCategory(response);
  },

  manageDetail: async (id: string): Promise<EventDetailManageData> => {
    const response = await apiClient.get<EventDetailManageData>(
      `${endpoints.events.manage}${id}/`,
    );
    return mirrorEventTypeToCategory(response);
  },

  update: async (
    id: string,
    body: EventWriteBody,
  ): Promise<EventMutationData> => {
    const response = await apiClient.put<EventMutationData>(
      `${endpoints.events.manage}${id}/`,
      body,
    );
    return mirrorEventTypeToCategory(response);
  },

  patch: async (
    id: string,
    body: EventPatchBody,
  ): Promise<EventMutationData> => {
    const response = await apiClient.patch<EventMutationData>(
      `${endpoints.events.manage}${id}/`,
      body,
    );
    return mirrorEventTypeToCategory(response);
  },

  delete: async (id: string): Promise<EventDeleteData> => {
    return apiClient.delete<EventDeleteData>(
      `${endpoints.events.manage}${id}/`,
    );
  },

  publish: async (id: string): Promise<EventMutationData> => {
    const response = await apiClient.post<EventMutationData>(
      `${endpoints.events.manage}${id}/publish/`,
      {},
    );
    return mirrorEventTypeToCategory(response);
  },

  // ─── CO-OWNERS ───────────────────────────────────────────────────────────
  getCoOwners: async (id: string): Promise<CoOwnersListData> => {
    return apiClient.get<CoOwnersListData>(
      `${endpoints.events.manage}${id}/co-owners/`,
    );
  },

  addCoOwner: async (
    id: string,
    body: EventCoOwnerInput,
  ): Promise<EventCoOwner> => {
    return apiClient.post<EventCoOwner>(
      `${endpoints.events.manage}${id}/co-owners/`,
      body,
    );
  },

  removeCoOwner: async (
    id: string,
    coOwnerId: string,
  ): Promise<EventDeleteData> => {
    return apiClient.delete<EventDeleteData>(
      `${endpoints.events.manage}${id}/co-owners/${coOwnerId}/`,
    );
  },

  // ─── COLLABORATORS ──────────────────────────────────────────────────────
  getCollaborators: async (id: string): Promise<CollaboratorsListData> => {
    return apiClient.get<CollaboratorsListData>(
      `${endpoints.events.manage}${id}/collaborators/`,
    );
  },

  inviteCollaborator: async (
    id: string,
    body: CollaboratorInviteBody,
  ): Promise<EventCollaborator> => {
    return apiClient.post<EventCollaborator>(
      `${endpoints.events.manage}${id}/collaborators/`,
      body,
    );
  },

  acceptCollaborator: async (
    id: string,
    cId: string,
  ): Promise<EventCollaborator> => {
    return apiClient.post<EventCollaborator>(
      `${endpoints.events.manage}${id}/collaborators/${cId}/accept/`,
      {},
    );
  },

  rejectCollaborator: async (
    id: string,
    cId: string,
    reason?: string,
  ): Promise<EventCollaborator> => {
    return apiClient.post<EventCollaborator>(
      `${endpoints.events.manage}${id}/collaborators/${cId}/reject/`,
      { reason },
    );
  },

  removeCollaborator: async (
    id: string,
    cId: string,
  ): Promise<EventDeleteData> => {
    return apiClient.delete<EventDeleteData>(
      `${endpoints.events.manage}${id}/collaborators/${cId}/`,
    );
  },

  searchCollaborationTargets: async (
    search: string,
    type?: "ig" | "campus" | "campus_ig" | "company",
  ): Promise<unknown> => {
    const searchParams = new URLSearchParams();
    if (search) {
      searchParams.set("search", search);
    }
    if (type) {
      searchParams.set("type", type);
    }
    return apiClient.get(
      `${endpoints.events.meta.collaborationTargets}?${searchParams.toString()}`,
    );
  },

  searchUsers: async (query: string): Promise<PaginatedData<MinimalUser>> => {
    const searchParams = new URLSearchParams({ search: query, perPage: "10" });
    return apiClient.get<PaginatedData<MinimalUser>>(
      `${endpoints.search.users}?${searchParams.toString()}`,
    );
  },

  searchCampusTargets: async (
    query: string,
  ): Promise<PaginatedData<MinimalCampus>> => {
    const searchParams = new URLSearchParams({ search: query });
    return apiClient.get<PaginatedData<MinimalCampus>>(
      `${endpoints.search.colleges}?${searchParams.toString()}`,
    );
  },

  searchIGTargets: async (query: string): Promise<PaginatedData<MinimalIG>> => {
    const searchParams = new URLSearchParams({ search: query });
    return apiClient.get<PaginatedData<MinimalIG>>(
      `${endpoints.dashboard.interestGroups}?${searchParams.toString()}`,
    );
  },

  searchCampusIGTargets: async (query: string): Promise<unknown> => {
    return eventsApi.searchCollaborationTargets(query, "campus_ig");
  },

  // ─── SCOPED FEEDS ───────────────────────────────────────────────────────
  igEvents: async (
    igId: string,
    params?: EventListQueryParams,
  ): Promise<EventListData> => {
    const qs = buildQueryString(params);
    return apiClient.get<EventListData>(`${endpoints.events.ig}${igId}/${qs}`);
  },

  clusterEvents: async (
    cluster: IGCluster,
    params?: EventListQueryParams,
  ): Promise<EventListData> => {
    const qs = buildQueryString(params);
    return apiClient.get<EventListData>(
      `${endpoints.events.ig}cluster/${cluster}/${qs}`,
    );
  },

  campusEvents: async (
    campusId: string,
    params?: EventListQueryParams,
  ): Promise<EventListData> => {
    const qs = buildQueryString(params);
    return apiClient.get<EventListData>(
      `${endpoints.events.campus}${campusId}/${qs}`,
    );
  },

  campusIgEvents: async (
    campusIgId: string,
    params?: EventListQueryParams,
  ): Promise<EventListData> => {
    const qs = buildQueryString(params);
    return apiClient.get<EventListData>(
      `${endpoints.events.campusIg}${campusIgId}/${qs}`,
    );
  },

  companyEvents: async (
    companyId: string,
    params?: EventListQueryParams,
  ): Promise<EventListData> => {
    const qs = buildQueryString(params);
    return apiClient.get<EventListData>(
      `${endpoints.events.company}${companyId}/${qs}`,
    );
  },

  // ─── ADMIN ENDPOINTS ─────────────────────────────────────────────────────
  adminList: async (params?: EventListQueryParams): Promise<EventListData> => {
    const qs = buildQueryString(params);
    let response = await apiClient.get<EventListData>(
      `${endpoints.events.admin}${qs}`,
    );
    response = mirrorEventTypeToCategoryList(response);

    if (params?.status === "cancelled" && response.data.length === 0) {
      const fallbackQs = buildQueryStringWithStatusOverride(params, "canceled");
      const fallbackResponse = await apiClient.get<EventListData>(
        `${endpoints.events.admin}${fallbackQs}`,
      );
      return mirrorEventTypeToCategoryList(fallbackResponse);
    }

    return response;
  },

  adminApprove: async (
    id: string,
    note?: string,
  ): Promise<EventMutationData> => {
    return apiClient.post<EventMutationData>(
      `${endpoints.events.admin}${id}/approve/`,
      {
        note,
      },
    );
  },

  adminReject: async (
    id: string,
    reason: string,
  ): Promise<EventMutationData> => {
    return apiClient.post<EventMutationData>(
      `${endpoints.events.admin}${id}/reject/`,
      {
        reason,
      },
    );
  },

  adminFeature: async (
    id: string,
    is_featured: boolean,
  ): Promise<EventMutationData> => {
    return apiClient.patch<EventMutationData>(
      `${endpoints.events.admin}${id}/feature/`,
      {
        is_featured,
      },
    );
  },

  // ─── META / FORM OPTIONS ────────────────────────────────────────────────
  getOrganizerOptions: async (): Promise<OrganizerOptionsResponse> => {
    return apiClient.get<OrganizerOptionsResponse>(
      endpoints.events.meta.organizerOptions,
    );
  },
};
