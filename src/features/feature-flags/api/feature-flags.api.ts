/**
 * Feature flag API functions.
 *
 * 📍 src/features/feature-flags/api/feature-flags.api.ts
 */

import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import { type FeatureFlag, FeatureFlagResponseSchema } from "../schemas";

export async function getFeatureFlag(slug: string): Promise<FeatureFlag> {
  const data = await apiClient.get(
    endpoints.admin.features.flag(slug),
    FeatureFlagResponseSchema,
  );
  return data.response;
}

export async function setFeatureFlag(
  slug: string,
  enabled: boolean,
): Promise<FeatureFlag> {
  const data = await apiClient.post(
    endpoints.admin.features.flag(slug),
    { enabled },
    FeatureFlagResponseSchema,
  );
  return data.response;
}
