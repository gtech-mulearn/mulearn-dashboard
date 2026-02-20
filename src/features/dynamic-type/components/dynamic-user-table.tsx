/**
 * Dynamic User Table
 *
 * 📍 src/features/dynamic-type/components/dynamic-user-table.tsx
 *
 * Table listing all dynamic user-type mappings with inline search,
 * and row-level Edit / Delete actions.
 */

"use client";

import {
  AlertTriangle,
  Download,
  Edit2,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useDeleteDynamicUser, useDynamicUsers } from "../hooks";
import type { DynamicUserItem } from "../types";
import { DynamicTypeFormDialog } from "./dynamic-type-form-dialog";

// ============================================
// Confirm Delete Dialog
// ============================================

interface ConfirmDeleteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isPending: boolean;
  itemLabel: string;
}

function ConfirmDeleteDialog({
  open,
  onOpenChange,
  onConfirm,
  isPending,
  itemLabel,
}: ConfirmDeleteProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Delete User Mapping
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to remove <strong>{itemLabel}</strong> from
            their type? This cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={isPending}
          >
            {isPending && <Spinner className="mr-2 h-4 w-4" />}
            Remove
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// Main Table
// ============================================

export function DynamicUserTable() {
  const { data: rows = [], isLoading, isError, refetch } = useDynamicUsers();
  const { mutate: deleteUser, isPending: isDeleting } = useDeleteDynamicUser();

  const [search, setSearch] = useState("");
  const [editTarget, setEditTarget] = useState<DynamicUserItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DynamicUserItem | null>(
    null,
  );

  // Client-side filter
  const filtered = rows.filter(
    (r: DynamicUserItem) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.type.toLowerCase().includes(search.toLowerCase()) ||
      r.email.toLowerCase().includes(search.toLowerCase()) ||
      r.muid.toLowerCase().includes(search.toLowerCase()),
  );

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    deleteUser(deleteTarget.id, {
      onSuccess: () => setDeleteTarget(null),
    });
  };

  const downloadCSV = () => {
    const headers = ["Sl.No", "Type", "Name", "Email", "MUID"];
    const csvRows = filtered.map((r: DynamicUserItem, i: number) => [
      i + 1,
      r.type,
      r.name,
      r.email,
      r.muid,
    ]);
    const csv = [headers, ...csvRows]
      .map((row: (string | number)[]) =>
        row
          .map((v: string | number) => `"${String(v).replace(/"/g, '""')}"`)
          .join(","),
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "dynamic-user-mappings.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Loading state ──────────────────────────
  if (isLoading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <Spinner className="h-6 w-6 text-muted-foreground" />
      </div>
    );
  }

  // ── Error state ────────────────────────────
  if (isError) {
    return (
      <div className="flex min-h-[200px] flex-col items-center justify-center gap-3">
        <p className="text-sm text-muted-foreground">
          Failed to load user mappings.
        </p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <>
      {/* Search bar + CSV */}
      <div className="mb-4 flex items-center gap-2">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="dynamic-user-search"
            className="pl-9"
            placeholder="Search by name, type, email or MUID…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <span className="text-sm text-muted-foreground">
          {filtered.length} result{filtered.length !== 1 ? "s" : ""}
        </span>
        <Button
          id="dynamic-user-download-csv"
          variant="default"
          size="sm"
          className="ml-auto gap-1.5"
          onClick={downloadCSV}
          disabled={filtered.length === 0}
          title="Download as CSV"
        >
          <Download className="h-4 w-4" />
          CSV
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-lg border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Name
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Type
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Email
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  MUID
                </th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-10 text-center text-muted-foreground"
                  >
                    No user mappings found.
                  </td>
                </tr>
              ) : (
                filtered.map((row: DynamicUserItem) => (
                  <tr
                    key={row.id}
                    className="border-b transition-colors last:border-0 hover:bg-muted/20"
                  >
                    <td className="px-4 py-3 font-medium">{row.name}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center rounded-md bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                        {row.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {row.email}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      {row.muid}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          id={`edit-user-${row.id}`}
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => setEditTarget(row)}
                          title="Edit mapping"
                        >
                          <Edit2 className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                          id={`delete-user-${row.id}`}
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => setDeleteTarget(row)}
                          title="Delete mapping"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit dialog */}
      {editTarget && (
        <DynamicTypeFormDialog
          open={editTarget !== null}
          onOpenChange={(open) => {
            if (!open) setEditTarget(null);
          }}
          mode="edit"
          tab="user"
          editId={editTarget.id}
          initialMuid={editTarget.muid}
          initialType={editTarget.type}
        />
      )}

      {/* Confirm delete dialog */}
      <ConfirmDeleteDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        onConfirm={handleDeleteConfirm}
        isPending={isDeleting}
        itemLabel={
          deleteTarget ? `${deleteTarget.name} (${deleteTarget.muid})` : ""
        }
      />
    </>
  );
}
