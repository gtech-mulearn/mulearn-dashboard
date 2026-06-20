"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiResponseError } from "@/hooks/use-get-error";
import {
  createAvailabilitySlots,
  fetchAvailabilityCalendar,
  getAvailabilitySlots,
} from "../api";
import type { WeeklySchedule } from "../types";
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

// Availability calendar — reuses availability query key (same data source)
export function useAvailabilityCalendar() {
  return useQuery({
    queryKey: [...mentorKeys.availability(), "calendar"] as const,
    queryFn: fetchAvailabilityCalendar,
    staleTime: 5 * 60 * 1000,
    retry: no403Retry,
  });
}

// createAvailabilitySlots(schedule, igId?) — igId optional, no React Query ctx arg
export function useCreateAvailabilitySlots() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      schedule,
      igId,
    }: {
      schedule: WeeklySchedule;
      igId?: string;
    }) => createAvailabilitySlots(schedule, igId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: mentorKeys.availability(),
      });
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to create availability slots",
        }),
      );
    },
  });
}
