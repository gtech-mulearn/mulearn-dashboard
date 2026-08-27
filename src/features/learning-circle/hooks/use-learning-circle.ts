/**
 * Learning Circle Hooks
 *
 * 📍 src/features/learning-circle/hooks/use-learning-circle.ts
 *
 * React Query hooks for Learning Circle data.
 */

"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { getApiResponseError } from "@/hooks/use-get-error";
import {
  approveMember,
  createCircle,
  createMeeting,
  deleteAttendeeReport,
  deleteCircle,
  deleteMeeting,
  deleteMeetingReport,
  editCircle,
  editMeeting,
  getAttendeeReport,
  getCircleDetail,
  getCircleMeetings,
  getCircleMembers,
  getCircles,
  getInviteByLink,
  getJoinRequests,
  getMeetingDetail,
  getMeetingReport,
  getMyPendingInvites,
  getPublicMeetings,
  getSentInvites,
  getUserCircles,
  getUserMeetings,
  joinCircle,
  joinMeeting,
  leaveCircle,
  leaveMeeting,
  removeMember,
  removeRsvpMeeting,
  respondToInvite,
  respondToInviteByLink,
  respondToJoinRequest,
  revokeInvite,
  rsvpMeeting,
  sendInvite,
  submitAttendeeReport,
  submitMeetingReport,
  transferLead,
} from "../api";
import type {
  ApproveMemberRequest,
  AttendeeReportRequest,
  CreateCircleRequest,
  CreateMeetingRequest,
  EditCircleRequest,
  InviteResponseRequest,
  JoinMeetingRequest,
  Meeting,
  MeetingReportRequest,
  RemoveMemberRequest,
  RespondJoinRequest,
  SendInviteRequest,
  TransferLeadRequest,
} from "../schemas";
import { learningCircleKeys } from "./query-keys";

const STALE_TIME = 5 * 60 * 1000; // 5 minutes

// ============================================
// Circle Queries
// ============================================

const CIRCLES_PER_PAGE = 12;

export function useCircles(
  search = "",
  page = 1,
  filters?: { status?: "joined" | "pending" | "not_joined"; ig?: string },
) {
  return useQuery({
    queryKey: learningCircleKeys.circleList({ search, page, ...filters }),
    queryFn: () =>
      getCircles({
        search: search || undefined,
        page,
        perPage: CIRCLES_PER_PAGE,
        status: filters?.status,
        ig: filters?.ig,
      }),
    placeholderData: keepPreviousData,
    staleTime: STALE_TIME,
  });
}

export function useUserCircles() {
  return useQuery({
    queryKey: learningCircleKeys.userCircles(),
    queryFn: () => getUserCircles(),
    staleTime: STALE_TIME,
  });
}

export function useActiveInvites() {
  const {
    data: invites,
    isLoading: invitesLoading,
    error: invitesError,
  } = useMyPendingInvites();
  const {
    data: userCircles,
    isLoading: circlesLoading,
    error: circlesError,
  } = useUserCircles();

  const joinedCircleIds = useMemo(() => {
    return new Set(userCircles?.map((c) => c.id) ?? []);
  }, [userCircles]);

  const activeInvites = useMemo(() => {
    if (!invites) return [];
    return invites.filter((inv) => {
      if (!inv.circle_id) return true;
      return !joinedCircleIds.has(inv.circle_id);
    });
  }, [invites, joinedCircleIds]);

  const activeInvitesCount = activeInvites.length;

  return {
    activeInvites,
    activeInvitesCount,
    joinedCircleIds,
    isLoading: invitesLoading || circlesLoading,
    isError: !!(invitesError || circlesError),
  };
}

export function useCircleDetail(circleId: string) {
  return useQuery({
    queryKey: learningCircleKeys.circleDetail(circleId),
    queryFn: () => getCircleDetail(circleId),
    staleTime: STALE_TIME,
    enabled: !!circleId,
  });
}

