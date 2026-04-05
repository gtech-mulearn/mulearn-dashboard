/**
 * RuleItem — Presentational row for a single eligibility rule
 *
 * 📍 src/features/company-jobs/components/rules/rule-item.tsx
 */

import { Award, BookOpen, Sparkles, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { JobRule, RuleType } from "../../types";

interface RuleItemProps {
  rule: JobRule;
  onDelete?: (ruleId: string) => void;
  isDeleting?: boolean;
  readOnly?: boolean;
}

const RULE_TYPE_ICONS: Record<RuleType, React.ElementType> = {
  skill: Sparkles,
  interest_group: BookOpen,
  achievement: Award,
};

const RULE_TYPE_LABELS: Record<RuleType, string> = {
  skill: "Skill",
  interest_group: "Interest Group",
  achievement: "Achievement",
};

const RULE_TYPE_COLORS: Record<RuleType, string> = {
  skill: "bg-blue-50 text-blue-700 border-blue-200",
  interest_group: "bg-purple-50 text-purple-700 border-purple-200",
  achievement: "bg-amber-50 text-amber-700 border-amber-200",
};

export function RuleItem({
  rule,
  onDelete,
  isDeleting,
  readOnly,
}: RuleItemProps) {
  const Icon = RULE_TYPE_ICONS[rule.rule_type as RuleType] ?? Sparkles;
  const label = RULE_TYPE_LABELS[rule.rule_type as RuleType] ?? rule.rule_type;
  const colorClass =
    RULE_TYPE_COLORS[rule.rule_type as RuleType] ??
    "bg-gray-50 text-gray-700 border-gray-200";

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-card px-4 py-3 transition-colors hover:bg-muted/50 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
        <span
          className={`inline-flex w-fit items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium ${colorClass}`}
        >
          <Icon className="h-3 w-3" />
          {label}
        </span>
        <span className="break-words text-sm font-medium text-foreground">
          {rule.rule_name}
        </span>
      </div>

      {!readOnly && onDelete && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(rule.id)}
          disabled={isDeleting}
          className="w-full shrink-0 text-muted-foreground hover:text-destructive sm:w-auto"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
