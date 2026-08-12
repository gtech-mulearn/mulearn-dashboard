/**
 * Persona Hooks
 *
 * 📍 src/features/mentor/hooks/use-persona.ts
 *
 * Provides hooks to read and switch the active persona via the backend:
 *   - usePersonaCurrent()  → GET /mentor/persona/current/
 *   - usePersonaStatus()   → GET /mentor/persona/status/
 *   - useSwitchPersona()   → POST /mentor/persona/switch/
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiResponseError } from "@/hooks/use-get-error";
import {
  getPersonaCurrent,
  getPersonaStatus,
  type SwitchPersonaPayload,
  switchPersona,
} from "../api/mentor.api";
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

/** GET /mentor/persona/current/ — available to any authenticated user */
export function usePersonaCurrent(enabled = true) {
  return useQuery({
    queryKey: mentorKeys.persona.current(),
    queryFn: getPersonaCurrent,
    enabled,
    staleTime: 1000 * 60 * 2, // 2 min — persona doesn't change often
    retry: no403Retry,
  });
}

/** GET /mentor/persona/status/ — mentor-only display-ready readout */
export function usePersonaStatus(enabled = true) {
  return useQuery({
    queryKey: mentorKeys.persona.status(),
    queryFn: getPersonaStatus,
    enabled,
    staleTime: 1000 * 60 * 2,
    retry: no403Retry,
  });
}

/**
 * POST /mentor/persona/switch/
 *
 * Invalidates both persona queries on success so the UI reflects the
 * new active persona immediately.
 */
export function useSwitchPersona() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SwitchPersonaPayload) => switchPersona(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: mentorKeys.persona.current(),
      });
      void queryClient.invalidateQueries({
        queryKey: mentorKeys.persona.status(),
      });
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to switch persona. Please try again.",
        }),
      );
    },
  });
}
