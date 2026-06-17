"use client";

import { Loader2, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdminBroadcasts, useDeleteAllBroadcasts } from "../../hooks";
import type { AdminBroadcast } from "../../schemas";
import { BroadcastFormDialog } from "./broadcast-form-dialog";
import { BroadcastTable } from "./broadcast-table";

export function NotificationManageCard() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<AdminBroadcast | undefined>(
    undefined,
  );

  const { data: broadcasts, isLoading } = useAdminBroadcasts();
  const { mutate: deleteAll, isPending: isDeletingAll } =
    useDeleteAllBroadcasts();

  function handleCreateClick() {
    setEditTarget(undefined);
    setDialogOpen(true);
  }

  function handleEdit(broadcast: AdminBroadcast) {
    setEditTarget(broadcast);
    setDialogOpen(true);
  }

  function handleDialogClose(open: boolean) {
    setDialogOpen(open);
    if (!open) setEditTarget(undefined);
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Broadcast Notifications</CardTitle>
          <div className="flex items-center gap-2">
            {(broadcasts?.length ?? 0) > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => deleteAll()}
                disabled={isDeletingAll}
                className="text-destructive hover:text-destructive"
              >
                {isDeletingAll ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                <span className="ml-1.5">Delete all</span>
              </Button>
            )}
            <Button size="sm" onClick={handleCreateClick}>
              <Plus className="h-4 w-4" />
              <span className="ml-1.5">Create</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <BroadcastTable
            broadcasts={broadcasts ?? []}
            isLoading={isLoading}
            onEdit={handleEdit}
            onCreateClick={handleCreateClick}
          />
        </CardContent>
      </Card>

      <BroadcastFormDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        editTarget={editTarget}
      />
    </>
  );
}
