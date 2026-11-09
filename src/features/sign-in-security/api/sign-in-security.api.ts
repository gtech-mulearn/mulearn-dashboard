/**
 * Sign-in security API (backend auth-admin → authserver).
 *
 * 📍 src/features/sign-in-security/api/sign-in-security.api.ts
 */

import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import {
  type LoginAttemptFilters,
  type LoginAttemptsPage,
  LoginAttemptsResponseSchema,
  MessageResponseSchema,
  PolicyResponseSchema,
  type PolicyWithBounds,
  PostureResponseSchema,
  type SecurityPosture,
  type SigninPolicy,
  UpdatedPolicyResponseSchema,
} from "../schemas";

const api = endpoints.admin.authAdmin;

export async function getSigninPolicy(): Promise<PolicyWithBounds> {
  const data = await apiClient.get(api.signinPolicy, PolicyResponseSchema);
  return data.response;
}

export async function updateSigninPolicy(
  policy: SigninPolicy,
): Promise<SigninPolicy> {
  const data = await apiClient.put(
    api.signinPolicy,
    policy,
    UpdatedPolicyResponseSchema,
  );
  return data.response;
}

export async function getSecurityPosture(): Promise<SecurityPosture> {
  const data = await apiClient.get(api.securityPosture, PostureResponseSchema);
  return data.response;
}

export const LOGIN_ATTEMPTS_PAGE = 50;

export async function getLoginAttempts(
  filters: LoginAttemptFilters,
  before?: string,
): Promise<LoginAttemptsPage> {
  const params = new URLSearchParams({ limit: String(LOGIN_ATTEMPTS_PAGE) });
  if (filters.identifier.trim())
    params.set("identifier", filters.identifier.trim());
  if (filters.result) params.set("result", filters.result);
  if (before) params.set("before", before);
  const data = await apiClient.get(
    `${api.loginAttempts}?${params}`,
    LoginAttemptsResponseSchema,
  );
  return data.response;
}

/** Returns the server's sentence, e.g. "MU-123 has been signed out everywhere". */
export async function revokeMemberSessions(
  muid: string,
  reason?: string,
): Promise<string> {
  const data = await apiClient.post(
    api.sessionsRevoke,
    { muid: muid.trim(), ...(reason ? { reason } : {}) },
    MessageResponseSchema,
  );
  return (
    data.message?.general?.[0] ??
    `${muid.trim()} has been signed out everywhere.`
  );
}
