"use client";

import {
  ArrowDownUp,
  Hash,
  Mail,
  Pencil,
  Smartphone,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ManageUserListItem } from "../schemas";

export const manageUsersColumns = [
  { key: "full_name", label: "Full Name", sortable: true },
  { key: "karma", label: "Total Karma", sortable: true },
  { key: "muid", label: "Mu ID", sortable: true },
  { key: "email", label: "Email", sortable: true },
  { key: "mobile", label: "Mobile", sortable: true },
  { key: "discord_id", label: "Discord ID", sortable: false }, // Typically not sorted
  { key: "level", label: "Level", sortable: true },
  { key: "created_at", label: "Created On", sortable: true },
] as const;

function formatDate(value: string | null | undefined) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

interface ManageUsersTableProps {
  users: ManageUserListItem[];
  isLoading: boolean;
  pageIndex: number;
  perPage: number;
  onSort: (column: string) => void;
  onEdit: (id: string) => void;
  onEditHover: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ManageUsersTable({
  users,
  isLoading,
  pageIndex,
  perPage,
  onSort,
  onEdit,
  onEditHover,
  onDelete,
}: ManageUsersTableProps) {
  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center rounded-2xl border border-border/50 bg-card shadow-sm">
        <Spinner className="size-8 text-primary" />
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-2 rounded-2xl border border-border/50 bg-card shadow-sm text-center">
        <p className="text-lg font-semibold text-foreground">No users found</p>
        <p className="text-sm text-muted-foreground">
          Try adjusting your search or filters.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden rounded-2xl border border-border/50 bg-card shadow-sm md:block overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow className="border-border/50 hover:bg-transparent">
              <TableHead className="w-[60px] text-center font-bold">
                #
              </TableHead>
              {manageUsersColumns.map((column) => (
                <TableHead
                  key={column.key}
                  className="h-12 text-xs font-bold uppercase tracking-wider text-muted-foreground"
                >
                  <button
                    type="button"
                    disabled={!column.sortable}
                    className={`flex items-center gap-1.5 text-left transition-colors ${
                      column.sortable
                        ? "cursor-pointer hover:text-foreground"
                        : "cursor-default"
                    }`}
                    onClick={() => column.sortable && onSort(column.key)}
                  >
                    {column.label}
                    {column.sortable && <ArrowDownUp className="size-3" />}
                  </button>
                </TableHead>
              ))}
              <TableHead className="text-right pr-6 font-bold">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user, index) => (
              <TableRow
                key={user.id}
                className="border-border/50 transition-all hover:bg-muted/30"
              >
                <TableCell className="text-center font-medium text-muted-foreground/80">
                  {(pageIndex - 1) * perPage + index + 1}
                </TableCell>
                <TableCell className="font-semibold text-foreground">
                  {user.full_name || "-"}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className="bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary transition-colors cursor-default font-mono"
                  >
                    {user.karma}
                  </Badge>
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground break-all">
                  {user.muid || "-"}
                </TableCell>
                <TableCell className="text-sm" title={user.email || ""}>
                  {user.email || "-"}
                </TableCell>
                <TableCell className="font-mono text-xs">
                  {user.mobile || "-"}
                </TableCell>
                <TableCell
                  className="text-xs text-muted-foreground break-all"
                  title={user.discord_id || ""}
                >
                  {user.discord_id || "-"}
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground ring-1 ring-inset ring-gray-500/10">
                    {user.level}
                  </span>
                </TableCell>
                <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                  {formatDate(user.created_at)}
                </TableCell>
                <TableCell className="text-right pr-4">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(user.id)}
                      onMouseEnter={() => onEditHover(user.id)}
                      onFocus={() => onEditHover(user.id)}
                      className="size-8 rounded-lg text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                    >
                      <Pencil className="size-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(user.id)}
                      className="size-8 rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {users.map((user, index) => (
          <div
            key={user.id}
            className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-5 shadow-sm transition-all hover:shadow-md hover:border-primary/20"
          >
            <div className="absolute top-0 right-0 p-4 opacity-50 transition-opacity group-hover:opacity-100">
              <span className="font-mono text-xs text-muted-foreground/50">
                #{(pageIndex - 1) * perPage + index + 1}
              </span>
            </div>

            <div className="flex flex-col gap-4">
              {/* Header Section */}
              <div className="flex items-start justify-between pr-8">
                <div>
                  <h3 className="font-display text-lg font-bold text-foreground">
                    {user.full_name || "Unknown User"}
                  </h3>
                  <div className="mt-1 flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="border-primary/20 bg-primary/5 text-primary text-xs font-mono"
                    >
                      {user.muid || "No ID"}
                    </Badge>
                    <span className="text-xs text-muted-foreground px-1.5 py-0.5 rounded-md bg-secondary">
                      {user.level}
                    </span>
                  </div>
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted/50">
                    <Mail className="size-4 opacity-70" />
                  </div>
                  <span className="break-all">{user.email || "-"}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-muted/50">
                    <Smartphone className="size-4 opacity-70" />
                  </div>
                  <span className="font-mono text-xs">
                    {user.mobile || "-"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted/50">
                    <Hash className="size-4 opacity-70" />
                  </div>
                  <span className="font-mono text-xs break-all">
                    {user.discord_id || "-"}
                  </span>
                </div>
              </div>

              {/* Footer / Actions */}
              <div className="flex items-center justify-between gap-4 border-t border-border/40 pt-4 mt-1">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground/60">
                    Total Karma
                  </span>
                  <span className="text-xl font-bold text-primary tabular-nums">
                    {user.karma}
                  </span>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(user.id)}
                    className="h-9 rounded-xl border-border bg-background text-foreground hover:bg-muted/80 hover:text-primary transition-all shadow-sm"
                  >
                    <Pencil className="mr-2 size-3.5" />
                    Edit
                  </Button>
                  <Button
                    variant="outline" // Changed to outline for better visual balance
                    size="sm"
                    onClick={() => onDelete(user.id)}
                    className="h-9 rounded-xl border-destructive/20 bg-destructive/5 text-destructive hover:bg-destructive/10 hover:border-destructive/30 hover:text-destructive transition-all shadow-sm"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