export function useCircleMembers(circleId: string) {
  return useQuery({
    queryKey: learningCircleKeys.circleMembers(circleId),
    queryFn: () => getCircleMembers(circleId),
    staleTime: STALE_TIME,
    enabled: !!circleId,
  });
}

// ============================================
// Meeting Queries
// ============================================

export function useCircleMeetings(circleId: string) {
  return useQuery({
    queryKey: learningCircleKeys.meetingsByCircle(circleId),
    queryFn: () => getCircleMeetings(circleId),
    staleTime: STALE_TIME,
    enabled: !!circleId,
  });
}

export function usePublicMeetings(params?: {
  ig_id?: string;
  page?: number;
  perPage?: number;
  search?: string;
}) {
  return useQuery({
    queryKey: learningCircleKeys.meetingsPublic(params),
    queryFn: () => getPublicMeetings(params),
    placeholderData: keepPreviousData,
    staleTime: STALE_TIME,
  });
}

export function useUserMeetings(params?: {
  saved?: boolean;
  participated?: boolean;
  category?: string;
}) {
  return useQuery({
    queryKey: learningCircleKeys.meetingsUser(params),
    queryFn: () => getUserMeetings(params),
    staleTime: STALE_TIME,
  });
}

export function useMeetingDetail(meetingId: string) {
  return useQuery({
    queryKey: learningCircleKeys.meetingDetail(meetingId),
    queryFn: () => getMeetingDetail(meetingId),
    staleTime: STALE_TIME,
    enabled: !!meetingId,
  });
}

// ============================================
// Circle Mutations
// ============================================

export function useCreateCircle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCircleRequest) => createCircle(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...learningCircleKeys.circles(), "list"],
        exact: false,
      });
      toast.success("Learning circle created successfully!");
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to create learning circle",
        }),
      );
    },
  });
}

export function useEditCircle(circleId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: EditCircleRequest) => editCircle(circleId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: learningCircleKeys.circleDetail(circleId),
      });
      queryClient.invalidateQueries({
        queryKey: [...learningCircleKeys.circles(), "list"],
        exact: false,
      });
      toast.success("Circle updated successfully");
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, { fallback: "Failed to update circle" }),
      );
    },
  });
}

export function useDeleteCircle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (circleId: string) => deleteCircle(circleId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...learningCircleKeys.circles(), "list"],
        exact: false,
      });
      toast.success("Circle deleted successfully");
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, { fallback: "Failed to delete circle" }),
      );
    },
  });
}

// ============================================
// Member Management Mutations
// ============================================

export function useApproveMember(circleId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ApproveMemberRequest) => approveMember(circleId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: learningCircleKeys.circleMembers(circleId),
      });
      queryClient.invalidateQueries({
        queryKey: learningCircleKeys.circleDetail(circleId),
      });
      toast.success("Member status updated");
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to update member status",
        }),
      );
    },
  });
}

/** Lead/creator: pending join requests for a circle. */
export function useJoinRequests(circleId: string, enabled = true) {
  return useQuery({
    queryKey: learningCircleKeys.joinRequests(circleId),
    queryFn: () => getJoinRequests(circleId),
    enabled: enabled && !!circleId,
    staleTime: STALE_TIME,
  });
}

/** Lead/creator: accept or reject a pending join request. */
export function useRespondToJoinRequest(circleId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RespondJoinRequest) =>
      respondToJoinRequest(circleId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: learningCircleKeys.joinRequests(circleId),
      });
      queryClient.invalidateQueries({
        queryKey: learningCircleKeys.sentInvites(circleId),
      });
      queryClient.invalidateQueries({
        queryKey: learningCircleKeys.circleMembers(circleId),
      });
      queryClient.invalidateQueries({
        queryKey: learningCircleKeys.circleDetail(circleId),
      });
      toast.success(
        variables.action === "accept"
          ? "Join request accepted"
          : "Request / invitation updated",
      );
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to update join request",
        }),
      );
    },
  });
}

