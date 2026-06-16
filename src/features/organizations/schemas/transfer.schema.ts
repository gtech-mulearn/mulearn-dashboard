import { z } from "zod";

// ─── Simple Transfer ──────────────────────────────────────────────────────────

export const TransferOrgFormSchema = z.object({
  from_id: z.string().min(1, "Source organization code is required"),
  to_id: z.string().min(1, "Destination organization code is required"),
});

export type TransferOrgFormValues = z.infer<typeof TransferOrgFormSchema>;

export const TransferResponseSchema = z
  .object({
    hasError: z.boolean().optional(),
    statusCode: z.number().optional(),
    message: z.unknown().optional(),
    response: z.array(z.string()).optional(),
    data: z.array(z.string()).optional(),
  })
  .passthrough();

// ─── Merge Preview / Execute ──────────────────────────────────────────────────

export const MergeImpactItemSchema = z.object({
  model: z.string(),
  field_name: z.string(),
  count: z.number(),
  action: z.enum(["update", "delete"]),
  instance_ids: z.array(z.string()),
});

export type MergeImpactItem = z.infer<typeof MergeImpactItemSchema>;

export const MergePreviewDataSchema = z.object({
  update_summary: z.array(MergeImpactItemSchema),
  source_org: z.string(),
});

export type MergePreviewData = z.infer<typeof MergePreviewDataSchema>;

export const MergePreviewResponseSchema = z
  .object({
    hasError: z.boolean().optional(),
    statusCode: z.number().optional(),
    message: z.unknown().optional(),
    response: MergePreviewDataSchema.optional(),
    data: MergePreviewDataSchema.optional(),
  })
  .passthrough();

export const MergeOrgFormSchema = z.object({
  source_org: z.string().min(1, "Source org code is required"),
  dest_org_id: z.string().min(1, "Destination org UUID is required"),
});

export type MergeOrgFormValues = z.infer<typeof MergeOrgFormSchema>;

export const MergeMutationResponseSchema = z.any();
