/**
 * Interests/Pathway Schemas
 *
 * 📍 src/features/onboarding/schemas/interests.schema.ts
 *
 * Zod schemas for interest and pathway selection during onboarding.
 */

import { z } from "zod";

// ============================================
// Common Response Wrapper
// ============================================

export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    hasError: z.boolean(),
    statusCode: z.number(),
    message: z.record(z.string(), z.array(z.string())).optional(),
    response: dataSchema,
  });

// ============================================
// Pathway Types
// ============================================

export const PathwaySchema = z.enum(["coder", "maker", "manager", "creative"]);

export const EndgoalSchema = z.enum([
  "job",
  "r&d",
  "entrepreneurship",
  "gig_work",
  "higher_education",
  "social_impact",
]);

// ============================================
// Select Domains/Pathways Request
// ============================================

export const SelectDomainsRequestSchema = z.object({
  domains: z.array(z.string()).min(1, "Select at least one pathway"),
});

export const SelectDomainsResponseSchema = ApiResponseSchema(z.object({}));

// ============================================
// Select Endgoals Request
// ============================================

export const SelectEndgoalsRequestSchema = z.object({
  endgoals: z.array(z.string()).min(1, "Select at least one goal"),
});

export const SelectEndgoalsResponseSchema = ApiResponseSchema(z.object({}));

// ============================================
// Area of Interest Schema
// ============================================

export const AreaOfInterestSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export const AreasOfInterestResponseSchema = ApiResponseSchema(
  z.array(AreaOfInterestSchema),
);

// ============================================
// Derived Types
// ============================================

export type Pathway = z.infer<typeof PathwaySchema>;
export type Endgoal = z.infer<typeof EndgoalSchema>;

export type SelectDomainsRequest = z.infer<typeof SelectDomainsRequestSchema>;
export type SelectEndgoalsRequest = z.infer<typeof SelectEndgoalsRequestSchema>;

export type AreaOfInterest = z.infer<typeof AreaOfInterestSchema>;
export type AreasOfInterestResponse = z.infer<
  typeof AreasOfInterestResponseSchema
>;