export function useTransferLead(circleId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TransferLeadRequest) => transferLead(circleId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: learningCircleKeys.circleMembers(circleId),
      });
      queryClient.invalidateQueries({
        queryKey: learningCircleKeys.circleDetail(circleId),
      });
      toast.success("Lead role transferred successfully");
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to transfer lead role",
        }),
      );
    },
  });
}

/** Lead/creator: remove (kick) a member from the circle. */
export function useRemoveMember(circleId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RemoveMemberRequest) => removeMember(circleId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: learningCircleKeys.circleMembers(circleId),
      });
      queryClient.invalidateQueries({
        queryKey: learningCircleKeys.circleDetail(circleId),
      });
      toast.success("Member removed from circle");
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, { fallback: "Failed to remove member" }),
      );
    },
  });
}

/** Member: leave a circle (creator/lead cannot use this — must transfer/delete). */
export function useLeaveCircle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (circleId: string) => leaveCircle(circleId),
    onSuccess: (_, circleId) => {
      unmarkCircleAsRequested(circleId);
      queryClient.invalidateQueries({
        queryKey: learningCircleKeys.circleDetail(circleId),
      });
      queryClient.invalidateQueries({
        queryKey: learningCircleKeys.circleMembers(circleId),
      });
      queryClient.invalidateQueries({
        queryKey: learningCircleKeys.userCircles(),
      });
      queryClient.invalidateQueries({
        queryKey: [...learningCircleKeys.circles(), "list"],
        exact: false,
      });
      toast.success("You have left the circle");
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, { fallback: "Failed to leave circle" }),
      );
    },
  });
}

// ============================================
// Join & Invite
// ============================================

// Local session cache/store for tracking pending join requests
const pendingJoinCircleIds = new Set<string>();
const pendingJoinListeners = new Set<() => void>();

export function markCircleAsRequested(circleId: string) {
  pendingJoinCircleIds.add(circleId);
  pendingJoinListeners.forEach((listener) => {
    listener();
  });
}

export function unmarkCircleAsRequested(circleId: string) {
  pendingJoinCircleIds.delete(circleId);
  pendingJoinListeners.forEach((listener) => {
    listener();
  });
}

export function useIsCirclePendingJoin(circleId: string) {
  const [isPending, setIsPending] = useState(() =>
    pendingJoinCircleIds.has(circleId),
  );

  useEffect(() => {
    const update = () => setIsPending(pendingJoinCircleIds.has(circleId));
    pendingJoinListeners.add(update);
    return () => {
      pendingJoinListeners.delete(update);
    };
  }, [circleId]);

  return isPending;
}

export function useJoinCircle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (circleId: string) => joinCircle(circleId),
    onSuccess: (_, circleId) => {
      markCircleAsRequested(circleId);
      queryClient.invalidateQueries({
        queryKey: learningCircleKeys.circleDetail(circleId),
      });
      queryClient.invalidateQueries({
        queryKey: learningCircleKeys.circleMembers(circleId),
      });
      toast.success("Join request sent!");
    },
    onError: (error, circleId) => {
      const errMsg = getApiResponseError(error, {
        fallback: "Failed to send join request",
      });
      const lowerMsg = errMsg.toLowerCase();

      if (
        lowerMsg.includes("already sent") ||
        lowerMsg.includes("waiting for lead approval")
      ) {
        markCircleAsRequested(circleId);
        toast.warning(errMsg);
      } else {
        toast.error(errMsg);
      }
    },
  });
}

export function useSendInvite(circleId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SendInviteRequest) => sendInvite(circleId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: learningCircleKeys.sentInvites(circleId),
      });
      toast.success("Invite sent successfully!");
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, { fallback: "Failed to send invite" }),
      );
    },
  });
}

export function useSentInvites(circleId: string) {
  return useQuery({
    queryKey: learningCircleKeys.sentInvites(circleId),
    queryFn: () => getSentInvites(circleId),
    staleTime: STALE_TIME,
    enabled: !!circleId,
  });
}

