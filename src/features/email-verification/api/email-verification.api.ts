import { apiClient, publicApiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import {
  ChangeConfirmResponseSchema,
  type ChangeConfirmResult,
  type CodeSent,
  CodeSentResponseSchema,
  type EmailVerificationStatus,
  EmailVerificationStatusResponseSchema,
  type SignupToken,
  SignupTokenResponseSchema,
  VerifyConfirmResponseSchema,
  type VerifyConfirmResult,
  VerifyRequestResponseSchema,
  type VerifyRequestResult,
} from "../schemas";

// Signup: there is no account yet, so no auth header.
export async function sendSignupCode(email: string): Promise<CodeSent> {
  const data = await publicApiClient.post(
    endpoints.register.emailCode,
    { email },
    CodeSentResponseSchema,
  );
  return data.response;
}

export async function verifySignupCode(
  email: string,
  code: string,
): Promise<SignupToken> {
  const data = await publicApiClient.post(
    endpoints.register.emailCodeVerify,
    { email, code },
    SignupTokenResponseSchema,
  );
  return data.response;
}

export async function getEmailVerificationStatus(): Promise<EmailVerificationStatus> {
  const data = await apiClient.get(
    endpoints.emailVerification.status,
    EmailVerificationStatusResponseSchema,
  );
  return data.response;
}

export async function requestEmailVerification(): Promise<VerifyRequestResult> {
  const data = await apiClient.post(
    endpoints.emailVerification.verifyRequest,
    {},
    VerifyRequestResponseSchema,
  );
  return data.response;
}

export async function confirmEmailVerification(
  code: string,
): Promise<VerifyConfirmResult> {
  const data = await apiClient.post(
    endpoints.emailVerification.verifyConfirm,
    { code },
    VerifyConfirmResponseSchema,
  );
  return data.response;
}

export async function requestEmailChange(
  newEmail: string,
  currentPassword?: string,
): Promise<CodeSent> {
  const data = await apiClient.post(
    endpoints.emailVerification.changeRequest,
    {
      new_email: newEmail,
      ...(currentPassword ? { current_password: currentPassword } : {}),
    },
    CodeSentResponseSchema,
  );
  return data.response;
}

export async function confirmEmailChange(
  code: string,
): Promise<ChangeConfirmResult> {
  const data = await apiClient.post(
    endpoints.emailVerification.changeConfirm,
    { code },
    ChangeConfirmResponseSchema,
  );
  return data.response;
}
