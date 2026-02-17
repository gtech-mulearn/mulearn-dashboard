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
    <div className="overflow-x-auto rounded-2xl border border-border/50">
      <table className="w-full min-w-[980px] border-collapse">
        <thead className="bg-card">
          <tr className="border-b border-border/40">
            <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Sl.no
            </th>

            {manageUsersColumns.map((column) => (
              <th
                key={column.key}
                className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
                  onClick={() => column.sortable && onSort(column.key)}
                >
                  <span>{column.label}</span>
                  {column.sortable && (
                    <ArrowDownUp className="size-3.5 text-muted-foreground" />
                  )}
                </button>
              </th>
            ))}

            <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Action
            </th>
          </tr>
        </thead>

        <tbody>
          {isLoading ? (
            <tr>
              <td
                colSpan={manageUsersColumns.length + 2}
                className="px-4 py-12"
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
                className="px-4 py-12 text-center text-sm text-muted-foreground"
              >
                No data to display
              </td>
            </tr>
          ) : (
            users.map((user, index) => (
              <tr
                key={user.id}
                className="border-t border-border/40 transition-colors hover:bg-muted/30"
              >
                <td className="px-4 py-3.5 text-sm text-foreground">
                  {(pageIndex - 1) * perPage + index + 1}
                </td>
                <td className="px-4 py-3.5 text-sm font-medium text-foreground">
                  {user.full_name || "-"}
                </td>
                <td className="px-4 py-3.5 text-sm text-foreground">
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                    {user.karma}
                  </span>
                </td>
                <td className="px-4 py-3.5 font-mono text-xs text-muted-foreground">
                  {user.muid || "-"}
                </td>
                <td className="px-4 py-3.5 text-sm text-foreground">
                  {user.email || "-"}
                </td>
                <td className="px-4 py-3.5 text-sm text-foreground">
                  {user.mobile || "-"}
                </td>
                <td className="px-4 py-3.5 text-sm text-foreground">
                  {user.discord_id || "-"}
                </td>
                <td className="px-4 py-3.5 text-sm text-foreground">
                  {user.level}
                </td>
                <td className="px-4 py-3.5 text-sm text-muted-foreground">
                  {formatDate(user.created_at)}
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-1.5">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => onEdit(user.id)}
                      onMouseEnter={() => onEditHover(user.id)}
                      onFocus={() => onEditHover(user.id)}
                      aria-label="Edit user"
                      className="h-8 w-8 rounded-lg transition-all hover:bg-primary/10 hover:text-primary"
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => onDelete(user.id)}
                      aria-label="Delete user"
                      className="h-8 w-8 rounded-lg text-destructive transition-all hover:bg-destructive/10"
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
  );
}