export function useRevokeInvite(circleId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (linkId: string) => revokeInvite(circleId, linkId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: learningCircleKeys.sentInvites(circleId),
      });
      queryClient.invalidateQueries({
        queryKey: learningCircleKeys.circleMembers(circleId),
      });
      toast.success("Invitation revoked successfully");
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, { fallback: "Failed to revoke invitation" }),
      );
    },
  });
}

export function useMyPendingInvites() {
  return useQuery({
    queryKey: learningCircleKeys.myPendingInvites(),
    queryFn: getMyPendingInvites,
    staleTime: STALE_TIME,
  });
}

export function useRespondToInvite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: InviteResponseRequest & { id: string }) =>
      respondToInvite(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: learningCircleKeys.myPendingInvites(),
      });
      queryClient.invalidateQueries({
        queryKey: [...learningCircleKeys.circles(), "list"],
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: learningCircleKeys.userCircles(),
      });
      toast.success("Invite response submitted");
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, { fallback: "Failed to respond to invite" }),
      );
    },
  });
}

export function useInviteByLink(linkId: string) {
  return useQuery({
    queryKey: learningCircleKeys.inviteByLink(linkId),
    queryFn: () => getInviteByLink(linkId),
    staleTime: STALE_TIME,
    enabled: !!linkId,
  });
}

export function useRespondToInviteByLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      linkId,
      data,
    }: {
      linkId: string;
      data: InviteResponseRequest;
    }) => respondToInviteByLink(linkId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: learningCircleKeys.myPendingInvites(),
      });
      queryClient.invalidateQueries({
        queryKey: [...learningCircleKeys.circles(), "list"],
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: learningCircleKeys.userCircles(),
      });
      toast.success("Invite response submitted");
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, { fallback: "Failed to respond to invite" }),
      );
    },
  });
}

// ============================================
// Meeting Mutations
// ============================================

export function useCreateMeeting(circleId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMeetingRequest) => createMeeting(circleId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: learningCircleKeys.meetingsByCircle(circleId),
      });
      toast.success("Meeting created successfully!");
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, { fallback: "Failed to create meeting" }),
      );
    },
  });
}

export function useDeleteMeeting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (meetingId: string) => deleteMeeting(meetingId),
    onSuccess: (_, meetingId) => {
      /**
       * BUG-014 (post-delete 400 race fix — revised):
       *
       * Step 1: Surgically evict the deleted meeting's specific cache entries.
       * removeQueries() removes them from the cache AND cancels any in-flight
       * fetch, so React Query will never attempt to refetch a resource that no
       * longer exists.
       */
      queryClient.removeQueries({
        queryKey: learningCircleKeys.meetingDetail(meetingId),
        exact: true,
      });
      queryClient.removeQueries({
        queryKey: learningCircleKeys.meetingReport(meetingId),
        exact: true,
      });
      queryClient.removeQueries({
        queryKey: learningCircleKeys.attendeeReport(meetingId),
        exact: true,
      });

      /**
       * Step 2: Invalidate only the list-level queries, NOT the parent
       * meetings() prefix (which would cascade back down to the just-removed
       * detail/report entries and re-register them as stale).
       *
       * We target meetingsByCircle (all circles), meetingsUser, and
       * meetingsPublic individually using their shared "byCircle"/"user"/
       * "public" subtree prefix so every cached circle's list refreshes.
       */
      queryClient.invalidateQueries({
        queryKey: [...learningCircleKeys.meetings(), "byCircle"],
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: [...learningCircleKeys.meetings(), "user"],
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: [...learningCircleKeys.meetings(), "public"],
        exact: false,
      });

      toast.success("Meeting deleted successfully");
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, { fallback: "Failed to delete meeting" }),
      );
    },
  });
}

export function useEditMeeting(meetingId: string, circleId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<CreateMeetingRequest>) =>
      editMeeting(meetingId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: learningCircleKeys.meetingDetail(meetingId),
      });
      queryClient.invalidateQueries({
        queryKey: learningCircleKeys.meetingsByCircle(circleId),
      });
      toast.success("Meeting updated successfully");
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, { fallback: "Failed to update meeting" }),
      );
    },
  });
}

