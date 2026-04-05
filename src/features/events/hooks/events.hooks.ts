"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ApiError } from "@/api/errors";
import { useDebounce } from "@/hooks/use-debounce";
import { eventsApi } from "../api";
import type {
  CollaborationTarget,
  CollaboratorInviteBody,
  CollaboratorType,
  EventDetailData,
  EventListData,
  EventListQueryParams,
  EventPatchBody,
  EventType,
  EventWriteBody,
  IGCluster,
  OrganizerOptionsResponse,
  ViewerInterestStatus,
} from "../types";
import { eventKeys } from "./query-keys";

type CollaborationTargetBucketKey = "ig" | "campus" | "company" | "campus_ig";

interface CollaborationTargetSourceShape {
  data?: unknown;
  response?: unknown;
  ig?: unknown;
  campus?: unknown;
  company?: unknown;
  campus_ig?: unknown;
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError && error.message) {
    return error.message;
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}

function isForbiddenPermissionError(error: unknown, message?: string): boolean {
  if (error instanceof ApiError && error.status === 403) {
    return true;
  }

  return Boolean(message && message.toLowerCase().includes("permission"));
}

export function resolveEventTypeValue(
  eventType?: string | null,
  categoryName?: string | null,
): EventType | undefined {
  if (eventType) {
    return eventType as EventType;
  }

  const normalized = categoryName?.trim().toLowerCase().replace(/\s+/g, "_");
  switch (normalized) {
    case "workshop":
    case "webinar":
    case "hackathon":
    case "meetup":
    case "competition":
    case "social_gathering":
    case "other":
      return normalized as EventType;
    default:
      return undefined;
  }
}

