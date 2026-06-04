// src/features/company-profile/schemas/index.ts

import { z } from "zod";
import {
  CompanyProfileResponseSchema,
  CompanyProfileSchema,
} from "@/features/company-jobs/schemas";
import { ApiResponseSchema } from "@/lib/schemas/api-response";

// ─── Re-export for convenience ────────────────────────────────
export { CompanyProfileResponseSchema, CompanyProfileSchema };

// ─── Update mutation response ─────────────────────────────────
export const UpdateProfileResponseSchema =
  ApiResponseSchema(CompanyProfileSchema);

// ─── Step 1: Basic Info ───────────────────────────────────────
export const BasicInfoStepSchema = z.object({
  name: z
    .string()
    .min(1, "Company name is required")
    .max(75, "Max 75 characters"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(100, "Max 100 characters")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must be lowercase letters, numbers, and hyphens only",
    ),
  description: z.string().min(1, "Description is required"),
  industry_sector: z
    .string()
    .max(75)
    .nullish()
    .transform((v) => v ?? null),
  company_size: z
    .string()
    .max(50)
    .nullish()
    .transform((v) => v ?? null),
  founded_year: z
    .number()
    .int()
    .min(1800, "Must be 1800 or later")
    .max(
      new Date().getFullYear(),
      `Must be ${new Date().getFullYear()} or earlier`,
    )
    .nullish()
    .transform((v) => v ?? null),
  location: z
    .string()
    .max(150)
    .nullish()
    .transform((v) => v ?? null),
});

// ─── Step 2: Contact & Links ──────────────────────────────────
export const ContactStepSchema = z.object({
  email: z
    .string()
    .email("Invalid email address")
    .max(100)
    .nullish()
    .or(z.literal(""))
    .transform((v) => v || null),
  website_link: z
    .string()
    .url("Must be a valid URL (include https://)")
    .max(500)
    .nullish()
    .or(z.literal(""))
    .transform((v) => v || null),
  linkedin_url: z
    .string()
    .url("Must be a valid URL (include https://)")
    .max(500)
    .nullish()
    .or(z.literal(""))
    .transform((v) => v || null),
});

// ─── Step 3: Legal & Verification ────────────────────────────
export const LegalStepSchema = z.object({
  legal_name: z
    .string()
    .max(150)
    .nullish()
    .transform((v) => v ?? null),
  registration_number: z
    .string()
    .max(100)
    .nullish()
    .transform((v) => v ?? null),
  tax_id: z
    .string()
    .max(100)
    .nullish()
    .transform((v) => v ?? null),
  verification_document_url: z
    .string()
    .nullish()
    .transform((v) => v ?? null),
});

// ─── Step 4: Culture & Brand ──────────────────────────────────
export const CultureStepSchema = z.object({
  remote_policy: z
    .enum(["Remote", "Hybrid", "In-office"])
    .nullish()
    .transform((v) => v ?? null),
  culture_text: z
    .string()
    .nullish()
    .transform((v) => v ?? null),
  tech_stack: z
    .array(z.string().min(1).max(100))
    .max(30, "Max 30 items")
    .default([]),
  perks: z
    .array(z.string().min(1).max(100))
    .max(30, "Max 30 items")
    .default([]),
});

// ─── Combined form schema ─────────────────────────────────────
export const ProfileEditFormSchema = BasicInfoStepSchema.merge(
  ContactStepSchema,
)
  .merge(LegalStepSchema)
  .merge(CultureStepSchema);

// ─── Inferred types ───────────────────────────────────────────
export type BasicInfoStepValues = z.infer<typeof BasicInfoStepSchema>;
export type ContactStepValues = z.infer<typeof ContactStepSchema>;
export type LegalStepValues = z.infer<typeof LegalStepSchema>;
export type CultureStepValues = z.infer<typeof CultureStepSchema>;
export type ProfileEditFormValues = z.infer<typeof ProfileEditFormSchema>;

// ─── Step ID type ─────────────────────────────────────────────
export type ProfileStepId =
  | "basic-info"
  | "contact"
  | "legal"
  | "culture"
  | "review";

export interface ProfileStepDefinition {
  id: ProfileStepId;
  label: string;
  description: string;
}

export const PROFILE_STEPPER_STEPS: ProfileStepDefinition[] = [
  {
    id: "basic-info",
    label: "Basic Info",
    description: "Name, slug, industry, size",
  },
  {
    id: "contact",
    label: "Contact",
    description: "Email, website, LinkedIn",
  },
  {
    id: "legal",
    label: "Legal",
    description: "Registration & tax details",
  },
  {
    id: "culture",
    label: "Culture",
    description: "Remote policy, tech stack, perks",
  },
  {
    id: "review",
    label: "Review & Save",
    description: "Confirm and submit changes",
  },
] as const;
