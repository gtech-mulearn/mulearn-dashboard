"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ApiError } from "@/api/errors";
import { useDebounce } from "@/hooks/use-debounce";
import { getApiResponseError } from "@/hooks/use-get-error";
import { eventsApi } from "../api";
import type { ApprovalTier } from "../lib/events.policy";
import type {
  CollaboratorInviteBody,
  CollaboratorType,
  EventCollaborator,
  EventDetailData,
  EventListData,
  EventListQueryParams,
  EventPatchBody,
  EventWriteBody,
  IGCluster,
  OrganizerOptionsResponse,
  ViewerInterestStatus,
} from "../types";
import { eventKeys } from "./query-keys";

function isForbiddenPermissionError(error: unknown, message?: string): boolean {
  if (error instanceof ApiError && error.status === 403) {
    return true;
  }

  return Boolean(message?.toLowerCase().includes("permission"));
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

export interface PendingCollaboratorInvite {
  eventId: string;
  eventTitle: string;
  eventStartDatetime: string | null;
  eventCoverImage: string | null;
  collaborator: EventCollaborator;
}
export function usePendingCollaboratorInvites() {
  const invitesQuery = useQuery({
    queryKey: eventKeys.pendingCollaboratorInvites("global"),
    queryFn: () => eventsApi.getMyInvites(),
  });

  const pendingInvites: PendingCollaboratorInvite[] = (invitesQuery.data ?? [])
    .filter((invite) => invite.invite_status === "pending")
    .map((invite) => ({
      eventId: invite.event_id,
      eventTitle: invite.event_title,
      eventStartDatetime: invite.event_start_datetime,
      eventCoverImage: invite.event_cover_image,
      collaborator: {
        id: invite.id,
        entity_type: invite.entity_type,
        entity_id: invite.entity_id,
        entity_detail: invite.entity_detail,
        role_label: invite.role_label,
        invite_status: invite.invite_status,
        rejection_reason: invite.rejection_reason,
        responded_at: invite.responded_at,
        created_at: invite.created_at,
      },
    }))
    .sort((a, b) => {
      const left = new Date(a.collaborator.created_at ?? 0).getTime();
      const right = new Date(b.collaborator.created_at ?? 0).getTime();
      return right - left;
    });

  return {
    pendingInvites,
    pendingCount: pendingInvites.length,
    isLoading: invitesQuery.isLoading,
    isError: invitesQuery.isError,
    error: invitesQuery.error,
  };
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
  // Ready to consume - pending IG detail page integration.
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
  // Stub hook: ready for campus detail page integration.
  return useQuery({
    queryKey: eventKeys.campusFeed(campusId as string, params ?? {}),
    queryFn: () => eventsApi.campusEvents(campusId as string, params),
    enabled: !!campusId,
  });
}

export function useCampusIgEvents(id?: string, params?: EventListQueryParams) {
  // Stub hook: ready for campus IG page integration.
  return useQuery({
    queryKey: eventKeys.campusIgFeed(id as string, params ?? {}),
    queryFn: () => eventsApi.campusIgEvents(id as string, params),
    enabled: !!id,
  });
}

export function useCompanyEvents(id?: string, params?: EventListQueryParams) {
  // Stub hook: ready for company page integration.
  return useQuery({
    queryKey: eventKeys.companyFeed(id as string, params ?? {}),
    queryFn: () => eventsApi.companyEvents(id as string, params),
    enabled: !!id,
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: EventWriteBody | FormData) => eventsApi.create(body),
    onSuccess: async () => {
      toast.success("Event created");
      await queryClient.invalidateQueries({ queryKey: eventKeys.all });
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, { fallback: "Failed to create event" }),
      );
    },
  });
}