// Convert a datetime-local string (e.g. "2026-03-22T10:00") to a full ISO string in UTC.
export function toISOWithOffset(
  value: string | null | undefined,
): string | null {
  if (!value) return null;
  if (value.includes("+") || value.includes("Z")) return value;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

// Convert an API ISO string back to "YYYY-MM-DDTHH:mm" for datetime-local inputs.
export function toDatetimeLocal(iso: string | null | undefined): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (num: number) => num.toString().padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function normalizeTarget(
  item: unknown,
  collaboratorType?: CollaboratorType,
): CollaborationTarget | null {
  if (!item || typeof item !== "object") return null;

  const value = item as Record<string, unknown>;
  const id =
    (value.id as string | undefined) ??
    (value.ig_id as string | undefined) ??
    (value.org_id as string | undefined) ??
    (value.company_id as string | undefined) ??
    (value.campus_id as string | undefined) ??
    (value.campus_ig_id as string | undefined);
  const name =
    (value.name as string | undefined) ??
    (value.title as string | undefined) ??
    (value.ig_name as string | undefined) ??
    (value.org_name as string | undefined) ??
    (value.company_name as string | undefined);

  const targetType =
    (value.collaborator_type as CollaboratorType | undefined) ??
    collaboratorType ??
    "ig";

  if (!id || !name) return null;

  return {
    id,
    name,
    collaborator_type: targetType,
    logo: (value.logo as string | null | undefined) ?? null,
    icon: (value.icon as string | undefined) ?? undefined,
    code: (value.code as string | undefined) ?? undefined,
    title: (value.title as string | undefined) ?? undefined,
    org_type: (value.org_type as "College" | "School" | undefined) ?? undefined,
  };
}

function dedupeTargets(targets: CollaborationTarget[]): CollaborationTarget[] {
  const uniqueTargets = new Map<string, CollaborationTarget>();

  for (const target of targets) {
    if (!uniqueTargets.has(target.id)) {
      uniqueTargets.set(target.id, target);
    }
  }

  return Array.from(uniqueTargets.values());
}

export function normalizeCollaborationTargets(
  data: unknown,
): CollaborationTarget[] {
  if (!data || typeof data !== "object") {
    return [];
  }

  const shaped = data as CollaborationTargetSourceShape;
  const bucketKeys: CollaborationTargetBucketKey[] = [
    "ig",
    "campus",
    "campus_ig",
    "company",
  ];
  const hasBuckets = bucketKeys.some((key) => Array.isArray(shaped[key]));

  if (hasBuckets) {
    return dedupeTargets(
      bucketKeys.flatMap((type) => {
        const items = Array.isArray(shaped[type])
          ? (shaped[type] as unknown[])
          : [];
        return items
          .map((item) => normalizeTarget(item, type))
          .filter((item): item is CollaborationTarget => Boolean(item));
      }),
    );
  }

  if (Array.isArray(data)) {
    return dedupeTargets(
      data
        .map((item) => {
          if (!item || typeof item !== "object") return null;
          const value = item as Record<string, unknown>;
          const type =
            (value.collaborator_type as CollaboratorType | undefined) ?? "ig";
          return normalizeTarget(item, type);
        })
        .filter((item): item is CollaborationTarget => Boolean(item)),
    );
  }

  if (shaped.response && typeof shaped.response === "object") {
    return normalizeCollaborationTargets(shaped.response);
  }

  if (Array.isArray(shaped.data)) {
    return normalizeCollaborationTargets(shaped.data);
  }

  return [];
}

export function useEventsList(params?: EventListQueryParams) {
  return useQuery({
    queryKey: eventKeys.list(params ?? {}),
    queryFn: () => eventsApi.list(params),
  });
}

export function useFeaturedEvents(params?: EventListQueryParams) {
  return useQuery({
    queryKey: [...eventKeys.featured(), params ?? {}],
    queryFn: () => eventsApi.featured(params),
  });
}

export function useEventDetail(id?: string) {
  return useQuery({
    queryKey: eventKeys.detail(id as string),
    queryFn: () => eventsApi.detail(id as string),
    enabled: !!id,
  });
}

export function useManageEventsList(params?: EventListQueryParams) {
  return useQuery({
    queryKey: eventKeys.manageList(params ?? {}),
    queryFn: () => eventsApi.manageList(params),
  });
}

export function useManageEventDetail(id?: string) {
  return useQuery({
    queryKey: eventKeys.manageDetail(id as string),
    queryFn: () => eventsApi.manageDetail(id as string),
    enabled: !!id,
  });
}

export function useEventCoOwners(eventId?: string) {
  return useQuery({
    queryKey: eventKeys.coOwners(eventId as string),
    queryFn: () => eventsApi.getCoOwners(eventId as string),
    enabled: !!eventId,
  });
}

export function useEventCollaborators(eventId?: string) {
  return useQuery({
    queryKey: eventKeys.collaborators(eventId as string),
    queryFn: () => eventsApi.getCollaborators(eventId as string),
    enabled: !!eventId,
  });
}

export function useOrganizerOptions() {
  return useQuery<OrganizerOptionsResponse>({
    queryKey: eventKeys.organizerOptions(),
    queryFn: () => eventsApi.getOrganizerOptions(),
  });
}

export function useCollaborationTargets(
  search: string,
  type?: CollaboratorType,
) {
  const debouncedSearch = useDebounce(search, 300);
  return useQuery({
    queryKey: eventKeys.collaborationTargets({
      search: debouncedSearch,
      type,
    }),
    queryFn: () => eventsApi.searchCollaborationTargets(debouncedSearch, type),
    enabled: debouncedSearch.length >= 2,
  });
}

export function useCampusSearch(search: string) {
  const debouncedSearch = useDebounce(search, 300);
  return useQuery({
    queryKey: [...eventKeys.meta(), "campus-search", debouncedSearch],
    queryFn: () => eventsApi.searchCampusTargets(debouncedSearch),
    enabled: debouncedSearch.length >= 2,
  });
}

export function useIGSearch(search: string) {
  const debouncedSearch = useDebounce(search, 300);
  return useQuery({
    queryKey: [...eventKeys.meta(), "ig-search", debouncedSearch],
    queryFn: () => eventsApi.searchIGTargets(debouncedSearch),
    enabled: debouncedSearch.length >= 2,
  });
}

export function useIGEvents(igId?: string, params?: EventListQueryParams) {
  // Ready to consume - pending IG detail page implementation.
  return useQuery({
    queryKey: eventKeys.igFeed(igId as string, params ?? {}),
    queryFn: () => eventsApi.igEvents(igId as string, params),
    enabled: !!igId,
  });
}

export function useClusterEvents(
  cluster?: IGCluster,
  params?: EventListQueryParams,
) {
  return useQuery({
    queryKey: eventKeys.clusterFeed(cluster as IGCluster, params ?? {}),
    queryFn: () => eventsApi.clusterEvents(cluster as IGCluster, params),
    enabled: !!cluster,
  });
}

export function useCampusEvents(
  campusId?: string,
  params?: EventListQueryParams,
) {
  // Ready to consume - pending campus detail page implementation.
  return useQuery({
    queryKey: eventKeys.campusFeed(campusId as string, params ?? {}),
    queryFn: () => eventsApi.campusEvents(campusId as string, params),
    enabled: !!campusId,
  });
}

export function useCampusIgEvents(id?: string, params?: EventListQueryParams) {
  // Ready to consume - pending campus IG page implementation.
  return useQuery({
    queryKey: eventKeys.campusIgFeed(id as string, params ?? {}),
    queryFn: () => eventsApi.campusIgEvents(id as string, params),
    enabled: !!id,
  });
}

export function useCompanyEvents(id?: string, params?: EventListQueryParams) {
  // Ready to consume - pending company page implementation.
  return useQuery({
    queryKey: eventKeys.companyFeed(id as string, params ?? {}),
    queryFn: () => eventsApi.companyEvents(id as string, params),
    enabled: !!id,
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: EventWriteBody) => eventsApi.create(body),
    onSuccess: async () => {
      toast.success("Event created");
      await queryClient.invalidateQueries({ queryKey: eventKeys.all });
      await queryClient.refetchQueries({ queryKey: eventKeys.manageLists() });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to create event"));
    },
  });
}

