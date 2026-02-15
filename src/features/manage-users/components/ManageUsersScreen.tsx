"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ApiError } from "@/api/client";
import { getManageUsersCsv } from "../api";
import {
  useDeleteManageUser,
  useManageUser,
  useManageUsers,
  useUpdateManageUser,
} from "../hooks";
import { toManageUserUpdatePayload } from "../schemas";
import { ManageUserForm } from "./ManageUserForm";
import { ManageUsersEmptyState } from "./ManageUsersEmptyState";
import { ManageUsersFilters } from "./ManageUsersFilters";
import { ManageUsersModal } from "./ManageUsersModal";
import { ManageUsersPagination } from "./ManageUsersPagination";
import { ManageUsersSkeleton } from "./ManageUsersSkeleton";
import { type SortableColumn, ManageUsersTable } from "./ManageUsersTable";

export function ManageUsersScreen() {
  const [search, setSearch] = useState("");
  const [perPage, setPerPage] = useState(20);
  const [pageIndex, setPageIndex] = useState(1);
  const [sortBy, setSortBy] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [editOpen, setEditOpen] = useState(false);

  const listQ = useManageUsers({ search, perPage, pageIndex, sortBy });
  const detailQ = useManageUser(selectedId, editOpen && !!selectedId);

  const updateM = useUpdateManageUser();
  const deleteM = useDeleteManageUser();

  const rows = listQ.data?.data ?? [];
  const pagination = listQ.data?.pagination;
  const totalPages = pagination?.totalPages ?? 1;
  const totalCount = pagination?.totalCount;

  const isFormPending = updateM.isPending;
  const isLoading = listQ.isLoading || listQ.isFetching;

  const canEdit = useMemo(
    () => !!selectedId && editOpen,
    [editOpen, selectedId],
  );

  const onSort = (column: SortableColumn) => {
    setPageIndex(1);
    setSortBy((prev) => (prev === column ? `-${column}` : column));
  };

  const onDelete = async (id: string) => {
    const confirmed = window.confirm("Delete this user?");
    if (!confirmed) return;

    try {
      await deleteM.mutateAsync(id);
      toast.success("User deleted");
    } catch {
      toast.error("Failed to delete user");
    }
  };

  const onExportCsv = async () => {
    try {
      const blob = await getManageUsersCsv();
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "manage-users.csv";
      anchor.click();
      window.URL.revokeObjectURL(url);
      toast.success("CSV downloaded");
    } catch {
      toast.error("Failed to download CSV");
    }
  };

  const getErrorMessage = (error: unknown, fallback: string) => {
    if (error instanceof ApiError) {
      const data = error.data;
      const pickMessage = (value: unknown): string | null => {
        if (typeof value === "string") return value;
        if (Array.isArray(value)) {
          const first = value.find((item) => typeof item === "string");
          return typeof first === "string" ? first : null;
        }
        if (value && typeof value === "object") {
          for (const nested of Object.values(
            value as Record<string, unknown>,
          )) {
            const result = pickMessage(nested);
            if (result) return result;
          }
        }
        return null;
      };

      if (data && typeof data === "object" && "message" in data) {
        const extracted = pickMessage((data as { message?: unknown }).message);
        if (extracted) return extracted;
      }
      return `${fallback} (${error.status})`;
    }

    if (error instanceof Error && error.message) {
      return error.message;
    }

    return fallback;
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Manage Users</h1>
        <p className="text-muted-foreground text-sm">
          Admin-only user management with edit, delete, search, and export.
        </p>
      </div>

      <ManageUsersFilters
        search={search}
        perPage={perPage}
        onSearchChange={(value) => {
          setSearch(value);
          setPageIndex(1);
        }}
        onPerPageChange={(value) => {
          setPerPage(value);
          setPageIndex(1);
        }}
        onExportCsv={onExportCsv}
      />

      {isLoading ? <ManageUsersSkeleton /> : null}
      {!isLoading && rows.length === 0 ? <ManageUsersEmptyState /> : null}

      {!isLoading && rows.length > 0 ? (
        <>
          <ManageUsersTable
            rows={rows}
            sortBy={sortBy}
            pageIndex={pageIndex}
            perPage={perPage}
            onSort={onSort}
            onEdit={(id) => {
              setSelectedId(id);
              setEditOpen(true);
            }}
            onDelete={onDelete}
          />
          <ManageUsersPagination
            pageIndex={pageIndex}
            perPage={perPage}
            totalPages={totalPages}
            totalCount={totalCount}
            currentRowsCount={rows.length}
            onPageChange={setPageIndex}
          />
        </>
      ) : null}

      <ManageUsersModal
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open);
          if (!open) {
            setSelectedId("");
          }
        }}
        title="Edit User"
        description="Update user profile and organization details."
      >
        <ManageUserForm
          initial={canEdit ? detailQ.data : null}
          loading={detailQ.isLoading}
          pending={isFormPending}
          submitLabel="Update User"
          onCancel={() => setEditOpen(false)}
          onSubmit={async (values) => {
            if (!selectedId) return;
            try {
              const payload = toManageUserUpdatePayload(values, detailQ.data);
              if (Object.keys(payload).length === 0) {
                toast.info("No changes to update");
                return;
              }

              await updateM.mutateAsync({
                id: selectedId,
                payload,
              });
              toast.success("User updated");
              setEditOpen(false);
            } catch (error) {
              toast.error(getErrorMessage(error, "Failed to update user"));
            }
          }}
        />
      </ManageUsersModal>
    </div>
  );
}
