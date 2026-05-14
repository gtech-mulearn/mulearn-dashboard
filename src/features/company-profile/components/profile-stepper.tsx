"use client";

import { Check, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Fragment } from "react";
import { FormProvider } from "react-hook-form";
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
        {/* ── Step indicator (desktop) ── */}
        <div className="mx-auto hidden w-full items-center gap-4 pb-6 sm:flex">
          {PROFILE_STEPPER_STEPS.map((step, index) => {
            const isActive = index === currentStepIndex;
            const isCompleted = index < currentStepIndex;

            return (
              <Fragment key={step.id}>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    disabled={!isCompleted}
                    onClick={() => isCompleted && goToStep(index)}
                    className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors ${
                      isActive
                        ? "border-primary bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2"
                        : isCompleted
                          ? "cursor-pointer border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background text-muted-foreground"
                    }`}
                  >
                    {isCompleted ? <Check className="h-4 w-4" /> : index + 1}
                  </button>
                  <div className="min-w-0 pt-1">
                    <p
                      className={`whitespace-nowrap text-xs leading-none ${isActive ? "font-medium text-primary" : "text-muted-foreground"}`}
                    >
                      {step.label}
                    </p>
                  </div>
                </div>
                {index < PROFILE_STEPPER_STEPS.length - 1 ? (
                  <div
                    className={`h-0.5 flex-1 self-center ${isCompleted ? "bg-primary" : "bg-border"}`}
                  />
                ) : null}
              </Fragment>
            );
          })}
        </div>

        {/* ── Step indicator (mobile) ── */}
        <div className="pb-4 sm:hidden">
          <p className="text-sm font-medium text-foreground">
            Step {currentStepIndex + 1} of {PROFILE_STEPPER_STEPS.length} —{" "}
            {PROFILE_STEPPER_STEPS[currentStepIndex]?.label}
          </p>
          <div className="mt-2 h-1 w-full rounded-full bg-border">
            <div
              className="h-1 rounded-full bg-primary transition-all"
              style={{
                width: `${((currentStepIndex + 1) / PROFILE_STEPPER_STEPS.length) * 100}%`,
              }}
            />
          </div>
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
              >
                Back
              </Button>
            ) : null}

            {!isLastStep ? (
              <Button
                type="button"
                className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={goNext}
              >
                Next
              </Button>
            ) : (
              <Button
                type="submit"
                className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={isPending}
              >
                {isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Save Profile
              </Button>
            )}
          </div>
        </div>
      </form>
    </FormProvider>
  );
}
