/**
 * RuleEmptyState — Empty state for eligibility rules
 *
 * 📍 src/features/company-jobs/components/rules/rule-empty-state.tsx
 */

import { ShieldCheck } from "lucide-react";

interface RuleEmptyStateProps {
  showAddHint?: boolean;
}

export function RuleEmptyState({ showAddHint = true }: RuleEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-muted/30 p-6">
      <div className="rounded-full bg-muted p-3">
        <ShieldCheck className="h-5 w-5 text-muted-foreground" />
      </div>
      <p className="text-sm text-muted-foreground text-center">
        No eligibility rules added yet.
        {showAddHint && (
          <>
            <br />
            <span className="text-xs">
              Add rules to filter candidates by skills, interests, or
              achievements.
            </span>
          </>
        )}
      </p>
    </div>
  );
}
