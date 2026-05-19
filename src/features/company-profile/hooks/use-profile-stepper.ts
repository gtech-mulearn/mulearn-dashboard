"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { type Resolver, useForm } from "react-hook-form";
import type { CompanyProfile } from "@/features/company-jobs/types";
import {
  PROFILE_STEPPER_STEPS,
  ProfileEditFormSchema,
  type ProfileEditFormValues,
} from "../schemas";

// Per-step field lists for partial validation on "Next"
const STEP_FIELDS: Record<number, (keyof ProfileEditFormValues)[]> = {
  0: [
    "name",
    "slug",
    "description",
    "industry_sector",
    "company_size",
    "founded_year",
    "location",
  ],
  1: ["email", "website_link", "linkedin_url"],
  2: [
    "legal_name",
    "registration_number",
    "tax_id",
    "verification_document_url",
  ],
  3: ["remote_policy", "culture_text", "tech_stack", "perks"],
};

export function useProfileStepper(profile: CompanyProfile) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const form = useForm<ProfileEditFormValues>({
    resolver: zodResolver(
      ProfileEditFormSchema,
    ) as Resolver<ProfileEditFormValues>,
    defaultValues: {
      name: profile.name ?? "",
      slug: profile.slug ?? "",
      description: profile.description ?? "",
      industry_sector: profile.industry_sector ?? null,
      company_size: profile.company_size ?? null,
      founded_year: profile.founded_year ?? null,
      location: profile.location ?? null,
      email: profile.email ?? null,
      website_link: profile.website_link ?? null,
      linkedin_url: profile.linkedin_url ?? null,
      legal_name: profile.legal_name ?? null,
      registration_number: profile.registration_number ?? null,
      tax_id: profile.tax_id ?? null,
      verification_document_url: profile.verification_document_url ?? null,
      remote_policy:
        (profile.remote_policy as
          | "Remote"
          | "Hybrid"
          | "In-office"
          | null
          | undefined) ?? null,
      culture_text: profile.culture_text ?? null,
      tech_stack: profile.tech_stack ?? [],
      perks: profile.perks ?? [],
    },
    mode: "onTouched",
  });

  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === PROFILE_STEPPER_STEPS.length - 1;
  const isReviewStep = currentStepIndex === PROFILE_STEPPER_STEPS.length - 1;

  /**
   * Validate the current step's fields then advance.
   * Returns true if navigation occurred, false if validation failed.
   */
  async function goNext(): Promise<boolean> {
    const fields = STEP_FIELDS[currentStepIndex];
    if (fields && fields.length > 0) {
      const valid = await form.trigger(fields);
      if (!valid) return false;
    }
    setCurrentStepIndex((i) =>
      Math.min(i + 1, PROFILE_STEPPER_STEPS.length - 1),
    );
    return true;
  }

  function goBack(): void {
    setCurrentStepIndex((i) => Math.max(i - 1, 0));
  }

  /**
   * Jump to an arbitrary step index.
   * Going backwards is always allowed; going forward validates all intermediate steps.
   */
  async function goToStep(index: number): Promise<void> {
    if (index < 0 || index >= PROFILE_STEPPER_STEPS.length) return;

    if (index <= currentStepIndex) {
      setCurrentStepIndex(index);
      return;
    }

    // Validate all steps between current and target
    for (let i = currentStepIndex; i < index; i++) {
      const fields = STEP_FIELDS[i];
      if (fields && fields.length > 0) {
        const valid = await form.trigger(fields);
        if (!valid) {
          setCurrentStepIndex(i);
          return;
        }
      }
    }

    setCurrentStepIndex(index);
  }

  return {
    form,
    currentStepIndex,
    currentStep: PROFILE_STEPPER_STEPS[currentStepIndex].id,
    steps: PROFILE_STEPPER_STEPS,
    isFirstStep,
    isLastStep,
    isReviewStep,
    goNext,
    goBack,
    goToStep,
  };
}
