"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormProvider } from "react-hook-form";
import { StepperHeader } from "@/components/stepper-header";
import { Button } from "@/components/ui/button";
import type { CompanyProfile } from "@/features/company-jobs/types";
import { useUpdateCompanyProfile } from "../hooks/use-profile-edit";
import { useProfileStepper } from "../hooks/use-profile-stepper";
import { PROFILE_STEPPER_STEPS } from "../schemas";
import { StepBasicInfo } from "./steps/step-basic-info";
import { StepContact } from "./steps/step-contact";
import { StepCulture } from "./steps/step-culture";
import { StepLegal } from "./steps/step-legal";
import { StepReview } from "./steps/step-review";

interface ProfileStepperProps {
  profile: CompanyProfile;
}

export function ProfileStepper({ profile }: ProfileStepperProps) {
  const router = useRouter();
  const {
    form,
    currentStepIndex,
    currentStep,
    isFirstStep,
    isLastStep,
    goNext,
    goBack,
    goToStep,
  } = useProfileStepper(profile);

  const { mutate, isPending } = useUpdateCompanyProfile();

  function onSubmit(values: Parameters<typeof mutate>[0]) {
    mutate(values, {
      onSuccess: () => router.push("/dashboard/profile"),
    });
  }

  function renderStep() {
    switch (currentStep) {
      case "basic-info":
        return <StepBasicInfo />;
      case "contact":
        return <StepContact />;
      case "legal":
        return <StepLegal />;
      case "culture":
        return <StepCulture />;
      case "review":
        return <StepReview />;
      default:
        return null;
    }
  }

  return (
    <FormProvider {...form}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (isLastStep) form.handleSubmit(onSubmit)(e);
        }}
        className="flex flex-col"
      >
        {/* ── Step indicator ── */}
        <div className="pb-6">
          <StepperHeader
            steps={PROFILE_STEPPER_STEPS}
            currentStepIndex={currentStepIndex}
            onStepClick={goToStep}
            ariaLabel="Company profile edit progress"
          />
        </div>

        {/* ── Step content ── */}
        <div className="rounded-2xl border border-border bg-card p-4 sm:p-6">
          <section className="space-y-6">{renderStep()}</section>
        </div>

        {/* ── Navigation bar ── */}
        <div className="mt-4 flex items-center justify-between border-t border-border bg-card/80 px-0 py-4 backdrop-blur-sm">
          <Button
            type="button"
            variant="ghost"
            className="text-muted-foreground hover:text-foreground"
            onClick={() => router.push("/dashboard/profile")}
            aria-label="Cancel"
          >
            Cancel
          </Button>

          <div className="flex items-center gap-2">
            {!isFirstStep ? (
              <Button
                type="button"
                variant="outline"
                className="border-border"
                onClick={goBack}
                aria-label="Go to previous step"
              >
                Back
              </Button>
            ) : null}

            {!isLastStep ? (
              <Button type="button" className="rounded-xl" onClick={goNext}>
                Next
              </Button>
            ) : (
              <Button type="submit" className="rounded-xl" disabled={isPending}>
                {isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {profile.status === "rejected"
                  ? "Resubmit Company Registration"
                  : "Save Profile"}
              </Button>
            )}
          </div>
        </div>
      </form>
    </FormProvider>
  );
}
