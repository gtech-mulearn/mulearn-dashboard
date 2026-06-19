/**
 * Dynamic User Table
 *
 * 📍 src/features/dynamic-type/components/dynamic-user-table.tsx
 *
 * Uses the shared dashboard Table component for consistent UI.
 * Handles client-side search, CSV download, and row-level Edit / Delete.
 */

"use client";

import { useMemo, useState } from "react";
import { Blank } from "@/components/dashboard/table/Blank";
import Pagination from "@/components/dashboard/table/pagination";
import Table from "@/components/dashboard/table/Table";
import TableTop from "@/components/dashboard/table/TableTop";
import THead from "@/components/dashboard/table/Thead";
import { useDeleteDynamicUser, useDynamicUsers } from "../hooks";
import type { DynamicUserItem } from "../types";
import { DynamicTypeFormDialog } from "./dynamic-type-form-dialog";

// ============================================
// Column definition for the reusable Table
// ============================================

const COLUMN_ORDER = [
  { column: "name", Label: "Name", isSortable: false },
  { column: "type", Label: "Type", isSortable: false },
  { column: "email", Label: "Email", isSortable: false },
  { column: "muid", Label: "MUID", isSortable: false },
];

// ============================================
// Main Table
// ============================================

export function DynamicUserTable() {
  const { data: rows = [], isLoading } = useDynamicUsers();
  const { mutate: deleteUser } = useDeleteDynamicUser();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  // State for the edit dialog — stores the full row so we can pre-fill the form
  const [editTarget, setEditTarget] = useState<DynamicUserItem | null>(null);

  // Client-side search filter
  const filtered = useMemo(
    () =>
      rows.filter(
        (r: DynamicUserItem) =>
          r.name.toLowerCase().includes(search.toLowerCase()) ||
          r.type.toLowerCase().includes(search.toLowerCase()) ||
          r.email.toLowerCase().includes(search.toLowerCase()) ||
          r.muid.toLowerCase().includes(search.toLowerCase()),
      ),
    [rows, search],
  );

  // Paginate after filtering
  const totalPages = useMemo(
    () => Math.ceil(filtered.length / perPage),
    [filtered, perPage],
  );
  const pageSlice = useMemo(
    () => filtered.slice((page - 1) * perPage, page * perPage),
    [filtered, page, perPage],
  );

  // CSV download (filtered data)
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

  // When the reusable Table fires onEditClick it passes the row's `id` value.
  // We look that up in `rows` so we have the full item to pre-fill the form.
  const handleEdit = (id: string | number | boolean) => {
    const target = rows.find((r: DynamicUserItem) => r.id === String(id));
    if (target) setEditTarget(target);
  };

  // When the reusable Table fires onDeleteClick it passes the row's `id` value.
  // The Table already shows a confirm Modal; this runs after the user confirms.
  const handleDelete = (id: string | undefined) => {
    if (id) deleteUser(id);
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
        CSV="dynamic-user-mappings.csv"
        perPage={perPage}
        perPageOptions={[10, 25, 50, 100]}
        searchPlaceholder="Search by name, type, email or MUID…"
        searchSize="sm"
        searchPosition="right"
        onCsvDownload={downloadCSV}
      />

      {/* Reusable Table — children[0]=THead, children[1]=Pagination, children[2]=Blank */}
      <Table
        rows={pageSlice}
        isLoading={isLoading}
        page={page}
        perPage={perPage}
        columnOrder={COLUMN_ORDER}
        id={["id"]}
        onEditClick={handleEdit}
        onDeleteClick={handleDelete}
        modalDeleteHeading="Remove User Mapping"
        modalDeleteContent="Are you sure you want to remove this user from their type? This action cannot be undone."
      >
        <THead columnOrder={COLUMN_ORDER} onIconClick={() => {}} action />
        <div>
          {!isLoading && (
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              handleNextClick={() =>
                setPage((p) => Math.min(p + 1, totalPages || 1))
              }
              handlePreviousClick={() => setPage((p) => Math.max(p - 1, 1))}
              perPage={perPage}
              totalCount={filtered.length}
            />
          )}
        </div>
        <Blank />
      </Table>

      {/* Edit dialog — opened from handleEdit */}
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
    </>
  );
}
