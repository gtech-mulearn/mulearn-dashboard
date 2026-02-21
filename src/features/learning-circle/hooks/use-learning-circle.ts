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
import { toast } from "sonner";
import {
  createCircle,
  createMeeting,
  deleteCircle,
  deleteMeeting,
  editCircle,
  getCircleDetail,
  getCircleMeetings,
  getCircleMembers,
  getCircles,
  getColleges,
  getMeetingDetail,
  getPublicMeetings,
  getUserMeetings,
  joinMeeting,
  leaveMeeting,
  rsvpMeeting,
  submitAttendeeReport,
  submitMeetingReport,
} from "../api";
import type {
  AttendeeReportRequest,
  CreateCircleRequest,
  CreateMeetingRequest,
  EditCircleRequest,
  JoinMeetingRequest,
  MeetingReportRequest,
} from "../schemas";
import { learningCircleKeys } from "./query-keys";

const STALE_TIME = 5 * 60 * 1000; // 5 minutes

// ============================================
// Form Dropdown Queries
// ============================================

export function useColleges(params?: {
  page?: number;
  perPage?: number;
  search?: string;
}) {
  return useQuery({
    queryKey: learningCircleKeys.colleges(params),
    queryFn: () => getColleges(params),
    placeholderData: keepPreviousData,
    staleTime: STALE_TIME,
  });
}

// ============================================
// Circle Queries
// ============================================

export function useCircles() {
  return useQuery({
    queryKey: learningCircleKeys.circleList(),
    queryFn: getCircles,
    staleTime: STALE_TIME,
  });
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
        queryKey: learningCircleKeys.circleList(),
      });
      toast.success("Learning circle created successfully!");
    },
    onError: () => {
      toast.error("Failed to create learning circle");
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
        queryKey: learningCircleKeys.circleList(),
      });
      toast.success("Circle updated successfully");
    },
    onError: () => {
      toast.error("Failed to update circle");
    },
  });
}

export function useDeleteCircle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (circleId: string) => deleteCircle(circleId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: learningCircleKeys.circleList(),
      });
      toast.success("Circle deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete circle");
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
    onError: () => {
      toast.error("Failed to create meeting");
    },
  });
}

export function useDeleteMeeting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (meetingId: string) => deleteMeeting(meetingId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: learningCircleKeys.meetings(),
      });
      toast.success("Meeting deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete meeting");
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
    onSuccess: (_, meetingId) => {
      queryClient.invalidateQueries({
        queryKey: learningCircleKeys.meetingDetail(meetingId),
      });
      queryClient.invalidateQueries({
        queryKey: learningCircleKeys.meetingsUser(),
      });
      toast.success("Successfully RSVP'd to meeting!");
    },
    onError: () => {
      toast.error("Failed to RSVP to meeting");
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
    onError: () => {
      toast.error("Failed to join meeting. Check the meeting code.");
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
    onError: () => {
      toast.error("Failed to leave meeting");
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
    onError: () => {
      toast.error("Failed to submit report");
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
    onError: () => {
      toast.error("Failed to submit meeting report");
    },
  });
}
