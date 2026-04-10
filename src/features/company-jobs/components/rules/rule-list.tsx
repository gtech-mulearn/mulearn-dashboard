"use client";

/**
 * RuleList — List of eligibility rules for a job
 *
 * 📍 src/features/company-jobs/components/rules/rule-list.tsx
 */

import type { JobRule } from "../../types";
import { RuleEmptyState } from "./rule-empty-state";
import { RuleItem } from "./rule-item";

interface RuleListProps {
  rules: JobRule[];
  onDeleteRule?: (ruleId: string) => void;
  deletingRuleId?: string | null;
  readOnly?: boolean;
  showAddHint?: boolean;
}

export function RuleList({
  rules,
  onDeleteRule,
  deletingRuleId,
  readOnly,
  showAddHint = true,
}: RuleListProps) {
  if (rules.length === 0) {
    return <RuleEmptyState showAddHint={showAddHint} />;
  }

  return (
    <div className="space-y-2">
      {rules.map((rule) => (
        <RuleItem
          key={rule.id}
          rule={rule}
          onDelete={onDeleteRule}
          isDeleting={deletingRuleId === rule.id}
          readOnly={readOnly}
        />
      ))}
    </div>
  );
}
