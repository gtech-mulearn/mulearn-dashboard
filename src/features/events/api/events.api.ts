import { apiClient, endpoints } from "@/api";
import type { ApprovalTier } from "../lib/events.policy";
import { categoryListResponseSchema, eventTypeScopeSchema } from "../schemas";
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
  PendingInvitesData,
} from "../types";

type EventOrganizerShape = {
  type?: string;
  ig?: unknown;
  campus?: unknown;
  company?: unknown;
  campus_ig_id?: string | null;
  organiser_type?: string;
  organiser_ig?: unknown;
  organiser_campus?: unknown;
  organiser_company?: unknown;
  organiser_ci_id?: string | null;
};

type EventShape = {
  id?: string;
  status?: string | null;
  start_datetime?: string;
  end_datetime?: string;
  event_type?: string | null;
  category_name?: string | null;
  organizer?: EventOrganizerShape;
};

const PENDING_STATUS_GROUP = [
  "pending_approval",
  "pending_campus_approval",
  "pending_mentor_approval",
] as const;

// Used as perPage when we need all records; proper pagination is not available for these endpoints.
const FETCH_ALL_LIMIT = 200;

// Compatibility shim:
// If the backend returns event_type but omits category_name, mirror it here so
// existing event views keep showing the selected type after refresh.
function mirrorEventTypeToCategory<T extends EventShape>(event: T): T {
  if (!event || typeof event !== "object") {
    return event;
  }

  const eventType = event.event_type ?? null;
  const categoryName = event.category_name ?? null;

  // Normalize organizer properties if they use the 'organiser_' prefix
  const org = event.organizer;
  if (org && typeof org === "object") {
    if (org.type === undefined && org.organiser_type !== undefined) {
      org.type = org.organiser_type;
    }
    if (org.ig === undefined && org.organiser_ig !== undefined) {
      org.ig = org.organiser_ig;
    }
    if (org.campus === undefined && org.organiser_campus !== undefined) {
      org.campus = org.organiser_campus;
    }
    if (org.company === undefined && org.organiser_company !== undefined) {
      org.company = org.organiser_company;
    }
    if (org.campus_ig_id === undefined && org.organiser_ci_id !== undefined) {
      org.campus_ig_id = org.organiser_ci_id;
    }
  }

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
  if (params.event_scope) searchParams.set("event_scope", params.event_scope);
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
  if (params.event_scope) searchParams.set("event_scope", params.event_scope);
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

function paginateItems<T>(
  items: T[],
  pageIndex: number,
  perPage: number,
): PaginatedData<T> {
  const start = (pageIndex - 1) * perPage;
  const data = items.slice(start, start + perPage);
  const count = items.length;
  const totalPages = Math.max(1, Math.ceil(count / perPage));

  return {
    data,
    pagination: {
      count,
      totalPages,
      isNext: pageIndex < totalPages,
      isPrev: pageIndex > 1,
      nextPage: pageIndex < totalPages ? pageIndex + 1 : null,
    },
  };
}

function dedupeById<T extends { id?: string }>(items: T[]): T[] {
  const unique = new Map<string, T>();

  for (const item of items) {
    if (!item?.id) continue;
    if (!unique.has(item.id)) {
      unique.set(item.id, item);
    }
  }

  return Array.from(unique.values());
}

function isOngoingByTime(event: EventShape): boolean {
  if (!event.start_datetime || !event.end_datetime) return false;
  const start = new Date(event.start_datetime).getTime();
  const end = new Date(event.end_datetime).getTime();
  if (Number.isNaN(start) || Number.isNaN(end)) return false;

  const now = Date.now();
  return start <= now && now < end;
}

function isCompletedByTime(event: EventShape): boolean {
  if (!event.end_datetime) return false;
  const end = new Date(event.end_datetime).getTime();
  if (Number.isNaN(end)) return false;
  return end <= Date.now();
}

async function fetchListWithStatusFallback(
  endpoint: string,
  params?: EventListQueryParams,
): Promise<EventListData> {
  const qs = buildQueryString(params);
  let response = await apiClient.get<EventListData>(`${endpoint}${qs}`);
  response = mirrorEventTypeToCategoryList(response);

  const status = params?.status;
  if (!status) {
    return response;
  }

  const pageIndex = params?.pageIndex ?? 1;
  const perPage = params?.perPage ?? 12;

  // Pending tab should include all pending states used across approval flows.
  if (status === "pending_approval") {
    const fallbackParams = {
      ...params,
      pageIndex: 1,
      perPage: FETCH_ALL_LIMIT,
    };

    const groupedResponses = await Promise.all(
      PENDING_STATUS_GROUP.map((pendingStatus) =>
        apiClient
          .get<EventListData>(
            `${endpoint}${buildQueryStringWithStatusOverride(fallbackParams, pendingStatus)}`,
          )
          .then((data) => mirrorEventTypeToCategoryList(data)),
      ),
    );

    const merged = dedupeById(groupedResponses.flatMap((item) => item.data));
    return paginateItems(merged, pageIndex, perPage);
  }

  // Some deployments use American spelling in query parsing (`canceled`).
  if (status === "cancelled" && response.data.length === 0) {
    const fallbackQs = buildQueryStringWithStatusOverride(params, "canceled");
    const fallbackResponse = await apiClient.get<EventListData>(
      `${endpoint}${fallbackQs}`,
    );
    return mirrorEventTypeToCategoryList(fallbackResponse);
  }

  // Some environments may not auto-transition published events to ongoing/completed.
  if (
    (status === "ongoing" || status === "completed") &&
    response.data.length === 0
  ) {
    const publishedFallbackParams: EventListQueryParams = {
      ...params,
      status: "published",
      pageIndex: 1,
      perPage: FETCH_ALL_LIMIT,
      sortBy: "-start_datetime",
    };

    const publishedResponse = await apiClient.get<EventListData>(
      `${endpoint}${buildQueryString(publishedFallbackParams)}`,
    );
    const normalizedPublished =
      mirrorEventTypeToCategoryList(publishedResponse);

    const filtered = normalizedPublished.data.filter((event) =>
      status === "ongoing" ? isOngoingByTime(event) : isCompletedByTime(event),
    );

    return paginateItems(filtered, pageIndex, perPage);
  }

  return response;
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
    return fetchListWithStatusFallback(endpoints.events.manage, params);
  },

  create: async (
    body: EventWriteBody | FormData,
  ): Promise<EventMutationData> => {
    const isFormData = body instanceof FormData;
    const response = await apiClient.post<EventMutationData>(
      endpoints.events.manage,
      body,
      undefined,
      { isFormData },
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
    body: EventPatchBody | FormData,
  ): Promise<EventMutationData> => {
    const isFormData = body instanceof FormData;
    const response = await apiClient.patch<EventMutationData>(
      `${endpoints.events.manage}${id}/`,
      body,
      undefined,
      { isFormData },
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
  getMyInvites: async (): Promise<PendingInvitesData> => {
    return apiClient.get<PendingInvitesData>(endpoints.events.myInvites);
  },

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
    return fetchListWithStatusFallback(endpoints.events.admin, params);
  },

  approveEvent: async (
    id: string,
    tier: ApprovalTier,
    note?: string,
  ): Promise<EventMutationData> => {
    return apiClient.post<EventMutationData>(
      `${endpoints.events[tier]}${id}/approve/`,
      { note },
    );
  },

  rejectEvent: async (
    id: string,
    tier: ApprovalTier,
    reason: string,
  ): Promise<EventMutationData> => {
    return apiClient.post<EventMutationData>(
      `${endpoints.events[tier]}${id}/reject/`,
      { reason },
    );
  },

  // Back-compat thin delegators (DRY).
  adminApprove: async (id: string, note?: string): Promise<EventMutationData> =>
    eventsApi.approveEvent(id, "admin", note),

  adminReject: async (id: string, reason: string): Promise<EventMutationData> =>
    eventsApi.rejectEvent(id, "admin", reason),

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

  getCategories: async (): Promise<
    Array<{ id: string; name: string; description: string }>
  > => {
    const envelope = await apiClient.get(
      endpoints.events.meta.categories,
      categoryListResponseSchema,
    );
    return envelope.response;
  },

  getEventTypeScope: async (): Promise<{
    event_type: string[];
    event_scope: string[];
  }> => {
    return apiClient.get(endpoints.events.eventTypeScope, eventTypeScopeSchema);
  },

  /**
   * Fetch the distinct IG cluster slugs via the event-type/scope endpoint.
   * Falls back to a hardcoded list of the four canonical clusters
   * (Maker, Coder, Manager, Creative) if the endpoint fails or returns an
   * unexpected shape.
   */
  getIGClusters: async (): Promise<Array<{ label: string; value: string }>> => {
    try {
      const data = await eventsApi.getEventTypeScope();
      return [
        { label: "All", value: "all" },
        ...data.event_scope.map((scope) => ({
          label: scope,
          value: scope.toLowerCase(),
        })),
      ];
    } catch (err) {
      if (process.env.NODE_ENV === "development") {
        console.warn(
          "[events] getIGClusters: fetch failed, using fallback:",
          err,
        );
      }
    }

    return [
      { label: "All", value: "all" },
      { label: "Maker", value: "maker" },
      { label: "Coder", value: "coder" },
      { label: "Manager", value: "manager" },
      { label: "Creative", value: "creative" },
    ];
  },
};
