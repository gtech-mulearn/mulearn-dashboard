/**
 * Grit Meter Custom Query & Mutation Hooks
 *
 * 📍 src/features/grit-meter/hooks/use-grit-meter.ts
 */

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getGritMeterStatus, toggleGritMeterStatus } from "../api";
import { gritMeterKeys } from "./query-keys";

export function useGritMeterStatus() {
  return useQuery({
    queryKey: gritMeterKeys.status(),
    queryFn: getGritMeterStatus,
    staleTime: 30 * 1000,
  });
}

export function useToggleGritMeter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (enabled: boolean) => toggleGritMeterStatus(enabled),
    onSuccess: (data) => {
      queryClient.setQueryData(gritMeterKeys.status(), data);
      toast.success(
        data.enabled
          ? "Grit Meter feature enabled."
          : "Grit Meter feature disabled.",
      );
    },
    onError: () => {
      toast.error("Failed to update Grit Meter feature status.");
    },
  });
}
