import { z } from "zod";

export const CodeSentSchema = z.object({
  expires_in: z.number(),
  resend_after: z.number(),
  sent_to: z.string(),
});

export const VerifyRequestResultSchema = z.union([
  CodeSentSchema,
  z.object({ already_verified: z.literal(true) }),
]);

export const SignupTokenSchema = z.object({
  email_verification_token: z.string(),
  expires_in: z.number(),
});

export const EmailVerificationStatusSchema = z.object({
  email: z.string(),
  verified: z.boolean(),
  verified_at: z.string().nullable(),
  via: z.string().nullable(),
  has_password: z.boolean(),
});

export const VerifyConfirmResultSchema = z.object({
  verified: z.literal(true),
  verified_at: z.string().nullable(),
});

export const ChangeConfirmResultSchema = z.object({
  email: z.string(),
  verified: z.literal(true),
});

// The api client validates the whole Django envelope, so wrap each payload.
export const CodeSentResponseSchema = z.object({ response: CodeSentSchema });
export const VerifyRequestResponseSchema = z.object({
  response: VerifyRequestResultSchema,
});
export const SignupTokenResponseSchema = z.object({
  response: SignupTokenSchema,
});
export const EmailVerificationStatusResponseSchema = z.object({
  response: EmailVerificationStatusSchema,
});
export const VerifyConfirmResponseSchema = z.object({
  response: VerifyConfirmResultSchema,
});
export const ChangeConfirmResponseSchema = z.object({
  response: ChangeConfirmResultSchema,
});

export type CodeSent = z.infer<typeof CodeSentSchema>;
export type VerifyRequestResult = z.infer<typeof VerifyRequestResultSchema>;
export type SignupToken = z.infer<typeof SignupTokenSchema>;
export type EmailVerificationStatus = z.infer<
  typeof EmailVerificationStatusSchema
>;
export type VerifyConfirmResult = z.infer<typeof VerifyConfirmResultSchema>;
export type ChangeConfirmResult = z.infer<typeof ChangeConfirmResultSchema>;
