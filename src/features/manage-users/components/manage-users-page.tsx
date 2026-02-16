"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { endpoints } from "@/api/endpoints";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { authStore } from "@/lib/auth";
import { useDeleteManageUser, useManageUsersList } from "../hooks";
import { DeleteUserDialog } from "./delete-user-dialog";
import { EditUserDialog } from "./edit-user-dialog";
import { ManageUsersPagination } from "./manage-users-pagination";
import { ManageUsersTable } from "./manage-users-table";
import { ManageUsersToolbar } from "./manage-users-toolbar";

function getCsvUrl() {
  const base = process.env.NEXT_PUBLIC_DJANGO_API_URL;
  if (!base) return endpoints.manageUsers.csv;
  return `${base}${endpoints.manageUsers.csv}`;
}

export function ManageUsersPage() {
  const [pageIndex, setPageIndex] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [sortBy, setSortBy] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPageIndex(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data, isLoading, isFetching } = useManageUsersList({
    pageIndex,
    perPage,
    search,
    sortBy,
  });

  const deleteMutation = useDeleteManageUser();

  const users = data?.data ?? [];
  const totalPages = data?.pagination.totalPages ?? 0;

  const startItem = useMemo(() => {
    if (users.length === 0) return 0;
    return (pageIndex - 1) * perPage + 1;
  }, [users.length, pageIndex, perPage]);

  const endItem = useMemo(() => {
    if (users.length === 0) return 0;
    return startItem + users.length - 1;
  }, [startItem, users.length]);

  const openEdit = (id: string) => {
    setEditingUserId(id);
    setIsEditOpen(true);
  };

  const openDelete = (id: string) => {
    setDeletingUserId(id);
    setIsDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingUserId) return;

    try {
      await deleteMutation.mutateAsync(deletingUserId);
      toast.success("User deleted");
      setIsDeleteOpen(false);
      setDeletingUserId(null);
    } catch {
      toast.error("Failed to delete user");
    }
  };

  const toggleSort = (column: string) => {
    setPageIndex(1);
    setSortBy((currentSort) =>
      currentSort === column ? `-${column}` : column,
    );
  };

  const handleDownloadCsv = async () => {
    const token = authStore.getAccessToken();
    if (!token) {
      toast.error("Please login again to download CSV");
      return;
    }

    try {
      const response = await fetch(getCsvUrl(), {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        toast.error("Failed to download CSV");
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "manage-users.csv";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error("Failed to download CSV");
    }
  };

  return (
    <div className="p-1">
      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-xl text-foreground">
            Manage Users
          </CardTitle>
          <ManageUsersToolbar
            searchInput={searchInput}
            perPage={perPage}
            onSearchChange={setSearchInput}
            onPerPageChange={(value) => {
              setPageIndex(1);
              setPerPage(value);
            }}
            onDownloadCsv={handleDownloadCsv}
          />
        </CardHeader>

        <CardContent className="space-y-4">
          <ManageUsersTable
            users={users}
            isLoading={isLoading}
            pageIndex={pageIndex}
            perPage={perPage}
            onSort={toggleSort}
            onEdit={openEdit}
            onDelete={openDelete}
          />

          <ManageUsersPagination
            startItem={startItem}
            endItem={endItem}
            pageIndex={pageIndex}
            totalPages={totalPages}
            isFetching={isFetching}
            onPrevious={() =>
              setPageIndex((current) => Math.max(1, current - 1))
            }
            onNext={() => setPageIndex((current) => current + 1)}
          />
        </CardContent>
      </Card>

      <EditUserDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        userId={editingUserId}
      />

      <DeleteUserDialog
        open={isDeleteOpen}
        isDeleting={deleteMutation.isPending}
        onOpenChange={setIsDeleteOpen}
        onConfirm={handleDelete}
      />
    </div>
  );
}
