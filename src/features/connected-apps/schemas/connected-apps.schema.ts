/**
 * Connected apps (OAuth clients for "Sign in with µLearn").
 *
 * 📍 src/features/connected-apps/schemas/connected-apps.schema.ts
 *
 * The authserver is the authority (muauth/oidc/client_registration.py); the
 * checks here mirror it so an admin sees a problem before submitting.
 */

import { z } from "zod";

// ── API shapes ─────────────────────────────────────────────────────────────

export const ConnectedAppSchema = z.object({
  client_id: z.string(),
  name: z.string(),
  client_type: z.enum(["public", "confidential"]),
  redirect_uris: z.array(z.string()),
  post_logout_redirect_uris: z.array(z.string()),
  /** true = first-party: people are never asked to approve it */
  skip_authorization: z.boolean(),
  algorithm: z.string().optional(),
  created: z.string().nullable().optional(),
  updated: z.string().nullable().optional(),
  disabled_at: z.string().nullable(),
});

export type ConnectedApp = z.infer<typeof ConnectedAppSchema>;

export const ConnectedAppListResponseSchema = z.object({
  response: z.object({ items: z.array(ConnectedAppSchema) }),
});

export const ConnectedAppResponseSchema = z.object({
  response: ConnectedAppSchema,
});

export const RegisteredAppResponseSchema = z.object({
  response: z.object({
    client: ConnectedAppSchema,
    /** Only for confidential apps, and only in this one response. */
    client_secret: z.string().nullable(),
  }),
});

export type RegisteredApp = z.infer<
  typeof RegisteredAppResponseSchema
>["response"];

// ── Form ───────────────────────────────────────────────────────────────────

export const CLIENT_ID_PATTERN = /^[a-z0-9][a-z0-9._-]{2,35}$/;
const APP_SCHEMES = new Set(["mulearn:"]);
const LOOPBACK_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);

/** null when the authserver would accept `uri`, else why not (same rules, same order). */
export function redirectUriProblem(uri: string): string | null {
  if (!uri) return "Enter a URI.";
  if (uri !== uri.trim() || /\s/.test(uri)) return "Remove the spaces.";
  if (uri.includes("*")) return "Wildcards aren't allowed.";
  if (uri.includes("#")) return "A redirect URI can't have a fragment (#…).";
  let url: URL;
  try {
    url = new URL(uri);
  } catch {
    return "Enter a full URI, starting with https://.";
  }
  // Checked on the raw text: browsers read "https:///cb" as host "cb", while the
  // authserver (Python's urlsplit) sees no host and refuses it.
  if (url.protocol === "https:")
    return /^https:\/\/[^/?#]/i.test(uri) ? null : "The URI has no host.";
  if (APP_SCHEMES.has(url.protocol)) return null;
  // Allowed only where the authserver runs with ALLOW_LOCALHOST_REDIRECTS (never production).
  if (url.protocol === "http:" && LOOPBACK_HOSTS.has(url.hostname)) return null;
  return "Use https:// (http:// only for localhost in development).";
}

const uriRow = z.object({ value: z.string() });

function checkUris(
  rows: { value: string }[],
  field: "redirect_uris" | "post_logout_redirect_uris",
  required: boolean,
  ctx: z.RefinementCtx,
) {
  const seen = new Set<string>();
  let count = 0;
  rows.forEach((row, index) => {
    if (!row.value && !required) return;
    if (!row.value && rows.length > 1) return; // empty extra rows are ignored
    count += row.value ? 1 : 0;
    const problem = redirectUriProblem(row.value);
    if (problem) {
      ctx.addIssue({
        code: "custom",
        path: [field, index, "value"],
        message: problem,
      });
    } else if (seen.has(row.value)) {
      ctx.addIssue({
        code: "custom",
        path: [field, index, "value"],
        message: "Listed twice.",
      });
    }
    seen.add(row.value);
  });
  if (required && count === 0) {
    ctx.addIssue({
      code: "custom",
      path: [field, 0, "value"],
      message: "Add at least one redirect URI.",
    });
  }
}

export const clientFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(
        3,
        'At least 3 characters. Include the environment, e.g. "µFIFA (prod)".',
      )
      .max(255),
    client_id: z
      .string()
      .trim()
      .regex(
        CLIENT_ID_PATTERN,
        "3–36 lowercase letters, digits, '.', '_' or '-', e.g. mufifa-prod.",
      ),
    client_type: z.enum(["public", "confidential"]),
    skip_authorization: z.boolean(),
    redirect_uris: z.array(uriRow).min(1),
    post_logout_redirect_uris: z.array(uriRow),
  })
  .superRefine((v, ctx) => {
    checkUris(v.redirect_uris, "redirect_uris", true, ctx);
    checkUris(
      v.post_logout_redirect_uris,
      "post_logout_redirect_uris",
      false,
      ctx,
    );
  });

export type ClientFormValues = z.input<typeof clientFormSchema>;

const values = (rows: { value: string }[]) =>
  rows.map((r) => r.value.trim()).filter(Boolean);

export type CreateClientPayload = {
  name: string;
  client_id: string;
  client_type: "public" | "confidential";
  skip_authorization: boolean;
  redirect_uris: string[];
  post_logout_redirect_uris: string[];
};

export type UpdateClientPayload = Pick<
  CreateClientPayload,
  "name" | "skip_authorization" | "redirect_uris" | "post_logout_redirect_uris"
>;

export function toCreatePayload(v: ClientFormValues): CreateClientPayload {
  return {
    name: v.name.trim(),
    client_id: v.client_id.trim(),
    client_type: v.client_type,
    skip_authorization: v.skip_authorization,
    redirect_uris: values(v.redirect_uris),
    post_logout_redirect_uris: values(v.post_logout_redirect_uris),
  };
}

/** client_id and client_type never change after registration. */
export function toUpdatePayload(v: ClientFormValues): UpdateClientPayload {
  const { client_id: _id, client_type: _type, ...rest } = toCreatePayload(v);
  return rest;
}

export function toFormValues(app: ConnectedApp): ClientFormValues {
  const rows = (uris: string[]) =>
    (uris.length ? uris : [""]).map((value) => ({ value }));
  return {
    name: app.name,
    client_id: app.client_id,
    client_type: app.client_type,
    skip_authorization: app.skip_authorization,
    redirect_uris: rows(app.redirect_uris),
    post_logout_redirect_uris: rows(app.post_logout_redirect_uris),
  };
}

export const EMPTY_CLIENT_FORM: ClientFormValues = {
  name: "",
  client_id: "",
  client_type: "confidential",
  skip_authorization: false,
  redirect_uris: [{ value: "" }],
  post_logout_redirect_uris: [{ value: "" }],
};
