"use client";

/**
 * JobStepper — Main stepper container that renders step components
 *
 * 📍 src/features/company-jobs/components/job-stepper/job-stepper.tsx
 *
 * Orchestrates the multi-step form: wires the stepper hook to step components,
 * manages local rules state, and handles final form submission.
 */

import { ArrowLeft, ArrowRight, Loader2, Send } from "lucide-react";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useJobStepper } from "../../hooks";
import type { JobFormValues, RuleFormValues } from "../../schemas";
import type { Job, JobRule } from "../../types";
import { StepBasicInfo } from "./step-basic-info";
import { StepRequirements } from "./step-requirements";
import { StepReview } from "./step-review";
import { StepRules } from "./step-rules";
import { StepperHeader } from "./stepper-header";

interface JobStepperProps {
  /** Pass an existing job to prefill for editing */
  initialJob?: Job;
  /** Called with the form values on final submit */
  onSubmit: (values: JobFormValues, rules: JobRule[]) => void;
  /** Called to navigate away */
  onCancel: () => void;
  /** Whether the submit mutation is pending */
  isSubmitting: boolean;
}

export function JobStepper({
  initialJob,
  onSubmit,
  onCancel,
  isSubmitting,
}: JobStepperProps) {
  const {
    form,
    currentStepIndex,
    currentStep,
    steps,
    isFirstStep,
    isLastStep,
    goToStep,
    nextStep,
    prevStep,
    getFormValues,
    isEditing,
  } = useJobStepper({ initialJob });

  // Local rules state (persisted to server after job creation)
  const [localRules, setLocalRules] = useState<JobRule[]>(
    initialJob?.rules ?? [],
  );

  const handleAddRule = useCallback((values: RuleFormValues) => {
    const newRule: JobRule = {
      id: `local-${Date.now()}`,
      rule_type: values.rule_type as JobRule["rule_type"],
      rule_value: values.rule_value,
    };
    setLocalRules((prev) => [...prev, newRule]);
  }, []);

  const handleDeleteRule = useCallback((ruleId: string) => {
    setLocalRules((prev) => prev.filter((r) => r.id !== ruleId));
  }, []);

  const handleFinalSubmit = useCallback(() => {
    const values = getFormValues();
    onSubmit(values, localRules);
  }, [getFormValues, localRules, onSubmit]);

  // Render the active step
  function renderStep() {
    switch (currentStep) {
      case "basic-info":
        return <StepBasicInfo form={form} />;
      case "requirements":
        return <StepRequirements form={form} />;
      case "rules":
        return (
          <StepRules
            rules={localRules}
            onAddRule={handleAddRule}
            onDeleteRule={handleDeleteRule}
          />
        );
      case "review":
        return (
          <StepReview
            values={getFormValues()}
            rules={localRules}
            onEditStep={goToStep}
            isEditing={isEditing}
          />
        );
      default:
        return null;
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 sm:space-y-8">
      {/* Stepper header */}
      <StepperHeader
        steps={steps}
        currentStepIndex={currentStepIndex}
        onStepClick={goToStep}
      />

      {/* Step content */}
      <Form {...form}>
        <form
          onSubmit={(e) => e.preventDefault()}
          className="rounded-xl border border-border bg-card p-4 sm:p-6"
        >
          {renderStep()}

          {/* Navigation buttons */}
          <div className="mt-8 flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              {isFirstStep ? (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onCancel}
                  className="w-full gap-1.5 text-muted-foreground sm:w-auto"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Cancel
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={prevStep}
                  className="w-full gap-1.5 text-muted-foreground sm:w-auto"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
              )}
            </div>

            <div className="sm:ml-auto">
              {isLastStep ? (
                <Button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => form.handleSubmit(handleFinalSubmit)()}
                  className="w-full gap-2 sm:w-auto"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {isEditing ? "Updating…" : "Creating…"}
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      {isEditing ? "Update Job" : "Create Job"}
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={nextStep}
                  className="w-full gap-1.5 sm:w-auto"
                >
                  Next
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