export function useUpdateEvent(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: EventWriteBody) => eventsApi.update(eventId, body),
    onSuccess: async () => {
      toast.success("Event updated");
      await queryClient.invalidateQueries({ queryKey: eventKeys.all });
      await queryClient.invalidateQueries({ queryKey: eventKeys.manage() });
      await queryClient.invalidateQueries({
        queryKey: eventKeys.detail(eventId),
      });
      await queryClient.invalidateQueries({
        queryKey: eventKeys.manageDetail(eventId),
      });
      await queryClient.refetchQueries({ queryKey: eventKeys.manageLists() });
      await queryClient.refetchQueries({
        queryKey: eventKeys.manageDetail(eventId),
      });
      await queryClient.refetchQueries({ queryKey: eventKeys.all });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to update event"));
    },
  });
}

export function usePatchEvent(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: EventPatchBody) => eventsApi.patch(eventId, body),
    onSuccess: async (_data, _vars, _context) => {
      toast.success("Event updated");
      await queryClient.invalidateQueries({ queryKey: eventKeys.all });
      await queryClient.refetchQueries({
        queryKey: eventKeys.manageDetail(eventId),
      });
      await queryClient.refetchQueries({ queryKey: eventKeys.detail(eventId) });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to update event"));
    },
  });
}

export function useDeleteEvent(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => eventsApi.delete(eventId),
    onSuccess: () => {
      toast.success("Event cancelled");
      queryClient.invalidateQueries({ queryKey: eventKeys.all });
      queryClient.invalidateQueries({ queryKey: eventKeys.manage() });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to cancel event"));
    },
  });
}

export function usePublishEvent(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => eventsApi.publish(eventId),
    onSuccess: async () => {
      toast.success("Event submitted");
      await queryClient.invalidateQueries({
        queryKey: eventKeys.manageDetail(eventId),
      });
      await queryClient.invalidateQueries({
        queryKey: eventKeys.manageLists(),
      });
      await queryClient.refetchQueries({
        queryKey: eventKeys.manageDetail(eventId),
      });
      await queryClient.refetchQueries({ queryKey: eventKeys.manageLists() });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to publish event"));
    },
  });
}

