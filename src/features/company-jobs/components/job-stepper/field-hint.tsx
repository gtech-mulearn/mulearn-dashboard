"use client";

/**
 * FieldHint / CharCount — small helpers shared by the wizard steps
 *
 * 📍 src/features/company-jobs/components/job-stepper/field-hint.tsx
 *
 * Several job columns are much narrower than they look (experience is 20
 * characters, salary_range is 36). Showing the budget as the user types is
 * what stops a length error from being a surprise at submit time.
 */

import { cn } from "@/lib/utils";

export function FieldHint({ children }: { children: React.ReactNode }) {
  return <p className="mt-1 text-[11px] text-muted-foreground">{children}</p>;
}

interface CharCountProps {
  value: string | undefined;
  max: number;
  /** Show the counter only once the user is close to the limit. */
  threshold?: number;
}

export function CharCount({ value, max, threshold = 0.7 }: CharCountProps) {
  const length = value?.trim().length ?? 0;
  if (length < max * threshold) return null;

  const over = length > max;
  return (
    <span
      className={cn(
        "ml-auto shrink-0 text-[11px] tabular-nums",
        over ? "font-medium text-destructive" : "text-muted-foreground",
      )}
    >
      {length}/{max}
    </span>
  );
}
