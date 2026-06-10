"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchMentees,
  fetchParticipantHistory,
  fetchSessionParticipants,
  joinSession,
  submitSessionFeedback,
  updateParticipant,
} from "../api/mentees.api";

const menteeKeys = {
  all: ["mentor-mentees"] as const,
  list: () => [...menteeKeys.all, "list"] as const,
  participantHistory: () => [...menteeKeys.all, "participant-history"] as const,
  sessionParticipants: (sessionId: string) =>
    [...menteeKeys.all, "session-participants", sessionId] as const,
};

const no403Retry = (failureCount: number, error: unknown) => {
  if ((error as { status?: number })?.status === 403) return false;
  return failureCount < 2;
};

// Fetches mentees derived from participant history (deduplicates by user_id)
export function useMentees() {
  return useQuery({
    queryKey: menteeKeys.list(),
    queryFn: fetchMentees,
    retry: no403Retry,
  });
}

export function useSubmitFeedback() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      sessionId,
      feedback,
    }: {
      sessionId: string;
      feedback: string | null;
    }) => submitSessionFeedback(sessionId, feedback),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: menteeKeys.all });
    },
  });
}

export function useParticipantHistory() {
  return useQuery({
    queryKey: menteeKeys.participantHistory(),
    queryFn: fetchParticipantHistory,
    retry: no403Retry,
  });
}

// Fetches all participants in a specific session via the mentor-view endpoint
export function useSessionParticipants(sessionId: string | null) {
  return useQuery({
    queryKey: menteeKeys.sessionParticipants(sessionId ?? ""),
    queryFn: () => fetchSessionParticipants(sessionId!),
    enabled: !!sessionId,
    retry: no403Retry,
  });
}

export function useUpdateParticipant(sessionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      linkId,
      data,
    }: {
      linkId: string;
      data: import("../schemas").UpdateParticipantValues;
    }) => updateParticipant(linkId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: menteeKeys.sessionParticipants(sessionId),
      });
      queryClient.invalidateQueries({
        queryKey: menteeKeys.participantHistory(),
      });
      queryClient.invalidateQueries({
        queryKey: menteeKeys.list(),
      });
    },
  });
}

export function useJoinSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: string) => joinSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: menteeKeys.all });
    },
  });
}
