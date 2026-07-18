"use client";

import { Eye, Pencil, Power, PowerOff } from "lucide-react";
import * as React from "react";
import ReusableTable from "@/components/dashboard/table/Table";
import THead from "@/components/dashboard/table/Thead";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  useActivateRule,
  useDeactivateRule,
} from "../hooks/use-achievement-mutations";
import { useRules } from "../hooks/use-achievement-rules";
import { useSingleRule } from "../hooks/use-achievements";
import type { AchievementRule } from "../schemas";
import { RuleFormDialog } from "./rule-form-dialog";

const COLUMN_ORDER = [
  { column: "achievement_name", Label: "Achievement", isSortable: true },
  { column: "rule_type", Label: "Rule Type", isSortable: false },
  { column: "conditions", Label: "Conditions", isSortable: false },
  { column: "version", Label: "Version", isSortable: false },
  { column: "is_active", Label: "Status", isSortable: false },
];

/** Returns a concise human-readable summary of a rule's conditions. */
function formatConditions(rule: AchievementRule): string {
  const c = rule.conditions;
  switch (rule.rule_type) {
    case "ig_karma":
      return (
        `IG karma \u2265 ${c.required_karma ?? "?"}` +
        (c.ig_id ? ` (${String(c.ig_id).slice(0, 8)}\u2026)` : "")
      );
    case "skill":
      return (
        `Skill tasks \u2265 ${c.required_tasks ?? "?"}` +
        (c.skill_id ? ` (${String(c.skill_id).slice(0, 8)}\u2026)` : "")
      );
    case "streak":
      return `${c.streak_type ?? "streak"} \u2265 ${c.required_streak ?? "?"} days`;
    case "milestone":
      return `${c.milestone_type ?? "milestone"} \u2265 ${c.required_value ?? "?"}`;
    case "event":
      return `\u201C${c.event_name ?? "?"}\u201D \u2265 ${c.required_attendance ?? 1}\u00D7`;
    case "task_completion":
      return `Hashtag: ${c.task_hashtag ?? "?"}`;
    default:
      try {
        return JSON.stringify(c).slice(0, 60);
      } catch {
        return "(custom)";
      }
  }
}

