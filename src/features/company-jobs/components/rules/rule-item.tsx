/**
 * RuleItem — Presentational row for a single eligibility rule
 *
 * 📍 src/features/company-jobs/components/rules/rule-item.tsx
 */

import { Award, BookOpen, Sparkles, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatNumericRuleValue } from "../../constants";
import type { JobRule } from "../../types";

interface RuleItemProps {
  rule: JobRule;
  onDelete?: (ruleId: string) => void;
  isDeleting?: boolean;
  readOnly?: boolean;
}

const RULE_TYPE_ICONS: Record<string, React.ElementType> = {
  skill: Sparkles,
  interest_group: BookOpen,
  achievement: Award,
  min_karma: Sparkles,
  max_karma: Sparkles,
  min_level: Award,
  max_level: Award,
};

const RULE_TYPE_LABELS: Record<string, string> = {
  skill: "Skill",
  interest_group: "Interest Group",
  achievement: "Achievement",
  min_karma: "Min Karma",
  max_karma: "Max Karma",
  min_level: "Min Level",
  max_level: "Max Level",
};

const RULE_TYPE_COLORS: Record<string, string> = {
  skill: "bg-brand-blue/10 text-brand-blue border-brand-blue/30",
  interest_group: "bg-brand-purple/10 text-brand-purple border-brand-purple/30",
  achievement: "bg-warning/10 text-warning border-warning/30",
  min_karma: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
  max_karma: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
  min_level: "bg-amber-500/10 text-amber-600 border-amber-500/30",
  max_level: "bg-amber-500/10 text-amber-600 border-amber-500/30",
};

export function RuleItem({
  rule,
  onDelete,
  isDeleting,
  readOnly,
}: RuleItemProps) {
  const Icon = RULE_TYPE_ICONS[rule.rule_type] ?? Sparkles;
  const label = RULE_TYPE_LABELS[rule.rule_type] ?? rule.rule_type;
  const colorClass =
    RULE_TYPE_COLORS[rule.rule_type] ??
    "bg-muted text-muted-foreground border-border";

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
          {formatNumericRuleValue(rule.rule_type, rule.rule_value)}
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
