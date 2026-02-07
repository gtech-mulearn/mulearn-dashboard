/**
 * Settings API Functions
 *
 * 📍 src/features/settings/api/settings.api.ts
 *
 * All settings-related API calls go through here.
 * NO direct fetch calls in components or hooks.
 * NO React dependencies - this is pure data layer.
 *
 * Pattern: Validate full response, extract and return inner data.
 */
import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";

import {
  type ChangePasswordResponse,
  ChangePasswordResponseSchema,
} from "@/features/settings";

export async function changePassword(payload: {
  current_password: string;
  password: string;
}): Promise<ChangePasswordResponse> {
  const endpoint = endpoints.password.change;

  const res = await apiClient.post(
    endpoint,
    payload,
    ChangePasswordResponseSchema,
  );

  return res;
}
