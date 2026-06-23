"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { DataTableErrorBoundary } from "@/components/dashboard/DataTableErrorBoundary";
import { Blank } from "@/components/dashboard/table/Blank";
import Pagination from "@/components/dashboard/table/pagination";
import ReusableTable, { type Data } from "@/components/dashboard/table/Table";
import TableTop from "@/components/dashboard/table/TableTop";
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
import { getApiResponseError } from "@/hooks/use-get-error";
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
  const [perPage, setPerPage] = useState(10);
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
  const rows = (data?.data ?? []) as unknown as Data[];
  const totalPages = data?.pagination?.totalPages ?? 1;
  const totalCount = data?.pagination?.count ?? 0;

  const handleSortChange = useCallback((column: string) => {
    setSortBy((prev) => (prev === column ? `-${column}` : column));
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

  const customCellRender = useCallback((column: string, row: Data) => {
    if (column === "name") {
      return <span className="font-medium">{String(row.name ?? "")}</span>;
    }
    if (column === "discord_id") {
      return (
        <span className="font-mono text-sm">
          {String(row.discord_id ?? "")}
        </span>
      );
    }
    return null;
  }, []);

  const customActionRender = useCallback(
    (row: Data) => {
      const channelRow = row as unknown as ChannelData;
      return (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleEditClick(channelRow)}
          >
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() =>
              handleDeleteClick(String(channelRow.id), channelRow.name)
            }
          >
            Delete
          </Button>
        </div>
      );
    },
    [handleEditClick, handleDeleteClick],
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
          <TableTop
            onSearchText={(val) => {
              setSearch(val);
              setCurrentPage(1);
            }}
            onPerPageNumber={(val) => {
              setPerPage(val);
              setCurrentPage(1);
            }}
            CSV=""
            perPage={perPage}
            perPageOptions={[10, 25, 50]}
            searchPlaceholder="Search by name or Discord ID..."
            searchSize="md"
            searchPosition="left"
          />

          <ReusableTable
            rows={rows}
            isLoading={isLoading}
            page={currentPage}
            perPage={perPage}
            columnOrder={COLUMN_ORDER}
            id={["id"]}
            customCellRender={customCellRender}
            customActionRender={customActionRender}
          >
            <THead
              columnOrder={COLUMN_ORDER}
              onIconClick={handleSortChange}
              action
            />
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              perPage={perPage}
              totalCount={totalCount}
              handlePreviousClick={() =>
                setCurrentPage((p) => Math.max(p - 1, 1))
              }
              handleNextClick={() =>
                setCurrentPage((p) => Math.min(p + 1, totalPages))
              }
            />
            <Blank />
          </ReusableTable>
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
