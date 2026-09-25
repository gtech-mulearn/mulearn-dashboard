"use client";

import { Loader2, Megaphone, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAdminBroadcasts, useDeleteAllBroadcasts } from "../../hooks";
import type { AdminBroadcast } from "../../schemas";
import { AdminBroadcastDialog } from "./admin-broadcast-dialog";
import { BroadcastFormDialog } from "./broadcast-form-dialog";
import { BroadcastTable } from "./broadcast-table";

export function NotificationManageCard() {
  const [adminDialogOpen, setAdminDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<AdminBroadcast | undefined>(
    undefined,
  );
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const { data: broadcasts, isLoading } = useAdminBroadcasts();
  const { mutate: deleteAll, isPending: isDeletingAll } =
    useDeleteAllBroadcasts();

  function handleEdit(broadcast: AdminBroadcast) {
    setEditTarget(broadcast);
    setEditDialogOpen(true);
  }

  function handleEditDialogClose(open: boolean) {
    setEditDialogOpen(open);
    if (!open) setEditTarget(undefined);
  }

  return (
    <>
      {/* ── Platform Announcements Card ── */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <CardTitle className="text-base">Platform Announcements</CardTitle>
            <p className="text-xs text-muted-foreground">
              Send announcements and important updates to all platform members.
            </p>
          </div>
          <Button
            id="admin-dispatch-broadcast-btn"
            size="sm"
            variant="secondary"
            onClick={() => setAdminDialogOpen(true)}
          >
            <Megaphone className="h-4 w-4" />
            <span className="ml-1.5">New announcement</span>
          </Button>
        </CardHeader>
      </Card>

      <Separator />

      {/* ── Active Announcements Card ── */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Active Announcements</CardTitle>
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
        </CardHeader>
        <CardContent>
          <BroadcastTable
            broadcasts={broadcasts ?? []}
            isLoading={isLoading}
            onEdit={handleEdit}
          />
        </CardContent>
      </Card>

      {/* ── Dialogs ── */}
      <AdminBroadcastDialog
        open={adminDialogOpen}
        onOpenChange={setAdminDialogOpen}
      />

      {/* Edit-only dialog for existing broadcasts */}
      {editTarget && (
        <BroadcastFormDialog
          open={editDialogOpen}
          onOpenChange={handleEditDialogClose}
          editTarget={editTarget}
        />
      )}
    </>
  );
}
