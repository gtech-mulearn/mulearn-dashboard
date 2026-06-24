"use client";

import { PowerOff } from "lucide-react";
import * as React from "react";
import ReusableTable from "@/components/dashboard/table/Table";
import THead from "@/components/dashboard/table/Thead";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useDeactivateRule } from "../hooks/use-achievement-mutations";
import { useRules } from "../hooks/use-achievement-rules";
import type { AchievementRule } from "../schemas";

const COLUMN_ORDER = [
  { column: "achievement_name", Label: "Achievement", isSortable: true },
  { column: "rule_type", Label: "Rule Type", isSortable: false },
  { column: "version", Label: "Version", isSortable: false },
  { column: "is_active", Label: "Status", isSortable: false },
];

export function RulesTable() {
  const { data: rules = [], isLoading } = useRules();
  const deactivateMutation = useDeactivateRule();
  const [target, setTarget] = React.useState<AchievementRule | null>(null);
  const [search, setSearch] = React.useState("");

  const handleDeactivate = () => {
    if (!target) return;
    deactivateMutation.mutate(target.id, {
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

  const customActionRender = (row: any) => {
    if (!row.is_active) return null;
    return (
      <TooltipProvider>
        <div className="flex items-center justify-end gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-warning hover:text-warning/80"
                onClick={() => setTarget(row as AchievementRule)}
                data-testid={`deactivate-rule-${row.id}`}
              >
                <PowerOff className="h-4 w-4" />
                <span className="sr-only">Deactivate</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Deactivate rule</TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    );
  };

  return (
    <div className="space-y-4" data-testid="rules-table">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Rules Engine</h2>
        <p className="text-sm text-muted-foreground">
          Manage achievement unlock rules and conditions.
        </p>
      </div>

      <div className="flex items-center py-4">
        <Input
          placeholder="Search rules by achievement or type..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="w-full ">
        <div className="w-full md:min-w-[800px]">
          <ReusableTable
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
      </div>

      <ConfirmDialog
        open={Boolean(target)}
        onOpenChange={(open) => !open && setTarget(null)}
        title="Deactivate Rule"
        description={`Deactivate this rule for "${target?.achievement_name ?? target?.achievement_id}"? It will no longer apply to users.`}
        onConfirm={handleDeactivate}
        isPending={deactivateMutation.isPending}
        variant="warning"
        confirmLabel="Deactivate"
      />
    </div>
  );
}