export function usePatchEvent(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: EventPatchBody | FormData) =>
      eventsApi.patch(eventId, body),
    onSuccess: async (_data, _vars, _context) => {
      toast.success("Event updated");
      await queryClient.invalidateQueries({ queryKey: eventKeys.all });
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, { fallback: "Failed to update event" }),
      );
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
    onError: (error) => {
      toast.error(
        getApiResponseError(error, { fallback: "Failed to cancel event" }),
      );
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
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, { fallback: "Failed to publish event" }),
      );
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
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, { fallback: "Failed to add co-owner" }),
      );
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
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, { fallback: "Failed to remove co-owner" }),
      );
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
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to invite collaborator",
        }),
      );
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
    },
    onError: (error) => {
      const message = getApiResponseError(error, {
        fallback: "Failed to accept collaborator",
      });
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

export function useAcceptCollaboratorInvite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      eventId,
      collabId,
    }: {
      eventId: string;
      collabId: string;
    }) => eventsApi.acceptCollaborator(eventId, collabId),
    onSuccess: async (_data, variables) => {
      toast.success("Collaborator accepted");
      await queryClient.invalidateQueries({ queryKey: eventKeys.manage() });
      await queryClient.invalidateQueries({ queryKey: eventKeys.admin() });
      await queryClient.invalidateQueries({
        queryKey: eventKeys.collaborators(variables.eventId),
      });
      await queryClient.invalidateQueries({
        queryKey: eventKeys.manageDetail(variables.eventId),
      });
    },
    onError: (error) => {
      const message = getApiResponseError(error, {
        fallback: "Failed to accept collaborator",
      });
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
    },
    onError: (error) => {
      const message = getApiResponseError(error, {
        fallback: "Failed to reject collaborator",
      });
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

export function useRejectCollaboratorInvite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      eventId,
      collabId,
      reason,
    }: {
      eventId: string;
      collabId: string;
      reason?: string;
    }) => eventsApi.rejectCollaborator(eventId, collabId, reason),
    onSuccess: async (_data, variables) => {
      toast.success("Collaborator rejected");
      await queryClient.invalidateQueries({ queryKey: eventKeys.manage() });
      await queryClient.invalidateQueries({ queryKey: eventKeys.admin() });
      await queryClient.invalidateQueries({
        queryKey: eventKeys.collaborators(variables.eventId),
      });
      await queryClient.invalidateQueries({
        queryKey: eventKeys.manageDetail(variables.eventId),
      });
    },
    onError: (error) => {
      const message = getApiResponseError(error, {
        fallback: "Failed to reject collaborator",
      });
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
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to remove collaborator",
        }),
      );
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
      toast.error(
        getApiResponseError(error, { fallback: "Failed to update interest" }),
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.detail(eventId) });
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
    },
  });
}

export function useEventApproval(eventId: string) {
  const queryClient = useQueryClient();

  const invalidate = async () => {
    await queryClient.invalidateQueries({
      queryKey: eventKeys.manageDetail(eventId),
    });
    await queryClient.invalidateQueries({ queryKey: eventKeys.manageLists() });
  };

  const approve = useMutation({
    mutationFn: ({ tier, note }: { tier: ApprovalTier; note?: string }) =>
      eventsApi.approveEvent(eventId, tier, note),
    onSuccess: async () => {
      toast.success("Event approved");
      await invalidate();
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, { fallback: "Failed to approve event" }),
      );
    },
  });

  const reject = useMutation({
    mutationFn: ({ tier, reason }: { tier: ApprovalTier; reason: string }) =>
      eventsApi.rejectEvent(eventId, tier, reason),
    onSuccess: async () => {
      toast.success("Event sent back");
      await invalidate();
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, { fallback: "Failed to reject event" }),
      );
    },
  });

  return { approve, reject };
}

export function useAdminApprove(eventId: string) {
  const { approve } = useEventApproval(eventId);
  return {
    ...approve,
    mutate: (note?: string, options?: Parameters<typeof approve.mutate>[1]) =>
      approve.mutate({ tier: "admin", note }, options),
  };
}

export function useAdminReject(eventId: string) {
  const { reject } = useEventApproval(eventId);
  return {
    ...reject,
    mutate: (reason: string, options?: Parameters<typeof reject.mutate>[1]) =>
      reject.mutate({ tier: "admin", reason }, options),
  };
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
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to update featured status",
        }),
      );
    },
  });
}
