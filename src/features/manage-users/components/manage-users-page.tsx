"use client";

import { ArrowDownUp, Download, Pencil, Search, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { endpoints } from "@/api/endpoints";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { authStore } from "@/lib/auth";
import { useDeleteManageUser, useManageUsersList } from "../hooks";
import { EditUserDialog } from "./edit-user-dialog";

const columnOrder = [
  { key: "full_name", label: "Full Name", sortable: true },
  { key: "karma", label: "Total Karma", sortable: true },
  { key: "muid", label: "Mu ID", sortable: true },
  { key: "email", label: "Email", sortable: true },
  { key: "mobile", label: "Mobile", sortable: true },
  { key: "discord_id", label: "Discord ID", sortable: true },
  { key: "level", label: "Level", sortable: true },
  { key: "created_at", label: "Created On", sortable: true },
] as const;

function formatDate(value: string | null | undefined) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

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

          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <div className="relative min-w-[260px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search users"
                className="pl-9"
              />
            </div>

            <Select
              value={String(perPage)}
              onValueChange={(value) => {
                setPageIndex(1);
                setPerPage(Number(value));
              }}
            >
              <SelectTrigger className="w-full sm:w-[120px]">
                <SelectValue placeholder="Rows" />
              </SelectTrigger>
              <SelectContent>
                {[5, 10, 20, 50, 100].map((option) => (
                  <SelectItem key={option} value={String(option)}>
                    {option} / page
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={handleDownloadCsv}>
              <Download className="size-4" />
              CSV
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full min-w-[980px] border-collapse">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                    Sl.no
                  </th>

                  {columnOrder.map((column) => (
                    <th
                      key={column.key}
                      className="px-4 py-3 text-left text-sm font-semibold text-foreground"
                    >
                      <button
                        type="button"
                        className="inline-flex items-center gap-1"
                        onClick={() =>
                          column.sortable && toggleSort(column.key)
                        }
                      >
                        <span>{column.label}</span>
                        {column.sortable && (
                          <ArrowDownUp className="size-4 text-muted-foreground" />
                        )}
                      </button>
                    </th>
                  ))}

                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={columnOrder.length + 2} className="px-4 py-10">
                      <div className="flex items-center justify-center">
                        <Spinner className="size-6 text-primary" />
                      </div>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td
                      colSpan={columnOrder.length + 2}
                      className="px-4 py-10 text-center text-sm text-muted-foreground"
                    >
                      No data to display
                    </td>
                  </tr>
                ) : (
                  users.map((user, index) => (
                    <tr key={user.id} className="border-t border-border">
                      <td className="px-4 py-3 text-sm text-foreground">
                        {(pageIndex - 1) * perPage + index + 1}
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground">
                        {user.full_name || "-"}
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground">
                        {user.karma}
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground">
                        {user.muid || "-"}
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground">
                        {user.email || "-"}
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground">
                        {user.mobile || "-"}
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground">
                        {user.discord_id || "-"}
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground">
                        {user.level}
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground">
                        {formatDate(user.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => openEdit(user.id)}
                            aria-label="Edit user"
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => openDelete(user.id)}
                            aria-label="Delete user"
                          >
                            <Trash2 className="size-4 text-destructive" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              {startItem} - {endItem}
            </p>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setPageIndex((current) => Math.max(1, current - 1))
                }
                disabled={pageIndex <= 1 || isFetching}
              >
                Previous
              </Button>
              <span className="min-w-20 text-center text-sm text-foreground">
                {pageIndex} / {Math.max(totalPages, 1)}
              </span>
              <Button
                type="button"
                variant="outline"
                onClick={() => setPageIndex((current) => current + 1)}
                disabled={
                  pageIndex >= totalPages || totalPages === 0 || isFetching
                }
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <EditUserDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        userId={editingUserId}
      />

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteOpen(false)}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && <Spinner className="mr-2" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