// ============================================
// Participation Mutations
// ============================================

export function useRsvpMeeting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (meetingId: string) => rsvpMeeting(meetingId),
    onMutate: async (meetingId) => {
      // Optimistically update every cached meeting list to flip is_rsvp immediately.
      // This ensures the UI reflects the change without waiting for the API refetch.
      const caches = queryClient.getQueriesData<Meeting[]>({
        queryKey: learningCircleKeys.meetings(),
      });
      for (const [key, meetings] of caches) {
        if (!Array.isArray(meetings)) continue;
        queryClient.setQueryData<Meeting[]>(
          key,
          meetings.map((m) =>
            m.id === meetingId
              ? { ...m, is_rsvp: true, can_remove_rsvp: true }
              : m,
          ),
        );
      }
    },
    onSuccess: (_, meetingId) => {
      queryClient.invalidateQueries({
        queryKey: learningCircleKeys.meetingDetail(meetingId),
      });
      queryClient.invalidateQueries({
        queryKey: learningCircleKeys.meetingsUser(),
      });
      toast.success("Successfully RSVP'd to meeting!");
    },
    onError: (error, meetingId) => {
      const msg = getApiResponseError(error, { fallback: "" }).toLowerCase();
      const alreadyRsvpd = msg.includes("already") && msg.includes("rsvp");

      if (alreadyRsvpd) {
        // The user IS already RSVP'd but the list API has stale data returning
        // is_rsvp: false. Keep our optimistic is_rsvp: true in the cache —
        // do NOT invalidate the list (that would fetch the stale false value back).
        // Only refresh the meeting detail so the attendees array stays accurate.
        queryClient.invalidateQueries({
          queryKey: learningCircleKeys.meetingDetail(meetingId),
        });
        // Ensure all list caches explicitly have is_rsvp: true persisted
        const caches = queryClient.getQueriesData<Meeting[]>({
          queryKey: learningCircleKeys.meetings(),
        });
        for (const [key, meetings] of caches) {
          if (!Array.isArray(meetings)) continue;
          queryClient.setQueryData<Meeting[]>(
            key,
            meetings.map((m) =>
              m.id === meetingId
                ? { ...m, is_rsvp: true, can_remove_rsvp: true }
                : m,
            ),
          );
        }
        return;
      }

      // For genuine errors, roll back optimistic update
      const caches = queryClient.getQueriesData<Meeting[]>({
        queryKey: learningCircleKeys.meetings(),
      });
      for (const [key, meetings] of caches) {
        if (!Array.isArray(meetings)) continue;
        queryClient.setQueryData<Meeting[]>(
          key,
          meetings.map((m) =>
            m.id === meetingId
              ? { ...m, is_rsvp: false, can_remove_rsvp: undefined }
              : m,
          ),
        );
      }
      toast.error(
        getApiResponseError(error, { fallback: "Failed to RSVP to meeting" }),
      );
    },
  });
}

export function useRemoveRsvpMeeting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (meetingId: string) => removeRsvpMeeting(meetingId),
    onMutate: async (meetingId) => {
      // Optimistically update every cached meeting list to clear is_rsvp immediately.
      const caches = queryClient.getQueriesData<Meeting[]>({
        queryKey: learningCircleKeys.meetings(),
      });
      for (const [key, meetings] of caches) {
        if (!Array.isArray(meetings)) continue;
        queryClient.setQueryData<Meeting[]>(
          key,
          meetings.map((m) =>
            m.id === meetingId
              ? { ...m, is_rsvp: false, can_remove_rsvp: false }
              : m,
          ),
        );
      }
    },
    onSuccess: (_, meetingId) => {
      queryClient.invalidateQueries({
        queryKey: learningCircleKeys.meetingDetail(meetingId),
      });
      queryClient.invalidateQueries({
        queryKey: learningCircleKeys.meetingsUser(),
      });
      queryClient.invalidateQueries({
        queryKey: [...learningCircleKeys.all, "meetings"],
      });
      toast.success("RSVP removed successfully!");
    },
    onError: (error, meetingId) => {
      // Rollback optimistic update on error
      const caches = queryClient.getQueriesData<Meeting[]>({
        queryKey: learningCircleKeys.meetings(),
      });
      for (const [key, meetings] of caches) {
        if (!Array.isArray(meetings)) continue;
        queryClient.setQueryData<Meeting[]>(
          key,
          meetings.map((m) =>
            m.id === meetingId
              ? { ...m, is_rsvp: true, can_remove_rsvp: true }
              : m,
          ),
        );
      }
      toast.error(
        getApiResponseError(error, { fallback: "Failed to remove RSVP" }),
      );
    },
  });
}