export function useAddCoOwner(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: { user_id: string }) =>
      eventsApi.addCoOwner(eventId, body),
    onSuccess: async () => {
      toast.success("Co-owner added");
      await queryClient.invalidateQueries({
        queryKey: eventKeys.coOwners(eventId),
      });
      await queryClient.invalidateQueries({
        queryKey: eventKeys.manageDetail(eventId),
      });
      await queryClient.refetchQueries({
        queryKey: eventKeys.coOwners(eventId),
      });
      await queryClient.refetchQueries({
        queryKey: eventKeys.manageDetail(eventId),
      });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to add co-owner"));
    },
  });
}

export function useRemoveCoOwner(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (coOwnerId: string) =>
      eventsApi.removeCoOwner(eventId, coOwnerId),
    onSuccess: async () => {
      toast.success("Co-owner removed");
      await queryClient.invalidateQueries({
        queryKey: eventKeys.coOwners(eventId),
      });
      await queryClient.invalidateQueries({
        queryKey: eventKeys.manageDetail(eventId),
      });
      await queryClient.refetchQueries({
        queryKey: eventKeys.coOwners(eventId),
      });
      await queryClient.refetchQueries({
        queryKey: eventKeys.manageDetail(eventId),
      });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to remove co-owner"));
    },
  });
}

export function useInviteCollaborator(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CollaboratorInviteBody) =>
      eventsApi.inviteCollaborator(eventId, body),
    onSuccess: async () => {
      toast.success("Collaborator invited");
      await queryClient.invalidateQueries({
        queryKey: eventKeys.collaborators(eventId),
      });
      await queryClient.invalidateQueries({
        queryKey: eventKeys.manageDetail(eventId),
      });
      await queryClient.refetchQueries({
        queryKey: eventKeys.collaborators(eventId),
      });
      await queryClient.refetchQueries({
        queryKey: eventKeys.manageDetail(eventId),
      });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to invite collaborator"));
    },
  });
}

export function useAcceptCollaborator(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (collabId: string) =>
      eventsApi.acceptCollaborator(eventId, collabId),
    onSuccess: async () => {
      toast.success("Collaborator accepted");
      await queryClient.invalidateQueries({
        queryKey: eventKeys.collaborators(eventId),
      });
      await queryClient.invalidateQueries({
        queryKey: eventKeys.manageDetail(eventId),
      });
      await queryClient.refetchQueries({
        queryKey: eventKeys.collaborators(eventId),
      });
      await queryClient.refetchQueries({
        queryKey: eventKeys.manageDetail(eventId),
      });
    },
    onError: (error: unknown) => {
      const message = getErrorMessage(error, "Failed to accept collaborator");
      if (isForbiddenPermissionError(error, message)) {
        toast.error(
          "Only the lead of the invited entity can accept this invitation.",
        );
        return;
      }

      toast.error(message);
    },
  });
}

export function useRejectCollaborator(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ collabId, reason }: { collabId: string; reason: string }) =>
      eventsApi.rejectCollaborator(eventId, collabId, reason),
    onSuccess: async () => {
      toast.success("Collaborator rejected");
      await queryClient.invalidateQueries({
        queryKey: eventKeys.collaborators(eventId),
      });
      await queryClient.invalidateQueries({
        queryKey: eventKeys.manageDetail(eventId),
      });
      await queryClient.refetchQueries({
        queryKey: eventKeys.collaborators(eventId),
      });
      await queryClient.refetchQueries({
        queryKey: eventKeys.manageDetail(eventId),
      });
    },
    onError: (error: unknown) => {
      const message = getErrorMessage(error, "Failed to reject collaborator");
      if (error instanceof ApiError && error.status === 403) {
        toast.error(
          "Only the lead of the invited entity can reject this invitation.",
        );
        return;
      }

      toast.error(message);
    },
  });
}

export function useRemoveCollaborator(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (collabId: string) =>
      eventsApi.removeCollaborator(eventId, collabId),
    onSuccess: async () => {
      toast.success("Collaborator removed");
      await queryClient.invalidateQueries({
        queryKey: eventKeys.collaborators(eventId),
      });
      await queryClient.invalidateQueries({
        queryKey: eventKeys.manageDetail(eventId),
      });
      await queryClient.refetchQueries({
        queryKey: eventKeys.collaborators(eventId),
      });
      await queryClient.refetchQueries({
        queryKey: eventKeys.manageDetail(eventId),
      });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to remove collaborator"));
    },
  });
}

