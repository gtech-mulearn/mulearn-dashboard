/**
 * Feature flag schemas (System → Features).
 *
 * 📍 src/features/feature-flags/schemas/feature-flag.schema.ts
 */

import { z } from "zod";

/** GET/POST /api/v1/dashboard/feature/<slug>/. `configured` only for flags that need server settings. */
export const featureFlagSchema = z.object({
  enabled: z.boolean(),
  configured: z.boolean().optional(),
});

export const FeatureFlagResponseSchema = z.object({
  response: featureFlagSchema,
});

export type FeatureFlag = z.infer<typeof featureFlagSchema>;
