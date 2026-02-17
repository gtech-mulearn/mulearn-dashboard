"use client";

import { ArrowDownUp, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import type { ManageUserListItem } from "../schemas";

export const manageUsersColumns = [
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
  return (
    <div className="rounded-2xl border border-border/50 bg-card shadow-sm">
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[1080px] border-collapse">
          <thead className="bg-linear-to-r from-primary/[0.08] via-primary/[0.04] to-transparent">
            <tr className="border-b border-border/40">
              <th className="px-4 py-4 text-left text-sm font-semibold text-foreground">
                Sl. No.
              </th>

              {manageUsersColumns.map((column) => (
                <th
                  key={column.key}
                  className="px-4 py-4 text-left text-sm font-semibold text-foreground"
                >
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 transition-colors hover:text-primary"
                    onClick={() => column.sortable && onSort(column.key)}
                  >
                    <span>{column.label}</span>
                    {column.sortable && (
                      <ArrowDownUp className="size-3.5 text-muted-foreground" />
                    )}
                  </button>
                </th>
              ))}

              <th className="px-4 py-4 text-left text-sm font-semibold text-foreground">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              <tr>
                <td
                  colSpan={manageUsersColumns.length + 2}
                  className="px-4 py-14"
                >
                  <div className="flex items-center justify-center">
                    <Spinner className="size-6 text-primary" />
                  </div>
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td
                  colSpan={manageUsersColumns.length + 2}
                  className="px-4 py-14 text-center text-base text-muted-foreground"
                >
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((user, index) => (
                <tr
                  key={user.id}
                  className="border-t border-border/40 align-top transition-colors odd:bg-background even:bg-muted/[0.2] hover:bg-primary/[0.04]"
                >
                  <td className="px-4 py-4 text-sm text-foreground">
                    {(pageIndex - 1) * perPage + index + 1}
                  </td>
                  <td className="px-4 py-4 text-sm font-medium text-foreground">
                    {user.full_name || "-"}
                  </td>
                  <td className="px-4 py-4 text-sm text-foreground">
                    <span className="inline-flex min-w-8 items-center justify-center rounded-full bg-linear-to-r from-primary/20 to-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                      {user.karma}
                    </span>
                  </td>
                  <td className="px-4 py-4 font-mono text-sm text-muted-foreground">
                    {user.muid || "-"}
                  </td>
                  <td className="px-4 py-4 text-sm text-foreground">
                    <span className="block max-w-[240px] truncate">
                      {user.email || "-"}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-foreground">
                    {user.mobile || "-"}
                  </td>
                  <td className="px-4 py-4 text-sm text-foreground">
                    <span className="block max-w-[180px] truncate">
                      {user.discord_id || "-"}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-foreground">
                    {user.level}
                  </td>
                  <td className="px-4 py-4 text-sm text-muted-foreground">
                    {formatDate(user.created_at)}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => onEdit(user.id)}
                        onMouseEnter={() => onEditHover(user.id)}
                        onFocus={() => onEditHover(user.id)}
                        aria-label="Edit user"
                        className="h-9 w-9 rounded-lg border border-primary/10 bg-primary/[0.04] text-primary transition-all hover:-translate-y-0.5 hover:border-primary/20 hover:bg-primary/10"
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => onDelete(user.id)}
                        aria-label="Delete user"
                        className="h-9 w-9 rounded-lg border border-destructive/15 bg-destructive/[0.04] text-destructive transition-all hover:-translate-y-0.5 hover:border-destructive/25 hover:bg-destructive/10"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 p-3 md:hidden">
        {isLoading ? (
          <div className="flex items-center justify-center rounded-xl border border-border/50 py-10">
            <Spinner className="size-6 text-primary" />
          </div>
        ) : users.length === 0 ? (
          <div className="rounded-xl border border-border/50 py-10 text-center text-base text-muted-foreground">
            No users found.
          </div>
        ) : (
          users.map((user, index) => (
            <article
              key={user.id}
              className="space-y-3 rounded-xl border border-border/50 bg-linear-to-br from-background to-primary/[0.03] p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">
                    User #{(pageIndex - 1) * perPage + index + 1}
                  </p>
                  <p className="text-base font-semibold text-foreground">
                    {user.full_name || "-"}
                  </p>
                </div>
                <span className="inline-flex min-w-8 items-center justify-center rounded-full bg-linear-to-r from-primary/20 to-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                  {user.karma}
                </span>
              </div>

              <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
                <dt className="text-muted-foreground">Mu ID</dt>
                <dd className="font-mono text-foreground">
                  {user.muid || "-"}
                </dd>
                <dt className="text-muted-foreground">Email</dt>
                <dd className="truncate text-foreground">
                  {user.email || "-"}
                </dd>
                <dt className="text-muted-foreground">Mobile</dt>
                <dd className="text-foreground">{user.mobile || "-"}</dd>
                <dt className="text-muted-foreground">Discord ID</dt>
                <dd className="truncate text-foreground">
                  {user.discord_id || "-"}
                </dd>
                <dt className="text-muted-foreground">Level</dt>
                <dd className="text-foreground">{user.level}</dd>
                <dt className="text-muted-foreground">Created On</dt>
                <dd className="text-foreground">
                  {formatDate(user.created_at)}
                </dd>
              </dl>

              <div className="flex items-center justify-end gap-2 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onEdit(user.id)}
                  onFocus={() => onEditHover(user.id)}
                  className="h-9 rounded-lg border-primary/20 bg-primary/[0.04] px-3 text-sm text-primary hover:bg-primary/10"
                >
                  <Pencil className="mr-1.5 size-4" />
                  Edit
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onDelete(user.id)}
                  className="h-9 rounded-lg border-destructive/20 bg-destructive/[0.04] px-3 text-sm text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="mr-1.5 size-4" />
                  Delete
                </Button>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
