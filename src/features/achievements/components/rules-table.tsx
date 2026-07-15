"use client";

import { Pencil, Power, PowerOff } from "lucide-react";
import * as React from "react";
import ReusableTable from "@/components/dashboard/table/Table";
import THead from "@/components/dashboard/table/Thead";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
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
import type { AchievementRule } from "../schemas";
import { RuleFormDialog } from "./rule-form-dialog";

const COLUMN_ORDER = [
  { column: "achievement_name", Label: "Achievement", isSortable: true },
  { column: "rule_type", Label: "Rule Type", isSortable: false },
  { column: "version", Label: "Version", isSortable: false },
  { column: "is_active", Label: "Status", isSortable: false },
];

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
          {/* Edit Rule Action */}
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={row.is_active}
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
                  onClick={() => {
                    setEditingRule(row as AchievementRule);
                    setIsFormOpen(true);
                  }}
                  data-testid={`edit-rule-${row.id}`}
                >
                  <Pencil className="h-4 w-4" />
                  <span className="sr-only">Edit</span>
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent>
              {row.is_active
                ? "Rules can only be edited when deactivated"
                : "Edit rule"}
            </TooltipContent>
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
          <div className="w-full md:min-w-[800px]">
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
              <THead columnOrder={COLUMN_ORDER} onIconClick={() => {}} action />
              <div />
              <div />
            </ReusableTable>
          </div>
        </CardContent>
      </Card>

      <RuleFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        initialRule={editingRule}
      />

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
