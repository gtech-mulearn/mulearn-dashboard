import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import type { OnboardingFormValues } from "../schemas";
import {
  type MentorApplication,
  MentorApplicationResponseSchema,
} from "../schemas";

function serializePayload(data: Partial<OnboardingFormValues>) {
  return {
    ...data,
    ...(data.expertise !== undefined && {
      expertise: JSON.stringify(data.expertise),
    }),
  };
}

function normalizeMentor(raw: MentorApplication): MentorApplication {
  const exp = (raw as Record<string, unknown>).expertise;
  let expertise: string[];
  if (Array.isArray(exp)) expertise = exp as string[];
  else if (typeof exp === "string") {
    try {
      expertise = JSON.parse(exp);
    } catch {
      expertise = [];
    }
  } else expertise = [];
  return { ...raw, expertise };
}

export async function getMentorApplication(): Promise<MentorApplication> {
  const res = await apiClient.get(
    endpoints.mentor.onboarding,
    MentorApplicationResponseSchema,
    { skipAuthRedirectOn403: true },
  );
  return normalizeMentor(res.response.mentor);
}

export async function submitMentorApplication(
  data: OnboardingFormValues,
): Promise<MentorApplication> {
  const res = await apiClient.post(
    endpoints.mentor.onboarding,
    serializePayload(data),
    MentorApplicationResponseSchema,
    { skipAuthRedirectOn403: true },
  );
  return normalizeMentor(res.response.mentor);
}

export async function updateMentorApplication(
  data: Partial<OnboardingFormValues>,
): Promise<MentorApplication> {
  const res = await apiClient.patch(
    endpoints.mentor.onboarding,
    serializePayload(data),
    MentorApplicationResponseSchema,
    { skipAuthRedirectOn403: true },
  );
  return normalizeMentor(res.response.mentor);
}
