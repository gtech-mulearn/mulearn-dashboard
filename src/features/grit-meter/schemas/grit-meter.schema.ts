/**
 * Grit Meter Zod Schemas
 *
 * 📍 src/features/grit-meter/schemas/grit-meter.schema.ts
 */

import { z } from "zod";

export const gritMeterStatusSchema = z.object({
  enabled: z.boolean(),
});
