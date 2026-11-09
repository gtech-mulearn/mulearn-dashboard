/**
 * Connected apps API: dashboard → backend auth-admin (role check + audit row)
 * → authserver (owner of the data).
 *
 * 📍 src/features/connected-apps/api/connected-apps.api.ts
 */

import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import {
  type ConnectedApp,
  ConnectedAppListResponseSchema,
  ConnectedAppResponseSchema,
  type CreateClientPayload,
  type RegisteredApp,
  RegisteredAppResponseSchema,
  type UpdateClientPayload,
} from "../schemas";

const api = endpoints.admin.authAdmin;

export async function listConnectedApps(): Promise<ConnectedApp[]> {
  const data = await apiClient.get(api.clients, ConnectedAppListResponseSchema);
  return data.response.items;
}

export async function getConnectedApp(clientId: string): Promise<ConnectedApp> {
  const data = await apiClient.get(
    api.client(clientId),
    ConnectedAppResponseSchema,
  );
  return data.response;
}

/** A confidential app's secret is in this response only; it can't be fetched again. */
export async function registerConnectedApp(
  payload: CreateClientPayload,
): Promise<RegisteredApp> {
  const data = await apiClient.post(
    api.clients,
    payload,
    RegisteredAppResponseSchema,
  );
  return data.response;
}

export async function updateConnectedApp(
  clientId: string,
  payload: UpdateClientPayload,
): Promise<ConnectedApp> {
  const data = await apiClient.patch(
    api.client(clientId),
    payload,
    ConnectedAppResponseSchema,
  );
  return data.response;
}

/** Disabling also revokes every token the app holds. Apps are never deleted. */
export async function setConnectedAppEnabled(
  clientId: string,
  enabled: boolean,
  reason?: string,
): Promise<ConnectedApp> {
  const url = enabled
    ? api.clientEnable(clientId)
    : api.clientDisable(clientId);
  const data = await apiClient.post(
    url,
    reason ? { reason } : {},
    ConnectedAppResponseSchema,
  );
  return data.response;
}
