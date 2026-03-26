"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ApiError } from "@/api/errors";
import { eventsApi } from "../api";
import type {
  CollaboratorInviteBody,
  EventDetailData,
  EventListQueryParams,
  EventPatchBody,
  EventWriteBody,
  IGCluster,
  ViewerInterestStatus,
} from "../types";

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
    queryKey: ["events", params],
    queryFn: () => eventsApi.list(params),
  });
}

export function useFeaturedEvents(params?: EventListQueryParams) {
  return useQuery({
    queryKey: ["events", "featured", params],
    queryFn: () => eventsApi.featured(params),
  });
}

export function useEventDetail(id?: string) {
  return useQuery({
    queryKey: ["event", id],
    queryFn: () => eventsApi.detail(id as string),
    enabled: !!id,
  });
}

export function useManageEventsList(params?: EventListQueryParams) {
  return useQuery({
    queryKey: ["manage-events", params],
    queryFn: () => eventsApi.manageList(params),
  });
}

export function useManageEventDetail(id?: string) {
  return useQuery({
    queryKey: ["manage-event", id],
    queryFn: () => eventsApi.manageDetail(id as string),
    enabled: !!id,
  });
}

export function useEventCoOwners(eventId?: string) {
  return useQuery({
    queryKey: ["event-co-owners", eventId],
    queryFn: () => eventsApi.getCoOwners(eventId as string),
    enabled: !!eventId,
  });
}

export function useEventCollaborators(eventId?: string) {
  return useQuery({
    queryKey: ["event-collaborators", eventId],
    queryFn: () => eventsApi.getCollaborators(eventId as string),
    enabled: !!eventId,
  });
}

export function useOrganizerOptions() {
  return useQuery({
    queryKey: ["organizer-options"],
    queryFn: () => eventsApi.getOrganizerOptions(),
  });
}

export function useIGEvents(igId?: string, params?: EventListQueryParams) {
  return useQuery({
    queryKey: ["ig-events", igId, params],
    queryFn: () => eventsApi.igEvents(igId as string, params),
    enabled: !!igId,
  });
}

export function useClusterEvents(
  cluster?: IGCluster,
  params?: EventListQueryParams,
) {
  return useQuery({
    queryKey: ["cluster-events", cluster, params],
    queryFn: () => eventsApi.clusterEvents(cluster as IGCluster, params),
    enabled: !!cluster,
  });
}

export function useCampusEvents(
  campusId?: string,
  params?: EventListQueryParams,
) {
  return useQuery({
    queryKey: ["campus-events", campusId, params],
    queryFn: () => eventsApi.campusEvents(campusId as string, params),
    enabled: !!campusId,
  });
}

export function useCampusIgEvents(id?: string, params?: EventListQueryParams) {
  return useQuery({
    queryKey: ["campus-ig-events", id, params],
    queryFn: () => eventsApi.campusIgEvents(id as string, params),
    enabled: !!id,
  });
}

export function useCompanyEvents(id?: string, params?: EventListQueryParams) {
  return useQuery({
    queryKey: ["company-events", id, params],
    queryFn: () => eventsApi.companyEvents(id as string, params),
    enabled: !!id,
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: EventWriteBody) => eventsApi.create(body),
    onSuccess: () => {
      toast.success("Event created");
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["manage-events"] });
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
    onSuccess: () => {
      toast.success("Event updated");
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["manage-events"] });
      queryClient.invalidateQueries({ queryKey: ["event", eventId] });
      queryClient.invalidateQueries({ queryKey: ["manage-event", eventId] });
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
    onSuccess: () => {
      toast.success("Event updated");
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["manage-events"] });
      queryClient.invalidateQueries({ queryKey: ["event", eventId] });
      queryClient.invalidateQueries({ queryKey: ["manage-event", eventId] });
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
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["manage-events"] });
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
    onSuccess: () => {
      toast.success("Event submitted");
      queryClient.invalidateQueries({ queryKey: ["manage-event", eventId] });
      queryClient.invalidateQueries({ queryKey: ["manage-events"] });
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
      queryClient.invalidateQueries({ queryKey: ["event-co-owners", eventId] });
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
      queryClient.invalidateQueries({ queryKey: ["event-co-owners", eventId] });
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
        queryKey: ["event-collaborators", eventId],
      });
      queryClient.invalidateQueries({ queryKey: ["manage-event", eventId] });
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
        queryKey: ["event-collaborators", eventId],
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
        queryKey: ["event-collaborators", eventId],
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
        queryKey: ["event-collaborators", eventId],
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
    { previousDetail?: EventDetailData }
  >({
    mutationFn: (currentStatus: ViewerInterestStatus | null) =>
      currentStatus === "interested"
        ? eventsApi.removeInterest(eventId)
        : eventsApi.addInterest(eventId),
    onMutate: async (currentStatus) => {
      await queryClient.cancelQueries({ queryKey: ["event", eventId] });

      const previousDetail = queryClient.getQueryData<EventDetailData>([
        "event",
        eventId,
      ]);

      const isGoing = currentStatus !== "interested";
      queryClient.setQueryData<EventDetailData>(["event", eventId], (old) => {
        if (!old) return old;
        return {
          ...old,
          viewer_interest_status: isGoing ? "interested" : "none",
          interest_count: isGoing
            ? old.interest_count + 1
            : Math.max(0, old.interest_count - 1),
        };
      });

      return { previousDetail };
    },
    onError: (error: unknown, _status, context) => {
      if (context?.previousDetail) {
        queryClient.setQueryData(["event", eventId], context.previousDetail);
      }
      toast.error(getErrorMessage(error, "Failed to update interest"));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["event", eventId] });
    },
  });
}
