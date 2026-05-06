"use client";

import type { ColumnDef } from "@tanstack/react-table";
import {
  type Cell,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  type Header,
  type HeaderGroup,
  type Row,
  useReactTable,
} from "@tanstack/react-table";
import { PowerOff } from "lucide-react";
import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useDeactivateRule } from "../hooks/use-achievement-mutations";
import { useRules } from "../hooks/use-achievement-rules";
import type { AchievementRule } from "../schemas";

export function RulesTable() {
  const { data: rules = [], isLoading } = useRules();
  const deactivateMutation = useDeactivateRule();
  const [target, setTarget] = React.useState<AchievementRule | null>(null);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );

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
          <Badge className="bg-success/10 text-success">Active</Badge>
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
                  className="h-8 w-8 p-0 text-warning hover:text-warning/80"
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

  const table = useReactTable({
    data: rules,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnFiltersChange: setColumnFilters,
    state: {
      columnFilters,
    },
  });

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
          placeholder="Search rules..."
          value={
            (table.getColumn("rule_type")?.getFilterValue() as string) ?? ""
          }
          onChange={(event) =>
            table.getColumn("rule_type")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table
              .getHeaderGroups()
              .map((headerGroup: HeaderGroup<AchievementRule>) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map(
                    (header: Header<AchievementRule, unknown>) => {
                      return (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext(),
                              )}
                        </TableHead>
                      );
                    },
                  )}
                </TableRow>
              ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Loading rules...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row: Row<AchievementRule>) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row
                    .getVisibleCells()
                    .map((cell: Cell<AchievementRule, unknown>) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
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
