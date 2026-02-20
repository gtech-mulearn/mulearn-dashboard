/**
 * Dynamic Role Table
 *
 * 📍 src/features/dynamic-type/components/dynamic-role-table.tsx
 *
 * Uses the shared dashboard Table component for consistent UI.
 * Handles client-side search, CSV download, and row-level Edit / Delete.
 */

"use client";

import { useState } from "react";
import Table from "@/components/dashboard/table/Table";
import TableTop from "@/components/dashboard/table/TableTop";
import { useDeleteDynamicRole, useDynamicRoles } from "../hooks";
import type { DynamicRoleItem } from "../types";
import { DynamicTypeFormDialog } from "./dynamic-type-form-dialog";

// ============================================
// Column definition for the reusable Table
// ============================================

const COLUMN_ORDER = [
  { column: "type", Label: "Type", isSortable: false },
  { column: "role", Label: "Role", isSortable: false },
] as const;

// ============================================
// Main Table
// ============================================

export function DynamicRoleTable() {
  const { data: rows = [], isLoading } = useDynamicRoles();
  const { mutate: deleteRole } = useDeleteDynamicRole();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  // State for the edit dialog — stores the full row so we can pre-fill the form
  const [editTarget, setEditTarget] = useState<DynamicRoleItem | null>(null);

  // Client-side search filter
  const filtered = rows.filter(
    (r: DynamicRoleItem) =>
      r.type.toLowerCase().includes(search.toLowerCase()) ||
      r.role.toLowerCase().includes(search.toLowerCase()),
  );

  // Paginate after filtering
  const pageSlice = filtered.slice((page - 1) * perPage, page * perPage);

  // CSV download (filtered data)
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

  // When the reusable Table fires onEditClick it passes the row's `id` value.
  // We look that up in `rows` so we have the full item to pre-fill the form.
  const handleEdit = (id: string | number | boolean) => {
    const target = rows.find((r) => r.id === String(id));
    if (target) setEditTarget(target);
  };

  // When the reusable Table fires onDeleteClick it passes the row's `id` value.
  // The Table already showed a confirm Modal; this runs after the user confirms.
  const handleDelete = (id: string | undefined) => {
    if (id) deleteRole(id);
  };

  return (
    <>
      {/* Search + per-page + CSV — reusable TableTop */}
      <TableTop
        onSearchText={(text) => {
          setSearch(text);
          setPage(1);
        }}
        onPerPageNumber={(n) => {
          setPerPage(n);
          setPage(1);
        }}
        CSV="dynamic-role-mappings.csv"
        perPage={perPage}
        perPageOptions={[10, 25, 50, 100]}
        searchPlaceholder="Search by type or role…"
        searchSize="sm"
        searchPosition="right"
        onCsvDownload={downloadCSV}
      />

      {/* Reusable Table */}
      <Table
        rows={pageSlice}
        isloading={isLoading}
        page={page}
        perPage={perPage}
        columnOrder={[...COLUMN_ORDER]}
        id={["id"]}
        onEditClick={handleEdit}
        onDeleteClick={handleDelete}
        modalDeleteHeading="Delete Role Mapping"
        modalDeleteContent="Are you sure you want to delete this role mapping? This action cannot be undone."
      />

      {/* Edit dialog — opened from handleEdit */}
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
    </>
  );
}
