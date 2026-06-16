/**
 * StepperHeader — Visual step indicator with progress
 *
 * 📍 src/features/company-jobs/components/job-stepper/stepper-header.tsx
 */

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { StepDefinition } from "../../types";

interface StepperHeaderProps {
  steps: StepDefinition[];
  currentStepIndex: number;
  onStepClick: (index: number) => void;
}

export function StepperHeader({
  steps,
  currentStepIndex,
  onStepClick,
}: StepperHeaderProps) {
  return (
    <nav aria-label="Job creation progress" className="w-full">
      <ol className="grid gap-3 sm:flex sm:items-center sm:gap-0">
        {steps.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;
          const isClickable = index <= currentStepIndex;

          return (
            <li
              key={step.id}
              className={cn(
                "flex items-center",
                index < steps.length - 1 && "sm:flex-1",
              )}
            >
              {/* Step circle + label */}
              <Button
                type="button"
                variant="ghost"
                onClick={() => isClickable && onStepClick(index)}
                disabled={!isClickable}
                className={cn(
                  "flex w-full min-w-0 items-center gap-2.5 rounded-lg px-3 py-2 text-left transition-colors sm:w-auto",
                  isClickable && "cursor-pointer",
                  !isClickable && "cursor-default opacity-50",
                )}
              >
                {/* Circle */}
                <div
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all duration-200",
                    isCompleted &&
                      "border-primary bg-primary text-primary-foreground",
                    isCurrent && "border-primary bg-primary/10 text-primary",
                    !isCompleted &&
                      !isCurrent &&
                      "border-border bg-background text-muted-foreground",
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>

                {/* Label */}
                <div className="min-w-0">
                  <p
                    className={cn(
                      "text-sm font-medium leading-tight",
                      isCurrent && "text-primary",
                      isCompleted && "text-foreground",
                      !isCurrent && !isCompleted && "text-muted-foreground",
                    )}
                  >
                    {step.label}
                  </p>
                  <p className="mt-0.5 hidden text-xs text-muted-foreground lg:block">
                    {step.description}
                  </p>
                </div>
              </Button>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "mx-2 hidden h-0.5 flex-1 transition-colors duration-300 sm:block",
                    isCompleted ? "bg-primary" : "bg-border",
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