export function RulesTable() {
  const { data: rules = [], isLoading } = useRules();
  const deactivateMutation = useDeactivateRule();
  const activateMutation = useActivateRule();
  const [target, setTarget] = React.useState<{
    rule: AchievementRule;
    action: "activate" | "deactivate";
  } | null>(null);
  const [search, setSearch] = React.useState("");
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingRule, setEditingRule] = React.useState<AchievementRule | null>(
    null,
  );
  const [viewingRuleId, setViewingRuleId] = React.useState<string | null>(null);

  // Fetch single rule detail when a row is clicked for viewing
  const { data: ruleDetail, isLoading: isDetailLoading } =
    useSingleRule(viewingRuleId);

  const handleDeactivate = () => {
    // biome-ignore lint/complexity/useOptionalChain: target is checked first for type safety
    if (!target || target.action !== "deactivate") return;
    deactivateMutation.mutate(target.rule.id, {
      onSuccess: () => setTarget(null),
    });
  };

  const handleActivate = () => {
    // biome-ignore lint/complexity/useOptionalChain: target is checked first for type safety
    if (!target || target.action !== "activate") return;
    activateMutation.mutate(target.rule.id, {
      onSuccess: () => setTarget(null),
    });
  };

  const filtered = React.useMemo(() => {
    return rules.filter((row) => {
      const matchText = row.achievement_name ?? row.achievement_id ?? "";
      return (
        matchText.toLowerCase().includes(search.toLowerCase()) ||
        row.rule_type.toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [rules, search]);

  // biome-ignore lint/suspicious/noExplicitAny: ReusableTable row type is any
  const customCellRender = (column: string, row: any) => {
    if (column === "achievement_name") {
      return (
        <span className="font-medium text-foreground">
          {row.achievement_name ?? row.achievement_id}
        </span>
      );
    }
    if (column === "rule_type") {
      return <Badge variant="secondary">{row.rule_type}</Badge>;
    }
    if (column === "conditions") {
      return (
        <span className="text-xs text-muted-foreground font-mono">
          {formatConditions(row as AchievementRule)}
        </span>
      );
    }
    if (column === "version") {
      return (
        <span className="text-sm text-muted-foreground">v{row.version}</span>
      );
    }
    if (column === "is_active") {
      return row.is_active ? (
        <Badge variant="success">Active</Badge>
      ) : (
        <Badge variant="outline" className="text-muted-foreground">
          Inactive
        </Badge>
      );
    }
    return null;
  };

  // biome-ignore lint/suspicious/noExplicitAny: ReusableTable row type is any
  const customActionRender = (row: any) => {
    return (
      <TooltipProvider>
        <div className="flex items-center justify-end gap-1">
          {/* View Detail */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                onClick={() => setViewingRuleId(row.id)}
                data-testid={`view-rule-${row.id}`}
              >
                <Eye className="h-4 w-4" />
                <span className="sr-only">View details</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>View rule details</TooltipContent>
          </Tooltip>

          {/* Edit Rule Action */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                onClick={() => {
                  setEditingRule(row as AchievementRule);
                  setIsFormOpen(true);
                }}
                data-testid={`edit-rule-${row.id}`}
              >
                <Pencil className="h-4 w-4" />
                <span className="sr-only">Edit</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Edit rule</TooltipContent>
          </Tooltip>

          {row.is_active ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-warning hover:text-warning/80"
                  onClick={() =>
                    setTarget({
                      rule: row as AchievementRule,
                      action: "deactivate",
                    })
                  }
                  data-testid={`deactivate-rule-${row.id}`}
                >
                  <PowerOff className="h-4 w-4" />
                  <span className="sr-only">Deactivate</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Deactivate rule</TooltipContent>
            </Tooltip>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-success hover:text-success/80"
                  onClick={() =>
                    setTarget({
                      rule: row as AchievementRule,
                      action: "activate",
                    })
                  }
                  data-testid={`activate-rule-${row.id}`}
                >
                  <Power className="h-4 w-4" />
                  <span className="sr-only">Activate</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Activate rule</TooltipContent>
            </Tooltip>
          )}
        </div>
      </TooltipProvider>
    );
  };

  return (
    <div className="space-y-4" data-testid="rules-table">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Rules</h2>
        <p className="text-sm text-muted-foreground">
          Manage achievement unlock rules and conditions.
        </p>
      </div>

      <div className="flex items-center justify-between py-4">
        <Input
          placeholder="Search rules by achievement or type..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="max-w-sm"
        />
        <Button
          onClick={() => {
            setEditingRule(null);
            setIsFormOpen(true);
          }}
        >
          Create Rule
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="w-full overflow-x-auto">
            <div className="min-w-[800px] w-full">
              <ReusableTable
                // biome-ignore lint/suspicious/noExplicitAny: generic rows type
                rows={filtered as any}
                isLoading={isLoading}
                page={1}
                perPage={filtered.length || 1}
                columnOrder={COLUMN_ORDER}
                id={["id"]}
                customCellRender={customCellRender}
                customActionRender={customActionRender}
              >
                <THead
                  columnOrder={COLUMN_ORDER}
                  onIconClick={() => {}}
                  action
                />
                <div />
                <div />
              </ReusableTable>
            </div>
          </div>
        </CardContent>
      </Card>

      <RuleFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        initialRule={editingRule}
      />
      {/* Rule Detail Dialog (Fix #6) */}
      <Dialog
        open={Boolean(viewingRuleId)}
        onOpenChange={(open) => !open && setViewingRuleId(null)}
      >
        <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto p-6 space-y-4">
          <DialogHeader>
            <DialogTitle className="font-bold text-lg">
              {isDetailLoading
                ? "Loading..."
                : (ruleDetail?.achievement_name ?? "Rule Detail")}
            </DialogTitle>
            <p className="text-xs text-muted-foreground mt-0.5 font-mono">
              {viewingRuleId}
            </p>
          </DialogHeader>

          {isDetailLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-8 rounded bg-muted animate-pulse" />
              ))}
            </div>
          ) : ruleDetail ? (
            <dl className="space-y-3 text-sm">
              {(() => {
                const items = [
                  ["Rule Type", ruleDetail.rule_type],
                  ["Version", `v${ruleDetail.version}`],
                  ["Status", ruleDetail.is_active ? "Active" : "Inactive"],
                  [
                    "Created",
                    ruleDetail.created_at
                      ? new Date(ruleDetail.created_at).toLocaleString()
                      : "—",
                  ],
                ];

                // Add each condition field formatted into Title Case
                Object.entries(ruleDetail.conditions || {}).forEach(
                  ([key, val]) => {
                    const label = key
                      .split("_")
                      .map(
                        (word) => word.charAt(0).toUpperCase() + word.slice(1),
                      )
                      .join(" ");
                    const displayVal =
                      typeof val === "object" && val !== null
                        ? JSON.stringify(val)
                        : String(val);
                    items.push([label, displayVal]);
                  },
                );

                return items.map(([label, value]) => (
                  <div key={label} className="flex gap-4">
                    <dt className="w-28 shrink-0 text-muted-foreground font-medium">
                      {label}
                    </dt>
                    <dd className="font-mono">{value}</dd>
                  </div>
                ));
              })()}
            </dl>
          ) : (
            <p className="text-sm text-muted-foreground">
              Failed to load rule details.
            </p>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(target)}
        onOpenChange={(open) => !open && setTarget(null)}
        title={
          target?.action === "activate" ? "Activate Rule" : "Deactivate Rule"
        }
        description={
          target?.action === "activate"
            ? `Activate this rule for "${target?.rule.achievement_name ?? target?.rule.achievement_id}"?`
            : `Deactivate this rule for "${target?.rule.achievement_name ?? target?.rule.achievement_id}"? It will no longer apply to users.`
        }
        onConfirm={
          target?.action === "activate" ? handleActivate : handleDeactivate
        }
        isPending={
          target?.action === "activate"
            ? activateMutation.isPending
            : deactivateMutation.isPending
        }
        variant={target?.action === "activate" ? undefined : "warning"}
        confirmLabel={target?.action === "activate" ? "Activate" : "Deactivate"}
      />
    </div>
  );
}
