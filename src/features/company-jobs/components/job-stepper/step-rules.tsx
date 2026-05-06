"use client";

import { Info, Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { RuleFormValues } from "../../schemas";
import type { JobRule } from "../../types";
import { RuleAddDialog, RuleList } from "../rules";

interface StepRulesProps {
  /** Local rules state for the stepper (not yet persisted) */
  rules: JobRule[];
  onAddRule: (values: RuleFormValues) => void;
  onDeleteRule: (ruleId: string) => void;
}

export function StepRules({ rules, onAddRule, onDeleteRule }: StepRulesProps) {
  const [showDialog, setShowDialog] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">
          Eligibility Rules
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Optionally add rules to filter candidates by skills, interest groups,
          or achievements.
        </p>
      </div>

      {/* Info banner */}
      <div className="flex flex-col gap-2 rounded-lg border border-brand-blue/30 bg-brand-blue/10 p-3 text-sm text-brand-blue sm:flex-row sm:gap-3">
        <Info className="h-4 w-4 shrink-0 mt-0.5" />
        <p>
          Rules are optional. You can add or modify them later from the job
          detail page. Rules added here will be saved after the job is created.
        </p>
      </div>

      {/* Rules list */}
      <RuleList
        rules={rules}
        onDeleteRule={onDeleteRule}
        showAddHint={rules.length === 0}
      />

      {/* Add button */}
      <Button
        type="button"
        variant="outline"
        onClick={() => setShowDialog(true)}
        className="w-full gap-2 sm:w-auto"
      >
        <Plus className="h-4 w-4" />
        Add Eligibility Rule
      </Button>

      {/* Dialog */}
      <RuleAddDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        onSubmit={(values) => {
          onAddRule(values);
          setShowDialog(false);
        }}
        isPending={false}
      />
    </div>
  );
}
