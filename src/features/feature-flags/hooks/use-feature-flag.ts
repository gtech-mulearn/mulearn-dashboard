/**
 * Feature flag query and mutation hooks.
 *
 * 📍 src/features/feature-flags/hooks/use-feature-flag.ts
 */

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ApiError } from "@/api/errors";
import { getFeatureFlag, setFeatureFlag } from "../api";
import type { FeatureFlag } from "../schemas";

export const featureFlagKeys = {
  flag: (slug: string) => ["feature-flag", slug] as const,
};

export function useFeatureFlag(slug: string) {
  return useQuery({
    queryKey: featureFlagKeys.flag(slug),
    queryFn: () => getFeatureFlag(slug),
    staleTime: 30 * 1000,
  });
}

export function useToggleFeatureFlag(slug: string, label: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (enabled: boolean) => setFeatureFlag(slug, enabled),
    onSuccess: (data) => {
      // POST answers {enabled} only; keep `configured` from the last GET.
      queryClient.setQueryData<FeatureFlag>(
        featureFlagKeys.flag(slug),
        (old) => ({
          ...old,
          ...data,
        }),
      );
      toast.success(`${label} ${data.enabled ? "enabled" : "disabled"}.`);
    },
    onError: (error) => {
      // A 400 carries the server's reason, e.g. "Futuremug isn't configured on this server…".
      toast.error(
        error instanceof ApiError && error.status === 400
          ? error.message
          : `Failed to update ${label}.`,
      );
    },
  });
}