export function useJoinMeeting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      meetingId,
      data,
    }: {
      meetingId: string;
      data: JoinMeetingRequest;
    }) => joinMeeting(meetingId, data),
    onSuccess: (_, { meetingId }) => {
      queryClient.invalidateQueries({
        queryKey: learningCircleKeys.meetingDetail(meetingId),
      });
      queryClient.invalidateQueries({
        queryKey: learningCircleKeys.meetingsUser(),
      });
      toast.success("Successfully joined the meeting!");
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to join meeting. Check the meeting code.",
        }),
      );
    },
  });
}

export function useLeaveMeeting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (meetingId: string) => leaveMeeting(meetingId),
    onSuccess: (_, meetingId) => {
      queryClient.invalidateQueries({
        queryKey: learningCircleKeys.meetingDetail(meetingId),
      });
      queryClient.invalidateQueries({
        queryKey: learningCircleKeys.meetingsUser(),
      });
      toast.success("Left the meeting");
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, { fallback: "Failed to leave meeting" }),
      );
    },
  });
}

// ============================================
// Report Mutations
// ============================================

export function useSubmitAttendeeReport(meetingId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AttendeeReportRequest) =>
      submitAttendeeReport(meetingId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: learningCircleKeys.meetingDetail(meetingId),
      });
      queryClient.invalidateQueries({
        queryKey: learningCircleKeys.attendeeReport(meetingId),
      });
      toast.success("Report submitted successfully!");
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, { fallback: "Failed to submit report" }),
      );
    },
  });
}

export function useSubmitMeetingReport(meetingId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: MeetingReportRequest) =>
      submitMeetingReport(meetingId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: learningCircleKeys.meetingDetail(meetingId),
      });
      queryClient.invalidateQueries({
        queryKey: learningCircleKeys.meetingReport(meetingId),
      });
      toast.success("Meeting report submitted successfully!");
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to submit meeting report",
        }),
      );
    },
  });
}

// ============================================
// Report Queries
// ============================================

export function useAttendeeReport(meetingId: string) {
  return useQuery({
    queryKey: learningCircleKeys.attendeeReport(meetingId),
    queryFn: () => getAttendeeReport(meetingId),
    staleTime: STALE_TIME,
    enabled: !!meetingId,
  });
}

export function useMeetingReport(meetingId: string) {
  return useQuery({
    queryKey: learningCircleKeys.meetingReport(meetingId),
    queryFn: () => getMeetingReport(meetingId),
    staleTime: STALE_TIME,
    enabled: !!meetingId,
  });
}

// ============================================
// Delete Report Mutations
// ============================================

export function useDeleteAttendeeReport(meetingId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => deleteAttendeeReport(meetingId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: learningCircleKeys.attendeeReport(meetingId),
      });
      queryClient.invalidateQueries({
        queryKey: learningCircleKeys.meetingDetail(meetingId),
      });
      toast.success("Attendee report deleted");
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to delete attendee report",
        }),
      );
    },
  });
}

export function useDeleteMeetingReport(meetingId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => deleteMeetingReport(meetingId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: learningCircleKeys.meetingReport(meetingId),
      });
      queryClient.invalidateQueries({
        queryKey: learningCircleKeys.meetingDetail(meetingId),
      });
      toast.success("Meeting report deleted");
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to delete meeting report",
        }),
      );
    },
  });
}
