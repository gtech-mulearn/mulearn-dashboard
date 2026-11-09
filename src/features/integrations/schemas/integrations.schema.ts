import { z } from "zod";

export const PreviewRowSchema = z.object({
  label: z.string(),
  value: z.string(),
  note: z.string().nullable().optional(),
});

export const ConsentDocumentSchema = z.object({
  version: z.string(),
  title: z.string(),
  subtitle: z.string(),
  purpose: z.string(),
  sections: z.array(z.object({ title: z.string(), body: z.string() })),
  notes: z.array(z.string()),
  /** Contains {terms} and {privacy}; rendered as links. */
  checkbox_label: z.string(),
  terms_url: z.string(),
  privacy_url: z.string(),
});

export const LinkStatusSchema = z.enum([
  "consented",
  "active",
  "pending_approval",
  "blocked",
  "rejected",
  "disconnected",
]);

export const PartnerConnectionSchema = z.object({
  enabled: z.boolean(),
  account_type: z.string(),
  hidden: z.boolean().optional(),
  eligibility: z
    .object({
      eligible: z.boolean(),
      reason: z.string().nullable(),
      message: z.string().nullable(),
    })
    .optional(),
  can_manage: z.boolean().optional(),
  managed_by: z.string().nullable().optional(),
  email_verified: z.boolean().optional(),
  connection: z
    .object({
      status: LinkStatusSchema,
      connected_at: z.string().nullable(),
      last_login_at: z.string().nullable(),
      contact_name: z.string().nullable(),
      takeover_required: z.boolean(),
    })
    .nullable()
    .optional(),
  consent: z
    .object({
      current_version: z.string(),
      accepted_version: z.string().nullable(),
      needs_consent: z.boolean(),
      document: ConsentDocumentSchema.nullable(),
    })
    .optional(),
  shared_data_preview: z.array(PreviewRowSchema).nullable().optional(),
});

export const PartnerSessionSchema = z.object({
  status: z.enum(["login", "pending_approval"]),
  login_url: z.string().optional(),
  expires_in: z.number().optional(),
  pending_url: z.string().optional(),
  message: z.string().optional(),
  account_created: z.boolean().optional(),
});

export const PartnerConnectionResponseSchema = z.object({
  response: PartnerConnectionSchema,
});
export const PartnerSessionResponseSchema = z.object({
  response: PartnerSessionSchema,
});
export const PartnerDisconnectResponseSchema = z.object({
  response: z.object({ status: z.literal("disconnected") }),
});

export type PreviewRow = z.infer<typeof PreviewRowSchema>;
export type ConsentDocument = z.infer<typeof ConsentDocumentSchema>;
export type PartnerConnection = z.infer<typeof PartnerConnectionSchema>;
export type PartnerSession = z.infer<typeof PartnerSessionSchema>;
