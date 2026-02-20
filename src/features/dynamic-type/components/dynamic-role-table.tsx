/**
 * Dynamic Role Table
 *
 * 📍 src/features/dynamic-type/components/dynamic-role-table.tsx
 *
 * Table listing all dynamic role-type mappings with inline search,
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
import { useDeleteDynamicRole, useDynamicRoles } from "../hooks";
import type { DynamicRoleItem } from "../types";
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
            Delete Role Mapping
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the mapping for{" "}
            <strong>{itemLabel}</strong>? This action cannot be undone.
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
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// Main Table
// ============================================

export function DynamicRoleTable() {
  const { data: rows = [], isLoading, isError, refetch } = useDynamicRoles();
  const { mutate: deleteRole, isPending: isDeleting } = useDeleteDynamicRole();

  const [search, setSearch] = useState("");
  const [editTarget, setEditTarget] = useState<DynamicRoleItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DynamicRoleItem | null>(
    null,
  );

  // Client-side filter (list is typically small for admin lookups)
  const filtered = rows.filter(
    (r: DynamicRoleItem) =>
      r.type.toLowerCase().includes(search.toLowerCase()) ||
      r.role.toLowerCase().includes(search.toLowerCase()),
  );

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    deleteRole(deleteTarget.id, {
      onSuccess: () => setDeleteTarget(null),
    });
  };

  const downloadCSV = () => {
    const headers = ["Sl.No", "Type", "Role"];
    const csvRows = filtered.map((r: DynamicRoleItem, i: number) => [
      i + 1,
      r.type,
      r.role,
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
    a.download = "dynamic-role-mappings.csv";
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
          Failed to load role mappings.
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
            id="dynamic-role-search"
            className="pl-9"
            placeholder="Search by type or role…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <span className="text-sm text-muted-foreground">
          {filtered.length} result{filtered.length !== 1 ? "s" : ""}
        </span>
        <Button
          id="dynamic-role-download-csv"
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
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Type
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Role
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
                  colSpan={3}
                  className="px-4 py-10 text-center text-muted-foreground"
                >
                  No role mappings found.
                </td>
              </tr>
            ) : (
              filtered.map((row: DynamicRoleItem) => (
                <tr
                  key={row.id}
                  className="border-b transition-colors last:border-0 hover:bg-muted/20"
                >
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center rounded-md bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                      {row.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium">{row.role}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        id={`edit-role-${row.id}`}
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
                        id={`delete-role-${row.id}`}
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

      {/* Edit dialog */}
      {editTarget && (
        <DynamicTypeFormDialog
          open={editTarget !== null}
          onOpenChange={(open) => {
            if (!open) setEditTarget(null);
          }}
          mode="edit"
          tab="role"
          editId={editTarget.id}
          initialRole={editTarget.role}
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
          deleteTarget ? `${deleteTarget.role} → ${deleteTarget.type}` : ""
        }
      />
    </>
  );
}
