"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ApiError } from "@/api/errors";
import { useDebounce } from "@/hooks/use-debounce";
import { eventsApi } from "../api";
import { COLLABORATOR_INVITE_TYPE_MAP } from "../constants";
import type {
  CollaboratorEntityType,
  CollaboratorInviteBody,
  CollaboratorType,
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

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError && error.message) {
    return error.message;
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
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
  const entityType = type
    ? (COLLABORATOR_INVITE_TYPE_MAP[type] as CollaboratorEntityType)
    : undefined;
  return useQuery({
    queryKey: eventKeys.collaborationTargets({
      search: debouncedSearch,
      type: entityType,
    }),
    queryFn: () =>
      eventsApi.searchCollaborationTargets(debouncedSearch, entityType),
    enabled: debouncedSearch.length >= 2,
  });
}

export function useUserSearch(query: string) {
  const debouncedQuery = useDebounce(query, 300);
  return useQuery({
    queryKey: eventKeys.userSearch(debouncedQuery),
    queryFn: () => eventsApi.searchUsers(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
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
      await queryClient.invalidateQueries({ queryKey: eventKeys.manage() });
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
    onSuccess: () => {
      toast.success("Co-owner added");
      queryClient.invalidateQueries({ queryKey: eventKeys.coOwners(eventId) });
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
    onSuccess: () => {
      toast.success("Co-owner removed");
      queryClient.invalidateQueries({ queryKey: eventKeys.coOwners(eventId) });
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
    onSuccess: () => {
      toast.success("Collaborator invited");
      queryClient.invalidateQueries({
        queryKey: eventKeys.collaborators(eventId),
      });
      queryClient.invalidateQueries({
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
    onSuccess: () => {
      toast.success("Collaborator accepted");
      queryClient.invalidateQueries({
        queryKey: eventKeys.collaborators(eventId),
      });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to accept collaborator"));
    },
  });
}

export function useRejectCollaborator(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ collabId, reason }: { collabId: string; reason: string }) =>
      eventsApi.rejectCollaborator(eventId, collabId, reason),
    onSuccess: () => {
      toast.success("Collaborator rejected");
      queryClient.invalidateQueries({
        queryKey: eventKeys.collaborators(eventId),
      });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to reject collaborator"));
    },
  });
}

export function useRemoveCollaborator(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (collabId: string) =>
      eventsApi.removeCollaborator(eventId, collabId),
    onSuccess: () => {
      toast.success("Collaborator removed");
      queryClient.invalidateQueries({
        queryKey: eventKeys.collaborators(eventId),
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
