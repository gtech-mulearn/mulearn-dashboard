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
  onDelete: (id: string) => void;
}

export function ManageUsersTable({
  users,
  isLoading,
  pageIndex,
  perPage,
  onSort,
  onEdit,
  onDelete,
}: ManageUsersTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full min-w-[980px] border-collapse">
        <thead className="bg-muted/50">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
              Sl.no
            </th>

            {manageUsersColumns.map((column) => (
              <th
                key={column.key}
                className="px-4 py-3 text-left text-sm font-semibold text-foreground"
              >
                <button
                  type="button"
                  className="inline-flex items-center gap-1"
                  onClick={() => column.sortable && onSort(column.key)}
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
              <td
                colSpan={manageUsersColumns.length + 2}
                className="px-4 py-10"
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
                      onClick={() => onEdit(user.id)}
                      aria-label="Edit user"
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => onDelete(user.id)}
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
  );
}
