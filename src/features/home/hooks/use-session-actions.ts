"use client";

// Accept or decline a session request from the mentor home. These live in home, not mentor:
// only home's SessionRequestsCard uses them, and they refresh home's mentor overview (issue 0010).

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { acceptSessionRequest, declineSessionRequest } from "@/features/mentor";
import { getApiResponseError } from "@/hooks/use-get-error";
import { homeKeys } from "./query-keys";

export function useAcceptSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      sessionId,
      userId,
    }: {
      sessionId: string;
      userId: string;
    }) => acceptSessionRequest(sessionId, userId),
    onError: (error) => {
      toast.error(
        getApiResponseError(error, { fallback: "Failed to accept session" }),
      );
    },
    onSuccess: () => {
      toast.success("Session accepted");
    },
    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: homeKeys.mentorOverview(),
      });
    },
  });
}

export function useDeclineSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      sessionId,
      userId,
    }: {
      sessionId: string;
      userId: string;
    }) => declineSessionRequest(sessionId, userId),
    onError: (error) => {
      toast.error(
        getApiResponseError(error, { fallback: "Failed to decline session" }),
      );
    },
    onSuccess: () => {
      toast.success("Session declined");
    },
    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: homeKeys.mentorOverview(),
      });
    },
  });
}
