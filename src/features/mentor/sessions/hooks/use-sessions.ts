"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { mentorKeys } from "@/features/mentor/hooks/query-keys";
import { getApiResponseError } from "@/hooks/use-get-error";
import {
  createSession,
  deleteSession,
  fetchAdminSessions,
  fetchAvailableSessions,
  fetchParticipantHistory,
  fetchParticipants,
  fetchSessionDetail,
  fetchSessions,
  joinSession,
  submitFeedback,
  updateParticipant,
  updateSession,
  verifySession,
  addParticipant,
} from "../api/sessions.api";
import type {
  AddParticipantFormValues,
  AdminVerifySessionValues,
  SessionFormValues,
  SubmitFeedbackValues,
  UpdateParticipantValues,
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
  pageIndex?: number;
  perPage?: number;
  search?: string;
  ig_id?: string;
  sortBy?: string;
}

// ─── #12 GET /session/list/ — Mentor's own sessions ──────────────────────────
export function useSessions(params: UseSessionsParams = {}) {
  return useQuery({
    queryKey: mentorKeys.sessions.list(params as Record<string, unknown>),
    queryFn: () => fetchSessions(params),
    retry: no403Retry,
    staleTime: 2 * 60 * 1000,
  });
}

// ─── #13 GET /session/list/<id>/ — Single session detail ─────────────────────
export function useSessionDetail(sessionId: string, enabled = true) {
  return useQuery({
    queryKey: mentorKeys.sessions.detail(sessionId),
    queryFn: () => fetchSessionDetail(sessionId),
    retry: no403Retry,
    enabled: enabled && !!sessionId,
    staleTime: 2 * 60 * 1000,
  });
}

// ─── #15 GET /session/available/ — Learner session discovery ─────────────────
export function useAvailableSessions(params: UseSessionsParams = {}) {
  return useQuery({
    queryKey: mentorKeys.sessions.available(params as Record<string, unknown>),
    queryFn: () => fetchAvailableSessions(params),
    retry: no403Retry,
    staleTime: 2 * 60 * 1000,
  });
}

// ─── #16 GET /session/admin/list/ — Admin all sessions ───────────────────────
export function useAdminSessions(
  params: UseSessionsParams = {},
  enabled = true,
) {
  return useQuery({
    queryKey: mentorKeys.sessions.adminList(params as Record<string, unknown>),
    queryFn: () => fetchAdminSessions(params),
    retry: no403Retry,
    staleTime: 2 * 60 * 1000,
    enabled,
  });
}

// Keep backward-compat alias: usePendingSessions was the old admin session list
export const usePendingSessions = (enabled = true) =>
  useAdminSessions({ status: "PENDING_APPROVAL" }, enabled);

// ─── #11 POST /session/create/ ────────────────────────────────────────────────
export function useCreateSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: SessionFormValues) => createSession(data),
    onSuccess: () => {
      toast.success("Session created and pending approval.");
      void qc.invalidateQueries({ queryKey: mentorKeys.sessions.all });
    },
    onError: (error) =>
      toast.error(
        getApiResponseError(error, { fallback: "Failed to create session" }),
      ),
  });
}

// ─── #14 PATCH /session/update/<id>/ ─────────────────────────────────────────
export function useUpdateSession(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<SessionFormValues>) => updateSession(id, data),
    onSuccess: () => {
      toast.success("Session updated.");
      void qc.invalidateQueries({ queryKey: mentorKeys.sessions.all });
    },
    onError: (error) =>
      toast.error(
        getApiResponseError(error, { fallback: "Failed to update session" }),
      ),
  });
}

// ─── #14 DELETE /session/update/<id>/ ────────────────────────────────────────
export function useDeleteSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: string) => deleteSession(sessionId),
    onSuccess: () => {
      toast.success("Session deleted.");
      void qc.invalidateQueries({ queryKey: mentorKeys.sessions.all });
    },
    onError: (error) =>
      toast.error(
        getApiResponseError(error, { fallback: "Failed to delete session" }),
      ),
  });
}

// ─── #17 PATCH /session/admin/verify/<id>/ ───────────────────────────────────
export function useVerifySession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: AdminVerifySessionValues;
    }) => verifySession(id, data),
    onSuccess: (_result, { data }) => {
      toast.success(
        data.status === "SCHEDULED"
          ? "Session approved and scheduled."
          : "Session rejected.",
      );
      void qc.invalidateQueries({ queryKey: mentorKeys.sessions.all });
    },
    onError: (error) =>
      toast.error(getApiResponseError(error, { fallback: "Action failed" })),
  });
}

// Backward compat alias
export const useApproveSession = useVerifySession;

// ─── #18 POST /session/participation/join/<id>/ ──────────────────────────────
export function useJoinSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: string) => joinSession(sessionId),
    onSuccess: () => {
      toast.success("Successfully joined the session.");
      void qc.invalidateQueries({ queryKey: mentorKeys.sessions.all });
    },
    onError: (error) =>
      toast.error(
        getApiResponseError(error, { fallback: "Failed to join session" }),
      ),
  });
}

// ─── #19 GET /session/participant/history/ ───────────────────────────────────
export function useParticipantHistory(
  params: UseSessionsParams = {},
  enabled = true,
) {
  return useQuery({
    queryKey: mentorKeys.sessions.participantHistory(
      params as Record<string, unknown>,
    ),
    queryFn: () => fetchParticipantHistory(params),
    retry: no403Retry,
    enabled,
    staleTime: 2 * 60 * 1000,
  });
}

// ─── #20 GET /session/participant/list/<session_id>/ ─────────────────────────
export function useParticipants(sessionId: string) {
  return useQuery({
    queryKey: mentorKeys.sessions.participants(sessionId),
    queryFn: () => fetchParticipants(sessionId),
    retry: no403Retry,
    enabled: !!sessionId,
    select: (res) => res.data, // unwrap paginated envelope → flat array
  });
}

// ─── #20 POST invite — Add a participant to a session ────────────────────────
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
    onError: (error) =>
      toast.error(
        getApiResponseError(error, { fallback: "Failed to add participant" }),
      ),
  });
}

// ─── #21 PATCH /session/participant/update/<link_id>/ ────────────────────────
export function useUpdateParticipant(sessionId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      linkId,
      data,
    }: {
      linkId: string;
      data: UpdateParticipantValues;
    }) => updateParticipant(linkId, data),
    onSuccess: () => {
      toast.success("Participant record updated.");
      void qc.invalidateQueries({
        queryKey: mentorKeys.sessions.participants(sessionId),
      });
    },
    onError: (error) =>
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to update participant",
        }),
      ),
  });
}

// ─── #22 PATCH /session/participant/feedback/<session_id>/ ───────────────────
export function useSubmitFeedback() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      sessionId,
      data,
    }: {
      sessionId: string;
      data: SubmitFeedbackValues;
    }) => submitFeedback(sessionId, data),
    onSuccess: () => {
      toast.success("Feedback submitted successfully.");
      void qc.invalidateQueries({ queryKey: mentorKeys.sessions.all });
    },
    onError: (error) =>
      toast.error(
        getApiResponseError(error, { fallback: "Failed to submit feedback" }),
      ),
  });
}

// ─── Removed in doc migration — kept as no-ops to avoid broken imports ────────
export function useRemindSession() {
  return useMutation({
    mutationFn: async (_id: string) => {
      // Not in doc — no-op placeholder
    },
  });
}

export function useAwardKarma(_sessionId: string) {
  return useMutation({
    mutationFn: async (_data: unknown) => {
      // Not in doc — no-op placeholder
    },
  });
}
