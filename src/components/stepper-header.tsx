/**
 * StepperHeader — shared visual step indicator with progress
 *
 * 📍 src/components/stepper-header.tsx
 *
 * Reusable multi-step header used across multi-step flows (Create Job,
 * IG Requests, …) so step navigation/progress looks consistent everywhere.
 * Mirrors the Event Creation wizard style: a compact circle row on desktop and
 * a "Step X of N" + progress bar on mobile (so it never overflows narrow
 * dialogs). Purely presentational — the parent owns the current step + config.
 */

import { Check } from "lucide-react";
import { Fragment } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface StepperStep {
  id: string;
  label: string;
  description?: string;
}

interface StepperHeaderProps {
  steps: StepperStep[];
  /** 0-based index of the current step. */
  currentStepIndex: number;
  onStepClick: (index: number) => void;
  /** Accessible label for the progress nav. */
  ariaLabel?: string;
}

export function StepperHeader({
  steps,
  currentStepIndex,
  onStepClick,
  ariaLabel = "Progress",
}: StepperHeaderProps) {
  const current = steps[currentStepIndex];

  return (
    <nav aria-label={ariaLabel} className="w-full">
      {/* Desktop: circle row with connectors */}
      <div className="hidden w-full items-center gap-4 sm:flex">
        {steps.map((step, index) => {
          const isActive = index === currentStepIndex;
          const isCompleted = index < currentStepIndex;

          return (
            <Fragment key={step.id}>
              <div className="flex items-center gap-3">
                {isActive ? (
                  <Button
                    variant="default"
                    size="icon-sm"
                    className="ring-2 ring-brand-blue ring-offset-2"
                    disabled
                  >
                    {index + 1}
                  </Button>
                ) : isCompleted ? (
                  <Button
                    variant="default"
                    size="icon-sm"
                    aria-label={`Go to step ${index + 1}: ${step.label}`}
                    onClick={() => onStepClick(index)}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button variant="secondary" size="icon-sm" disabled>
                    {index + 1}
                  </Button>
                )}
                <div className="min-w-0 pt-1">
                  <p
                    className={cn(
                      "text-xs whitespace-nowrap leading-none",
                      isActive
                        ? "font-medium text-foreground"
                        : "text-muted-foreground",
                    )}
                  >
                    {step.label}
                  </p>
                </div>
              </div>
              {index < steps.length - 1 ? (
                <div
                  className={cn(
                    "h-0.5 flex-1 self-center",
                    isCompleted ? "bg-primary" : "bg-border",
                  )}
                />
              ) : null}
            </Fragment>
          );
        })}
      </div>

      {/* Mobile: step text + progress bar */}
      <div className="w-full sm:hidden">
        <p className="text-sm font-medium text-foreground">
          Step {currentStepIndex + 1} of {steps.length}
          {current ? ` - ${current.label}` : ""}
        </p>
        <div className="mt-2 h-1 w-full rounded-full bg-border">
          <div
            className="h-1 rounded-full bg-primary transition-all"
            style={{
              width: `${((currentStepIndex + 1) / steps.length) * 100}%`,
            }}
          />
        </div>
      </div>
    </nav>
  );
}
