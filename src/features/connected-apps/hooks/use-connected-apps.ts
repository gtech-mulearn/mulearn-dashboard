/**
 * Connected apps queries and mutations.
 *
 * 📍 src/features/connected-apps/hooks/use-connected-apps.ts
 */

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ApiError } from "@/api/errors";
import { getApiResponseError } from "@/hooks/use-get-error";
import {
  getConnectedApp,
  listConnectedApps,
  registerConnectedApp,
  setConnectedAppEnabled,
  updateConnectedApp,
} from "../api";
import type {
  ConnectedApp,
  CreateClientPayload,
  UpdateClientPayload,
} from "../schemas";

export const connectedAppKeys = {
  all: ["connected-apps"] as const,
  list: () => [...connectedAppKeys.all, "list"] as const,
  detail: (clientId: string) =>
    [...connectedAppKeys.all, "detail", clientId] as const,
};

export function useConnectedApps() {
  return useQuery({
    queryKey: connectedAppKeys.list(),
    queryFn: listConnectedApps,
  });
}

export function useConnectedApp(clientId: string) {
  return useQuery({
    queryKey: connectedAppKeys.detail(clientId),
    queryFn: () => getConnectedApp(clientId),
    // An unknown client ID won't appear on a retry.
    retry: (count, error) =>
      !(error instanceof ApiError && error.status === 404) && count < 2,
  });
}

function useStoreApp() {
  const queryClient = useQueryClient();
  return (app: ConnectedApp) => {
    queryClient.setQueryData(connectedAppKeys.detail(app.client_id), app);
    queryClient.invalidateQueries({ queryKey: connectedAppKeys.list() });
  };
}

/** Errors are shown by the form (field by field), so no toast here. */
export function useRegisterConnectedApp() {
  const store = useStoreApp();
  return useMutation({
    mutationFn: (payload: CreateClientPayload) => registerConnectedApp(payload),
    onSuccess: (result) => store(result.client),
  });
}

/** Errors are shown by the form (field by field), so no toast here. */
export function useUpdateConnectedApp(clientId: string) {
  const store = useStoreApp();
  return useMutation({
    mutationFn: (payload: UpdateClientPayload) =>
      updateConnectedApp(clientId, payload),
    onSuccess: (app) => {
      store(app);
      toast.success("Changes saved.");
    },
  });
}

export function useSetConnectedAppEnabled(clientId: string) {
  const store = useStoreApp();
  return useMutation({
    mutationFn: ({ enabled, reason }: { enabled: boolean; reason?: string }) =>
      setConnectedAppEnabled(clientId, enabled, reason),
    onSuccess: (app) => {
      store(app);
      toast.success(
        app.disabled_at
          ? `${app.name} is disabled. Everyone signed in through it has been signed out.`
          : `${app.name} is enabled again.`,
      );
    },
    onError: (error) =>
      toast.error(
        getApiResponseError(error, {
          fallback: "Couldn't change the app's status.",
        }),
      ),
  });
}
