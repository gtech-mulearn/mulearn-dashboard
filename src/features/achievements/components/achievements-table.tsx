"use client";

import { format } from "date-fns";
import { Pencil, Plus, Trash2 } from "lucide-react";
import * as React from "react";
import Pagination from "@/components/dashboard/table/pagination";
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
  { column: "is_active", Label: "Status", isSortable: false },
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

  const filtered = React.useMemo(() => {
    return achievements.filter((row) =>
      row.name.toLowerCase().includes(search.toLowerCase()),
    );
  }, [achievements, search]);

  const customCellRender = (column: string, row: any) => {
    if (column === "icon") {
      return (
        <AchievementIcon imageUrl={row.image_url} name={row.name} size={36} />
      );
    }
    if (column === "name") {
      return <span className="font-medium text-foreground">{row.name}</span>;
    }
    if (column === "level_based") {
      return row.level_based ? (
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
    if (column === "is_active") {
      return row.is_active ? (
        <Badge variant="success">Active</Badge>
      ) : (
        <Badge variant="outline" className="text-muted-foreground">
          Inactive
        </Badge>
      );
    }
    if (column === "created_at") {
      const createdAt = row.created_at;
      if (!createdAt)
        return <span className="text-sm text-muted-foreground">—</span>;
      try {
        return (
          <span className="text-sm text-muted-foreground">
            {format(new Date(createdAt), "dd MMM yyyy")}
          </span>
        );
      } catch {
        return <span className="text-sm text-muted-foreground">—</span>;
      }
    }
    return null;
  };

  const customActionRender = (row: any) => (
    <TooltipProvider>
      <div className="flex items-center justify-end gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
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

      <div className="w-full md:overflow-x-auto md:rounded-xl md:border md:border-border md:bg-card md:shadow-sm">
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
