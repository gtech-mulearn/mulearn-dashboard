"use client";

import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ManageUserListItem } from "../schemas";

type SortableColumn =
  | "full_name"
  | "karma"
  | "muid"
  | "email"
  | "mobile"
  | "discord_id"
  | "level"
  | "created_at";

interface ManageUsersTableProps {
  rows: ManageUserListItem[];
  sortBy: string;
  pageIndex: number;
  perPage: number;
  onSort: (column: SortableColumn) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const columns: Array<{
  key: SortableColumn;
  label: string;
}> = [
  { key: "full_name", label: "Full Name" },
  { key: "karma", label: "Total Karma" },
  { key: "muid", label: "Mu ID" },
  { key: "email", label: "Email" },
  { key: "mobile", label: "Mobile" },
  { key: "discord_id", label: "Discord ID" },
  { key: "level", label: "Level" },
  { key: "created_at", label: "Created On" },
];

function getSortArrow(sortBy: string, key: string) {
  if (sortBy === key) return "↑";
  if (sortBy === `-${key}`) return "↓";
  return "↕";
}

function formatDate(value?: string) {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString();
}

export function ManageUsersTable({
  rows,
  sortBy,
  pageIndex,
  perPage,
  onSort,
  onEdit,
  onDelete,
}: ManageUsersTableProps) {
  return (
    <div className="border-border bg-card overflow-x-auto rounded-lg border">
      <table className="min-w-[1100px] w-full">
        <thead className="bg-muted/60">
          <tr>
            <th className="text-foreground px-4 py-3 text-left text-sm font-semibold">
              Sl.no
            </th>
            {columns.map((column) => (
              <th
                key={column.key}
                className="text-foreground px-4 py-3 text-left text-sm font-semibold"
              >
                <button
                  type="button"
                  onClick={() => onSort(column.key)}
                  className="hover:text-foreground/80 inline-flex items-center gap-1"
                >
                  {column.label}
                  <span className="text-muted-foreground text-xs">
                    {getSortArrow(sortBy, column.key)}
                  </span>
                </button>
              </th>
            ))}
            <th className="text-foreground px-4 py-3 text-left text-sm font-semibold">
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => {
            const id = String(row.id);
            return (
              <tr key={id} className="border-border border-t">
                <td className="px-4 py-3 text-sm">
                  {(pageIndex - 1) * perPage + index + 1}
                </td>
                <td className="px-4 py-3 text-sm">{row.full_name ?? "-"}</td>
                <td className="px-4 py-3 text-sm">{row.karma ?? "-"}</td>
                <td className="px-4 py-3 text-sm">{row.muid ?? "-"}</td>
                <td className="px-4 py-3 text-sm">{row.email ?? "-"}</td>
                <td className="px-4 py-3 text-sm">{row.mobile ?? "-"}</td>
                <td className="px-4 py-3 text-sm">{row.discord_id ?? "-"}</td>
                <td className="px-4 py-3 text-sm">{row.level ?? "-"}</td>
                <td className="px-4 py-3 text-sm">
                  {formatDate(row.created_at)}
                </td>
                <td className="px-4 py-3 text-sm">
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(id)}
                      aria-label="Edit user"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(id)}
                      aria-label="Delete user"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export type { SortableColumn };
