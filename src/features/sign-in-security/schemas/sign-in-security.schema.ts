/**
 * Sign-in security: lockout policy, recent sign-in attempts, the identity
 * provider's settings, and signing a member out everywhere.
 *
 * 📍 src/features/sign-in-security/schemas/sign-in-security.schema.ts
 */

import { z } from "zod";

export const PolicySchema = z.object({
  attempts_limit: z.number(),
  block_minutes: z.number(),
});
export type SigninPolicy = z.infer<typeof PolicySchema>;

const range = z.tuple([z.number(), z.number()]);

export const PolicyResponseSchema = z.object({
  response: z.object({
    policy: PolicySchema,
    bounds: z.object({ attempts_limit: range, block_minutes: range }),
  }),
});
export type PolicyWithBounds = z.infer<typeof PolicyResponseSchema>["response"];

export const UpdatedPolicyResponseSchema = z.object({ response: PolicySchema });

export const LoginAttemptSchema = z.object({
  identifier: z.string(),
  status: z.string(),
  type: z.string().nullable(),
  succeeded: z.boolean(),
  ip_address: z.string().nullable(),
  browser: z.string().nullable().optional(),
  os: z.string().nullable().optional(),
  device_type: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
  created_at: z.string(),
});
export type LoginAttempt = z.infer<typeof LoginAttemptSchema>;

export const LoginAttemptsResponseSchema = z.object({
  response: z.object({
    items: z.array(LoginAttemptSchema),
    next_before: z.string().nullable(),
  }),
});
export type LoginAttemptsPage = z.infer<
  typeof LoginAttemptsResponseSchema
>["response"];

export type LoginAttemptFilters = {
  identifier: string;
  result: "" | "success" | "failure";
};

export const PostureSchema = z.object({
  issuer: z.string(),
  access_token_audience: z.string().optional(),
  pkce_required: z.boolean().optional(),
  response_types: z.array(z.string()).optional(),
  refresh_token_rotation: z.boolean().optional(),
  refresh_token_reuse_protection: z.boolean().optional(),
  refresh_token_grace_period_seconds: z.number().optional(),
  rp_initiated_logout: z.boolean().optional(),
  consent_prompt: z.string().optional(),
  lifetimes_seconds: z.record(z.string(), z.number()).optional(),
  redirect_uri_schemes: z.array(z.string()).optional(),
  localhost_redirects_allowed: z.boolean().optional(),
  first_party_only_scopes: z.array(z.string()).optional(),
  signing_keys: z
    .object({ active: z.string(), inactive: z.array(z.string()) })
    .optional(),
  signin_policy: PolicySchema.optional(),
});
export type SecurityPosture = z.infer<typeof PostureSchema>;

export const PostureResponseSchema = z.object({ response: PostureSchema });

export const MessageResponseSchema = z.object({
  message: z.object({ general: z.array(z.string()).optional() }).optional(),
});

/** Policy edits are bounded on the server; the same bounds are checked here. */
export function policyFormSchema(bounds: PolicyWithBounds["bounds"]) {
  const [aMin, aMax] = bounds.attempts_limit;
  const [bMin, bMax] = bounds.block_minutes;
  // The inputs hand over numbers (NaN when empty), so no coercion is needed.
  const whole = (min: number, max: number) =>
    z
      .number({ error: "Enter a whole number." })
      .int("Enter a whole number.")
      .min(min, `Between ${min} and ${max}.`)
      .max(max, `Between ${min} and ${max}.`);
  return z.object({
    attempts_limit: whole(aMin, aMax),
    block_minutes: whole(bMin, bMax),
  });
}

/** "1 h 30 min", "15 min", "7 days". */
export function formatDuration(seconds: number): string {
  if (seconds % 86400 === 0 && seconds >= 86400)
    return `${seconds / 86400} day${seconds === 86400 ? "" : "s"}`;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return (
    [h && `${h} h`, m && `${m} min`, s && `${s} s`].filter(Boolean).join(" ") ||
    "0 s"
  );
}
