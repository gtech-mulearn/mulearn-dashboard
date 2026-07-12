"use client";

import { format } from "date-fns";
import { Pencil, Plus, Trash2 } from "lucide-react";
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
import { useDeleteAchievement } from "../hooks/use-achievement-mutations";
import { useAchievements } from "../hooks/use-achievements";
import type { Achievement } from "../schemas";
import { AchievementFormDialog } from "./achievement-form-dialog";
import { AchievementIcon } from "./achievement-icon";

const COLUMN_ORDER = [
  { column: "icon", Label: "", isSortable: false, width: "w-12" },
  { column: "name", Label: "Name", isSortable: true },
  { column: "level_based", Label: "Level Based", isSortable: false },
  { column: "has_vc", Label: "Has VC", isSortable: false },
  { column: "created_at", Label: "Created On", isSortable: true },
];

export function AchievementsTable() {
  const { data: achievements = [], isLoading } = useAchievements();
  const deleteMutation = useDeleteAchievement();

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editTarget, setEditTarget] = React.useState<Achievement | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<Achievement | null>(
    null,
  );
  const [search, setSearch] = React.useState("");

  const openCreate = () => {
    setEditTarget(null);
    setDialogOpen(true);
  };

  const openEdit = (achievement: Achievement) => {
    setEditTarget(achievement);
    setDialogOpen(true);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => setDeleteTarget(null),
    });
  };

  const [sortConfig, setSortConfig] = React.useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);

  const handleSort = (column: string) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig?.key === column && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key: column, direction });
  };

  const filteredAndSorted = React.useMemo(() => {
    let result = achievements.filter((row) =>
      row.name.toLowerCase().includes(search.toLowerCase()),
    );

    if (sortConfig) {
      result = [...result].sort((a, b) => {
        const aVal = a[sortConfig.key as keyof Achievement];
        const bVal = b[sortConfig.key as keyof Achievement];
        if (aVal === bVal) return 0;
        if (aVal === null || aVal === undefined) return 1;
        if (bVal === null || bVal === undefined) return -1;

        if (sortConfig.key === "created_at") {
          const aTime = new Date(aVal as string).getTime();
          const bTime = new Date(bVal as string).getTime();
          return sortConfig.direction === "asc" ? aTime - bTime : bTime - aTime;
        }

        const aStr = String(aVal).toLowerCase();
        const bStr = String(bVal).toLowerCase();
        if (aStr < bStr) return sortConfig.direction === "asc" ? -1 : 1;
        if (aStr > bStr) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return result;
  }, [achievements, search, sortConfig]);

  const customCellRender = (column: string, row: Record<string, unknown>) => {
    if (column === "icon") {
      return (
        <AchievementIcon
          imageUrl={row.icon as string}
          name={row.name as string}
          size={36}
        />
      );
    }
    if (column === "name") {
      return (
        <span className="font-medium text-foreground">
          {row.name as string}
        </span>
      );
    }
    if (column === "level_based") {
      const isLevelBased = row.level_based ?? !!row.level_id;
      return isLevelBased ? (
        <Badge variant="secondary">Yes</Badge>
      ) : (
        <Badge variant="outline">No</Badge>
      );
    }
    if (column === "has_vc") {
      return row.has_vc ? (
        <Badge variant="secondary">Yes</Badge>
      ) : (
        <Badge variant="outline">No</Badge>
      );
    }
    if (column === "created_at") {
      const createdAt = row.created_at;
      if (!createdAt)
        return <span className="text-sm text-muted-foreground">—</span>;
      try {
        return (
          <span className="text-sm text-muted-foreground">
            {format(
              new Date(createdAt as string | number | Date),
              "dd MMM yyyy",
            )}
          </span>
        );
      } catch {
        return <span className="text-sm text-muted-foreground">—</span>;
      }
    }
    return null;
  };

  const customActionRender = (row: Record<string, unknown>) => (
    <TooltipProvider>
      <div className="flex items-center justify-end gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-muted-foreground hover:bg-muted hover:text-foreground"
              onClick={() => openEdit(row as Achievement)}
              data-testid={`edit-achievement-${row.id}`}
            >
              <Pencil className="h-4 w-4" />
              <span className="sr-only">Edit</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Edit</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
              onClick={() => setDeleteTarget(row as Achievement)}
              data-testid={`delete-achievement-${row.id}`}
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Delete</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Delete</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );

  return (
    <div className="space-y-4" data-testid="achievements-table">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Achievements</h2>
          <p className="text-sm text-muted-foreground">
            Manage all achievements in the system.
          </p>
        </div>
        <Button
          onClick={openCreate}
          data-testid="create-achievement-btn"
          className="w-full sm:w-auto"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Achievement
        </Button>
      </div>

      <div className="flex items-center py-4">
        <Input
          placeholder="Search achievements..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="w-full ">
        <div className="w-full md:min-w-[800px]">
          <ReusableTable
            // biome-ignore lint/suspicious/noExplicitAny: third-party types
            rows={filteredAndSorted as any}
            isLoading={isLoading}
            page={1}
            perPage={filteredAndSorted.length || 1}
            columnOrder={COLUMN_ORDER}
            id={["id"]}
            customCellRender={customCellRender}
            customActionRender={customActionRender}
          >
            <THead columnOrder={COLUMN_ORDER} onIconClick={handleSort} action />
            <div />
            <div />
          </ReusableTable>
        </div>
      </div>

      <AchievementFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={editTarget ? "edit" : "create"}
        achievement={editTarget}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Achievement"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        isPending={deleteMutation.isPending}
        variant="destructive"
      />
    </div>
  );
}
