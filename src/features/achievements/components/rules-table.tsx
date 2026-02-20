"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { PowerOff } from "lucide-react";
import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable } from "@/components/ui/data-table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { AchievementRule } from "../schemas";
import { useDeactivateRule } from "../hooks/use-achievement-mutations";
import { useRules } from "../hooks/use-achievement-rules";

export function RulesTable() {
  const { data: rules = [], isLoading } = useRules();
  const deactivateMutation = useDeactivateRule();
  const [target, setTarget] = React.useState<AchievementRule | null>(null);

  const handleDeactivate = () => {
    if (!target) return;
    deactivateMutation.mutate(target.id, {
      onSuccess: () => setTarget(null),
    });
  };

  const columns: ColumnDef<AchievementRule>[] = [
    {
      accessorKey: "achievement_name",
      header: "Achievement",
      cell: ({ row }) => (
        <span className="font-medium">
          {row.original.achievement_name ?? row.original.achievement_id}
        </span>
      ),
    },
    {
      accessorKey: "rule_type",
      header: "Rule Type",
      cell: ({ row }) => (
        <Badge variant="secondary">{row.original.rule_type}</Badge>
      ),
    },
    {
      accessorKey: "version",
      header: "Version",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          v{row.original.version}
        </span>
      ),
    },
    {
      accessorKey: "is_active",
      header: "Status",
      cell: ({ row }) =>
        row.original.is_active ? (
          <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
            Active
          </Badge>
        ) : (
          <Badge variant="outline" className="text-muted-foreground">
            Inactive
          </Badge>
        ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) =>
        row.original.is_active ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-amber-600 hover:text-amber-700"
                  onClick={() => setTarget(row.original)}
                  data-testid={`deactivate-rule-${row.original.id}`}
                >
                  <PowerOff className="h-4 w-4" />
                  <span className="sr-only">Deactivate</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Deactivate rule</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : null,
      enableSorting: false,
    },
  ];

  return (
    <div className="space-y-4" data-testid="rules-table">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Rules Engine</h2>
        <p className="text-sm text-muted-foreground">
          Manage achievement unlock rules and conditions.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={rules}
        searchKey="rule_type"
        searchPlaceholder="Search rules..."
        isLoading={isLoading}
      />

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
