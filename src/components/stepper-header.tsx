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
import { buttonVariants } from "@/components/ui/button";
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
              <button
                type="button"
                aria-label={`Go to step ${index + 1}: ${step.label}`}
                aria-current={isActive ? "step" : undefined}
                onClick={() => onStepClick(index)}
                className="group flex cursor-pointer items-center gap-3 rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {isActive ? (
                  <span
                    className={cn(
                      buttonVariants({ variant: "default", size: "icon-sm" }),
                      "ring-2 ring-brand-blue ring-offset-2 pointer-events-none text-xs",
                    )}
                  >
                    {index + 1}
                  </span>
                ) : isCompleted ? (
                  <span
                    className={cn(
                      buttonVariants({ variant: "default", size: "icon-sm" }),
                      "pointer-events-none text-xs",
                    )}
                  >
                    <Check className="h-4 w-4" />
                  </span>
                ) : (
                  <span
                    className={cn(
                      buttonVariants({ variant: "secondary", size: "icon-sm" }),
                      "pointer-events-none group-hover:bg-muted/80 text-xs",
                    )}
                  >
                    {index + 1}
                  </span>
                )}
                <div className="min-w-0 pt-1">
                  <p
                    className={cn(
                      "text-xs whitespace-nowrap leading-none transition-colors",
                      isActive
                        ? "font-medium text-foreground"
                        : "text-muted-foreground group-hover:text-foreground",
                    )}
                  >
                    {step.label}
                  </p>
                </div>
              </button>
              {index < steps.length - 1 ? (
                <div
                  className={cn(
                    "h-0.5 flex-1 self-center transition-colors",
                    isCompleted ? "bg-primary" : "bg-border",
                  )}
                />
              ) : null}
            </Fragment>
          );
        })}
      </div>

      {/* Mobile: step text + interactive step chips + progress bar */}
      <div className="w-full space-y-2 sm:hidden">
        <p className="text-sm font-medium text-foreground">
          Step {currentStepIndex + 1} of {steps.length}
          {current ? ` - ${current.label}` : ""}
        </p>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {steps.map((step, index) => {
            const isActive = index === currentStepIndex;
            const isCompleted = index < currentStepIndex;

            return (
              <button
                key={step.id}
                type="button"
                onClick={() => onStepClick(index)}
                aria-label={`Go to step ${index + 1}: ${step.label}`}
                className={cn(
                  "flex items-center gap-1 shrink-0 rounded-full px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer",
                  isActive
                    ? "bg-primary text-primary-foreground font-semibold"
                    : isCompleted
                      ? "bg-primary/10 text-primary hover:bg-primary/20"
                      : "bg-muted text-muted-foreground hover:bg-muted/80",
                )}
              >
                {isCompleted ? <Check className="h-3 w-3" /> : index + 1}
                <span>{step.label}</span>
              </button>
            );
          })}
        </div>
        <div className="h-1 w-full rounded-full bg-border">
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
