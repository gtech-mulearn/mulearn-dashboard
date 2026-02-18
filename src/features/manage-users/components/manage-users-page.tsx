"use client";

import { useQueryClient } from "@tanstack/react-query";
import { ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { endpoints } from "@/api/endpoints";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { authStore } from "@/lib/auth";
import {
  getManageUserDetailQueryOptions,
  getManageUsersListQueryOptions,
  getManageUsersMetaQueryOptions,
  useDeleteManageUser,
  useManageUsersList,
} from "../hooks";
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
  const queryClient = useQueryClient();
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
    const previousHtmlOverflowX = document.documentElement.style.overflowX;
    const previousBodyOverflowX = document.body.style.overflowX;

    document.documentElement.style.overflowX = "hidden";
    document.body.style.overflowX = "hidden";

    return () => {
      document.documentElement.style.overflowX = previousHtmlOverflowX;
      document.body.style.overflowX = previousBodyOverflowX;
    };
  }, []);

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

  const prefetchEditData = (id: string) => {
    void queryClient.prefetchQuery(getManageUserDetailQueryOptions(id));
    void queryClient.prefetchQuery(getManageUsersMetaQueryOptions());
  };

  const openEdit = (id: string) => {
    prefetchEditData(id);
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

  useEffect(() => {
    if (!data || pageIndex >= totalPages) return;

    const nextParams = {
      pageIndex: pageIndex + 1,
      perPage,
      search,
      sortBy,
    };

    void queryClient.prefetchQuery(getManageUsersListQueryOptions(nextParams));
  }, [data, pageIndex, totalPages, perPage, search, sortBy, queryClient]);

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
    <div className="mx-auto w-full space-y-6 overflow-hidden p-3 sm:p-6">
      <Card className="overflow-hidden rounded-3xl border border-border/60 bg-card shadow-[0_10px_30px_-18px_rgba(0,0,0,0.35)]">
        <CardHeader className="border-b border-border/50 bg-background px-4 py-5 sm:px-6 sm:py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/[0.06] px-3 py-1 text-xs font-semibold text-primary">
                <ShieldCheck className="size-3.5" />
                User Management
              </div>
              <CardTitle className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Manage Users
              </CardTitle>
            </div>
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
          </div>
        </CardHeader>

        <CardContent className="space-y-6 bg-background p-3 sm:p-6">
          <ManageUsersTable
            users={users}
            isLoading={isLoading}
            pageIndex={pageIndex}
            perPage={perPage}
            onSort={toggleSort}
            onEdit={openEdit}
            onEditHover={prefetchEditData}
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
