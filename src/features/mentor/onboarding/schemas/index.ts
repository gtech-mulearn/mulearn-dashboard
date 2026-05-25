import { z } from "zod";
import { ApiResponseSchema } from "@/lib/schemas/api-response";

export const MentorApplicationSchema = z.object({
  id: z.string(),
  full_name: z.string().optional(),
  email: z.string().optional(),
  muid: z.string().optional(),
  profile_pic: z.string().nullable().optional(),
  about: z.string().nullable().optional(),
  expertise: z.preprocess((val) => {
    if (typeof val === "string") {
      try {
        return JSON.parse(val);
      } catch {
        return [];
      }
    }
    return val ?? [];
  }, z.array(z.string())),
  reason: z.string().nullable().optional(),
  is_verified: z.boolean(),
  verified_by_name: z.string().nullable().optional(),
  verified_at: z.string().nullable().optional(),
  verification_note: z.string().nullable().optional(),
  mentor_tier: z.string().nullable().optional(),
  hours: z.number().optional(),
  created_at: z.string().nullable().optional(),
});
export type MentorApplication = z.infer<typeof MentorApplicationSchema>;

export const MentorApplicationResponseSchema = ApiResponseSchema(
  z.object({ mentor: MentorApplicationSchema }),
);

export const OnboardingFormSchema = z.object({
  about: z.string().min(50, "About must be at least 50 characters"),
  expertise: z
    .array(z.string())
    .min(1, "Add at least one expertise tag")
    .max(10, "Maximum 10 tags"),
  reason: z.string().min(30, "Reason must be at least 30 characters"),
  preferred_ig_ids: z.array(z.string()),
});
export type OnboardingFormValues = z.infer<typeof OnboardingFormSchema>;

export type OnboardingState =
  | "loading"
  | "not_applied"
  | "pending_verification"
  | "rejected"
  | "verified";
