"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { mentorKeys } from "@/features/mentor/hooks/query-keys";
import {
  addParticipant,
  approveSession,
  awardKarma,
  bulkUpdateAttendance,
  cloneSession,
  createSession,
  fetchParticipants,
  fetchPendingSessions,
  fetchSessions,
  remindSession,
  removeParticipant,
  updateSession,
} from "../api/sessions.api";
import type {
  AddParticipantFormValues,
  ApproveSessionFormValues,
  AttendanceBulkUpdateValues,
  KarmaAwardFormValues,
  ParticipantRole,
  SessionFormValues,
} from "../schemas";

const no403Retry = (failureCount: number, error: unknown) => {
  if (
    error instanceof Error &&
    "status" in error &&
    (error as { status: number }).status === 403
  )
    return false;
  return failureCount < 2;
};

interface UseSessionsParams {
  status?: string;
  page?: number;
  search?: string;
  ig_id?: string;
}

export function useSessions(params: UseSessionsParams = {}) {
  return useQuery({
    queryKey: mentorKeys.sessions.list(params as Record<string, unknown>),
    queryFn: () => fetchSessions(params),
    retry: no403Retry,
    staleTime: 2 * 60 * 1000,
  });
}

export function usePendingSessions(enabled = true) {
  return useQuery({
    queryKey: mentorKeys.sessions.pending(),
    queryFn: fetchPendingSessions,
    retry: no403Retry,
    staleTime: 2 * 60 * 1000,
    enabled,
  });
}

export function useCreateSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: SessionFormValues) => createSession(data),
    onSuccess: () => {
      toast.success("Session created.");
      void qc.invalidateQueries({ queryKey: mentorKeys.sessions.all });
    },
    onError: (err: Error) =>
      toast.error(err.message ?? "Failed to create session"),
  });
}

export function useUpdateSession(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<SessionFormValues>) => updateSession(id, data),
    onSuccess: () => {
      toast.success("Session updated.");
      void qc.invalidateQueries({ queryKey: mentorKeys.sessions.all });
    },
    onError: (err: Error) =>
      toast.error(err.message ?? "Failed to update session"),
  });
}

export function useParticipants(sessionId: string) {
  return useQuery({
    queryKey: mentorKeys.sessions.participants(sessionId),
    queryFn: () => fetchParticipants(sessionId),
    retry: no403Retry,
    enabled: !!sessionId,
  });
}

export function useAddParticipant(sessionId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: AddParticipantFormValues) =>
      addParticipant(sessionId, data),
    onSuccess: () => {
      toast.success("Participant added.");
      void qc.invalidateQueries({
        queryKey: mentorKeys.sessions.participants(sessionId),
      });
    },
    onError: (err: Error) =>
      toast.error(err.message ?? "Failed to add participant"),
  });
}

export function useRemoveParticipant(sessionId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      userId,
      participantRole,
    }: {
      userId: string;
      participantRole: ParticipantRole;
    }) => removeParticipant(sessionId, userId, participantRole),
    onSuccess: () => {
      toast.success("Participant removed.");
      void qc.invalidateQueries({
        queryKey: mentorKeys.sessions.participants(sessionId),
      });
    },
    onError: (err: Error) =>
      toast.error(err.message ?? "Failed to remove participant"),
  });
}

export function useBulkUpdateAttendance(sessionId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: AttendanceBulkUpdateValues) =>
      bulkUpdateAttendance(sessionId, data),
    onSuccess: () => {
      toast.success("Attendance updated.");
      void qc.invalidateQueries({
        queryKey: mentorKeys.sessions.participants(sessionId),
      });
      void qc.invalidateQueries({ queryKey: mentorKeys.sessions.all });
    },
    onError: (err: Error) =>
      toast.error(err.message ?? "Failed to update attendance"),
  });
}

export function useCloneSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: string) => cloneSession(sessionId),
    onSuccess: () => {
      toast.success(
        "Session cloned. Update start/end times before publishing.",
      );
      void qc.invalidateQueries({ queryKey: mentorKeys.sessions.all });
    },
    onError: (err: Error) =>
      toast.error(err.message ?? "Failed to clone session"),
  });
}

export function useApproveSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: ApproveSessionFormValues;
    }) => approveSession(id, data),
    onSuccess: (_data, { data }) => {
      toast.success(
        data.action === "approve" ? "Session approved." : "Session rejected.",
      );
      void qc.invalidateQueries({ queryKey: mentorKeys.sessions.all });
    },
    onError: (err: Error) => toast.error(err.message ?? "Action failed"),
  });
}

export function useRemindSession() {
  return useMutation({
    mutationFn: (id: string) => remindSession(id),
    onSuccess: () => {
      toast.success("Reminder sent to participants.");
    },
    onError: (err: Error) =>
      toast.error(err.message ?? "Failed to send reminder"),
  });
}

export function useAwardKarma(sessionId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: KarmaAwardFormValues) => awardKarma(sessionId, data),
    onSuccess: (_data, vars) => {
      toast.success(`${vars.karma} karma awarded.`);
      void qc.invalidateQueries({ queryKey: mentorKeys.sessions.all });
    },
    onError: (err: Error) =>
      toast.error(err.message ?? "Failed to award karma"),
  });
}
