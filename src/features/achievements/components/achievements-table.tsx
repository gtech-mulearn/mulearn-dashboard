"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Pencil, Plus, Trash2 } from "lucide-react";
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
import type { Achievement } from "../schemas";
import { useDeleteAchievement } from "../hooks/use-achievement-mutations";
import { useAchievements } from "../hooks/use-achievements";
import { AchievementFormDialog } from "./achievement-form-dialog";
import { AchievementIcon } from "./achievement-icon";

export function AchievementsTable() {
  const { data: achievements = [], isLoading } = useAchievements();
  const deleteMutation = useDeleteAchievement();

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editTarget, setEditTarget] = React.useState<Achievement | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<Achievement | null>(
    null,
  );

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

  const columns: ColumnDef<Achievement>[] = [
    {
      id: "icon",
      header: "",
      cell: ({ row }) => (
        <AchievementIcon
          imageUrl={row.original.image_url}
          name={row.original.name}
          size={36}
        />
      ),
      enableSorting: false,
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.name}</span>
      ),
    },
    {
      accessorKey: "level_based",
      header: "Level Based",
      cell: ({ row }) =>
        row.original.level_based ? (
          <Badge variant="secondary">Yes</Badge>
        ) : (
          <Badge variant="outline">No</Badge>
        ),
    },
    {
      accessorKey: "has_vc",
      header: "Has VC",
      cell: ({ row }) =>
        row.original.has_vc ? (
          <Badge variant="secondary">Yes</Badge>
        ) : (
          <Badge variant="outline">No</Badge>
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
      accessorKey: "created_at",
      header: "Created",
      cell: ({ row }) => {
        const createdAt = row.original.created_at;
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
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <TooltipProvider>
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => openEdit(row.original)}
                  data-testid={`edit-achievement-${row.original.id}`}
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
                  onClick={() => setDeleteTarget(row.original)}
                  data-testid={`delete-achievement-${row.original.id}`}
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Delete</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete</TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      ),
      enableSorting: false,
    },
  ];

  return (
    <div className="space-y-4" data-testid="achievements-table">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Achievements</h2>
          <p className="text-sm text-muted-foreground">
            Manage all achievements in the system.
          </p>
        </div>
        <Button onClick={openCreate} data-testid="create-achievement-btn">
          <Plus className="mr-2 h-4 w-4" />
          Create Achievement
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={achievements}
        searchKey="name"
        searchPlaceholder="Search achievements..."
        isLoading={isLoading}
      />

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
