"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { getApiResponseError } from "@/hooks/use-get-error";
import { DataTableErrorBoundary } from "@/components/dashboard/DataTableErrorBoundary";
import THead from "@/components/dashboard/table/Thead";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import {
  useAddChannel,
  useChannel,
  useDeleteChannel,
  useUpdateChannel,
} from "../hooks";
import type {
  ChannelData,
  CreateChannelInput,
  UpdateChannelInput,
} from "../schema";

const EMPTY_CREATE: CreateChannelInput = { name: "", discord_id: "" };
const EMPTY_EDIT: UpdateChannelInput = { name: "", discord_id: "" };

const COLUMN_ORDER = [
  { column: "name", Label: "Name", isSortable: true },
  { column: "discord_id", Label: "Discord ID", isSortable: true },
  { column: "created_by", Label: "Created By", isSortable: true },
  { column: "created_at", Label: "Created On", isSortable: true },
];

function ChannelContent() {
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(10);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("");

  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [editId, setEditId] = useState("");
  const [createForm, setCreateForm] =
    useState<CreateChannelInput>(EMPTY_CREATE);
  const [editForm, setEditForm] = useState<UpdateChannelInput>(EMPTY_EDIT);

  const { data, isLoading } = useChannel({
    page: currentPage,
    perPage,
    search,
    sortBy,
  });
  const addMutation = useAddChannel();
  const updateMutation = useUpdateChannel();
  const deleteMutation = useDeleteChannel();

  const isSubmitting = addMutation.isPending || updateMutation.isPending;
  const rows: ChannelData[] = data?.data ?? [];
  const totalPages = data?.pagination?.totalPages ?? 1;

  const handleSortChange = useCallback((column: string) => {
    setSortBy((prev) => (prev === column ? `-${column}` : column));
    setCurrentPage(1);
  }, []);

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    setCurrentPage(1);
  }, []);

  const handleDeleteClick = useCallback((id: string, name: string) => {
    setDeleteTarget({ id, name });
    setOpenDelete(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => {
        toast.success("Channel deleted.");
        setOpenDelete(false);
        setDeleteTarget(null);
      },
      onError: (error) =>
        toast.error(
          getApiResponseError(error, { fallback: "Failed to delete channel." }),
        ),
    });
  }, [deleteMutation, deleteTarget]);

  const toggleCreateModal = useCallback((open: boolean) => {
    setOpenCreate(open);
    if (!open) setCreateForm(EMPTY_CREATE);
  }, []);

  const handleCreateSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!createForm.name.trim() || !createForm.discord_id.trim()) {
        toast.error("Name and Discord ID are required.");
        return;
      }
      addMutation.mutate(createForm, {
        onSuccess: () => {
          toast.success("Channel created.");
          toggleCreateModal(false);
        },
        onError: (error) =>
          toast.error(
            getApiResponseError(error, {
              fallback: "Failed to create channel.",
            }),
          ),
      });
    },
    [addMutation, createForm, toggleCreateModal],
  );

  const toggleEditModal = useCallback((open: boolean) => {
    setOpenEdit(open);
    if (!open) {
      setEditForm(EMPTY_EDIT);
      setEditId("");
    }
  }, []);

  const handleEditClick = useCallback((row: ChannelData) => {
    setEditId(String(row.id ?? ""));
    setEditForm({ name: row.name, discord_id: row.discord_id });
    setOpenEdit(true);
  }, []);

  const handleEditSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!editForm.name.trim() || !editForm.discord_id.trim()) {
        toast.error("Name and Discord ID are required.");
        return;
      }
      updateMutation.mutate(
        { ...editForm, discord_id: editId },
        {
          onSuccess: () => {
            toast.success("Channel updated.");
            toggleEditModal(false);
          },
          onError: (error) =>
            toast.error(
              getApiResponseError(error, {
                fallback: "Failed to update channel.",
              }),
            ),
        },
      );
    },
    [updateMutation, editForm, editId, toggleEditModal],
  );

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Channels
          </CardTitle>
          <Button
            className="w-full sm:w-auto"
            onClick={() => toggleCreateModal(true)}
          >
            Create Channel
          </Button>
        </CardHeader>

        <CardContent className="space-y-4">
          <Input
            placeholder="Search by name or Discord ID..."
            onChange={(e) => handleSearch(e.target.value)}
          />

          <div className="hidden md:block overflow-x-auto rounded-md border">
            <Table>
              <THead
                columnOrder={COLUMN_ORDER}
                onIconClick={handleSortChange}
                action={true}
              />
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-8 text-muted-foreground"
                    >
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : rows.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No channels found.
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((row, index) => (
                    <TableRow key={String(row.id)}>
                      <TableCell className="w-12">
                        {(currentPage - 1) * perPage + index + 1}
                      </TableCell>
                      <TableCell className="font-medium">{row.name}</TableCell>
                      <TableCell className="font-mono text-sm">
                        {row.discord_id}
                      </TableCell>
                      <TableCell>{row.created_by}</TableCell>
                      <TableCell>
                        {new Date(row.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditClick(row)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() =>
                              handleDeleteClick(String(row.id), row.name)
                            }
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-col gap-3 md:hidden">
            {isLoading ? (
              <p className="text-center py-8 text-muted-foreground text-sm">
                Loading...
              </p>
            ) : rows.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground text-sm">
                No channels found.
              </p>
            ) : (
              rows.map((row, index) => (
                <div
                  key={String(row.id)}
                  className="rounded-lg border bg-card p-4 space-y-3 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      #{(currentPage - 1) * perPage + index + 1}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(row.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-sm">{row.name}</p>
                    <p className="font-mono text-xs text-muted-foreground mt-0.5">
                      {row.discord_id}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      Created by{" "}
                      <span className="text-foreground font-medium">
                        {row.created_by}
                      </span>
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditClick(row)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() =>
                          handleDeleteClick(String(row.id), row.name)
                        }
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-sm text-muted-foreground">
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 sm:flex-none"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 sm:flex-none"
                disabled={currentPage >= totalPages}
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={openDelete}
        onOpenChange={(open) => {
          setOpenDelete(open);
          if (!open) setDeleteTarget(null);
        }}
      >
        <DialogContent className="w-[95vw] max-w-sm rounded-lg">
          <DialogHeader>
            <DialogTitle>Delete Channel</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-semibold text-foreground">
                {deleteTarget?.name}
              </span>
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => {
                setOpenDelete(false);
                setDeleteTarget(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={handleConfirmDelete}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={openCreate} onOpenChange={toggleCreateModal}>
        <DialogContent className="w-[95vw] max-w-md rounded-lg">
          <DialogHeader>
            <DialogTitle>Create Channel</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div className="space-y-1">
              <label
                htmlFor="create-channel"
                className="text-sm text-muted-foreground"
              >
                Name
              </label>
              <Input
                placeholder="e.g. announcements"
                value={createForm.name}
                onChange={(e) =>
                  setCreateForm((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1">
              <label
                htmlFor="add-channel"
                className="text-sm text-muted-foreground"
              >
                Discord ID
              </label>
              <Input
                placeholder="e.g. 1234567890"
                value={createForm.discord_id}
                onChange={(e) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    discord_id: e.target.value,
                  }))
                }
              />
            </div>
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => toggleCreateModal(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={openEdit} onOpenChange={toggleEditModal}>
        <DialogContent className="w-[95vw] max-w-md rounded-lg">
          <DialogHeader>
            <DialogTitle>Edit Channel</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="space-y-1">
              <label
                htmlFor="edit-channel"
                className="text-sm text-muted-foreground"
              >
                Name
              </label>
              <Input
                placeholder="Channel name"
                value={editForm.name}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1">
              <label
                htmlFor="edit-channel"
                className="text-sm text-muted-foreground"
              >
                Discord ID
              </label>
              <Input
                placeholder="Discord ID"
                value={editForm.discord_id}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    discord_id: e.target.value,
                  }))
                }
              />
            </div>
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => toggleEditModal(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function ChannelsPage() {
  return (
    <DataTableErrorBoundary>
      <ChannelContent />
    </DataTableErrorBoundary>
  );
}
