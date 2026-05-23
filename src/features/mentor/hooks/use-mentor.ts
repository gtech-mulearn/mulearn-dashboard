"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createAvailabilitySlots, getAvailabilitySlots } from "../api";
import { mentorKeys } from "./query-keys";

const no403Retry = (failureCount: number, error: unknown) => {
  if (
    error instanceof Error &&
    "status" in error &&
    (error as { status: number }).status === 403
  ) {
    return false;
  }
  return failureCount < 2;
};

export function useAvailabilitySlots() {
  return useQuery({
    queryKey: mentorKeys.availability(),
    queryFn: getAvailabilitySlots,
    staleTime: 5 * 60 * 1000,
    retry: no403Retry,
  });
}

export function useCreateAvailabilitySlots() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAvailabilitySlots,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: mentorKeys.availability(),
      });
    },
  });
}