export function useToggleInterest(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation<
    unknown,
    unknown,
    ViewerInterestStatus | null,
    {
      previousDetail?: EventDetailData;
      previousListData?: Array<[readonly unknown[], EventListData | undefined]>;
    }
  >({
    mutationFn: (currentStatus: ViewerInterestStatus | null) =>
      currentStatus === "interested"
        ? eventsApi.removeInterest(eventId)
        : eventsApi.addInterest(eventId),
    onMutate: async (currentStatus) => {
      await queryClient.cancelQueries({ queryKey: eventKeys.detail(eventId) });
      await queryClient.cancelQueries({ queryKey: eventKeys.lists() });

      const previousDetail = queryClient.getQueryData<EventDetailData>(
        eventKeys.detail(eventId),
      );
      const previousListData = queryClient.getQueriesData<EventListData>({
        queryKey: eventKeys.lists(),
      });

      const isGoing = currentStatus !== "interested";
      queryClient.setQueryData<EventDetailData>(
        eventKeys.detail(eventId),
        (old) => {
          if (!old) return old;
          return {
            ...old,
            viewer_interest_status: isGoing ? "interested" : "none",
            interest_count: isGoing
              ? old.interest_count + 1
              : Math.max(0, old.interest_count - 1),
          };
        },
      );

      for (const [queryKey, listData] of previousListData) {
        if (!listData) continue;
        queryClient.setQueryData<EventListData>(queryKey, {
          ...listData,
          data: listData.data.map((event) => {
            if (event.id !== eventId) return event;
            return {
              ...event,
              viewer_interest_status: isGoing ? "interested" : "none",
              interest_count: isGoing
                ? event.interest_count + 1
                : Math.max(0, event.interest_count - 1),
            };
          }),
        });
      }

      return { previousDetail, previousListData };
    },
    onError: (error: unknown, _status, context) => {
      if (context?.previousDetail) {
        queryClient.setQueryData(
          eventKeys.detail(eventId),
          context.previousDetail,
        );
      }
      if (context?.previousListData) {
        for (const [queryKey, listData] of context.previousListData) {
          queryClient.setQueryData(queryKey, listData);
        }
      }
      toast.error(getErrorMessage(error, "Failed to update interest"));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.detail(eventId) });
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
    },
  });
}

export function useAdminApprove(eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (note?: string) => eventsApi.adminApprove(eventId, note),
    onSuccess: async () => {
      toast.success("Event approved");
      await queryClient.invalidateQueries({
        queryKey: eventKeys.manageDetail(eventId),
      });
      await queryClient.invalidateQueries({
        queryKey: eventKeys.manageLists(),
      });
      await queryClient.refetchQueries({
        queryKey: eventKeys.manageDetail(eventId),
      });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to approve event"));
    },
  });
}

export function useAdminReject(eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reason: string) => eventsApi.adminReject(eventId, reason),
    onSuccess: async () => {
      toast.success("Event returned to draft");
      await queryClient.invalidateQueries({
        queryKey: eventKeys.manageDetail(eventId),
      });
      await queryClient.invalidateQueries({
        queryKey: eventKeys.manageLists(),
      });
      await queryClient.refetchQueries({
        queryKey: eventKeys.manageDetail(eventId),
      });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to reject event"));
    },
  });
}

export function useAdminFeature(eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (isFeatured: boolean) =>
      eventsApi.adminFeature(eventId, isFeatured),
    onSuccess: async () => {
      toast.success("Featured status updated");
      await queryClient.invalidateQueries({
        queryKey: eventKeys.manageDetail(eventId),
      });
      await queryClient.invalidateQueries({ queryKey: eventKeys.featured() });
      await queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
      await queryClient.refetchQueries({
        queryKey: eventKeys.manageDetail(eventId),
      });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to update featured status"));
    },
  });
}
