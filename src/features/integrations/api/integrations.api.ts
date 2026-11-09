import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import type { PartnerAccountType, PartnerProvider } from "../providers/types";
import {
  type PartnerConnection,
  PartnerConnectionResponseSchema,
  PartnerDisconnectResponseSchema,
  type PartnerSession,
  PartnerSessionResponseSchema,
} from "../schemas";

const ENDPOINTS: Record<
  PartnerProvider,
  typeof endpoints.integrations.futuremug
> = {
  futuremug: endpoints.integrations.futuremug,
};

export async function getPartnerConnection(
  provider: PartnerProvider,
  type: PartnerAccountType,
): Promise<PartnerConnection> {
  const data = await apiClient.get(
    ENDPOINTS[provider].connection(type),
    PartnerConnectionResponseSchema,
  );
  return data.response;
}

export async function authorizePartner(
  provider: PartnerProvider,
  type: PartnerAccountType,
  consentVersion: string,
): Promise<PartnerSession> {
  const data = await apiClient.post(
    ENDPOINTS[provider].authorize(type),
    { consent_version: consentVersion, accepted: true },
    PartnerSessionResponseSchema,
  );
  return data.response;
}

export async function signInPartner(
  provider: PartnerProvider,
  type: PartnerAccountType,
): Promise<PartnerSession> {
  const data = await apiClient.post(
    ENDPOINTS[provider].signIn(type),
    {},
    PartnerSessionResponseSchema,
  );
  return data.response;
}

export async function disconnectPartner(
  provider: PartnerProvider,
  type: PartnerAccountType,
): Promise<void> {
  await apiClient.delete(
    ENDPOINTS[provider].connection(type),
    undefined,
    PartnerDisconnectResponseSchema,
  );
}
