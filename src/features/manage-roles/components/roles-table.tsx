"use client";

import { FileSpreadsheet, Plus, Shield, UserPlus } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { endpoints } from "@/api/endpoints";
import Pagination from "@/components/dashboard/table/pagination";
import Table from "@/components/dashboard/table/Table";
import TableTop from "@/components/dashboard/table/TableTop";
import THead from "@/components/dashboard/table/Thead";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useDeleteRole,
  useRolesCsvDownload,
  useRolesList,
} from "../hooks/use-roles";
import type { Role } from "../schemas";
import { BulkImportDialog } from "./bulk-import-dialog";
import { RoleFormDialog } from "./role-form-dialog";
import { UserRoleAssignment } from "./user-role-assignment";

const buildColumnOrder = (
  onAssign: (id: string | number | boolean) => void,
) => [
  { column: "title", Label: "Title", isSortable: true, width: "min-w-[150px]" },
  {
    column: "description",
    Label: "Description",
    isSortable: false,
    width: "min-w-[200px] max-w-[300px]",
    wrap: (data: string | import("react").ReactElement) => (
      <span
        className="line-clamp-2 text-sm text-muted-foreground"
        title={typeof data === "string" ? data : undefined}
      >
        {data || "—"}
      </span>
    ),
  },
  {
    column: "members",
    Label: "Members",
    isSortable: true,
    width: "min-w-[100px]",
  },
  {
    column: "updated_at",
    Label: "Updated On",
    isSortable: true,
    width: "min-w-[120px] hidden lg:table-cell",
  },
  {
    column: "updated_by",
    Label: "Updated By",
    isSortable: false,
    width: "min-w-[120px] hidden xl:table-cell",
  },
  {
    column: "created_by",
    Label: "Created By",
    isSortable: false,
    width: "min-w-[120px] hidden xl:table-cell",
  },
  {
    column: "created_at",
    Label: "Created On",
    isSortable: true,
    width: "min-w-[120px] hidden lg:table-cell",
  },
  {
    column: "id",
    Label: "Assign",
    isSortable: false,
    width: "w-20 min-w-[80px]",
    wrap: (_data: string | import("react").ReactElement, id: string) => (
      <Button
        type="button"
        variant="outline"
        onClick={() => onAssign(id)}
        aria-label="Assign role"
      >
        <UserPlus className="size-3" />
        <span className="hidden sm:inline">Assign</span>
      </Button>
    ),
  },
];

export default function ManageRoles() {
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [sort, setSort] = useState("");
  const [search, setSearch] = useState("");

  // Dialogs state
  const [formOpen, setFormOpen] = useState(false);
  const [editRole, setEditRole] = useState<Role | null>(null);
  const [assignRole, setAssignRole] = useState<Role | null>(null);
  const [assignOpen, setAssignOpen] = useState(false);
  const [bulkImportOpen, setBulkImportOpen] = useState(false);

  const { data, isLoading } = useRolesList({
    pageIndex: currentPage,
    perPage,
    search,
    sortBy: sort,
  });
  const deleteMutation = useDeleteRole();
  const { downloadCsv, isDownloading } = useRolesCsvDownload();

  const rows = (data?.data ?? []) as Role[];
  const totalPages = data?.pagination.totalPages ?? 0;
  const totalCount = data?.pagination.count;

  // ─── Handlers ────────────────────────────────────────────────────
  const handleSearch = (value: string) => {
    setCurrentPage(1);
    setSearch(value);
  };
  const handlePerPageNumber = (value: number) => {
    setCurrentPage(1);
    setPerPage(value);
  };
  const handleSortChange = (column: string) => {
    setCurrentPage(1);
    setSort((prev) => (prev === column ? `-${column}` : column));
  };

  const handleDeleteRow = async (value: string | undefined) => {
    if (!value) return;
    await deleteMutation.mutateAsync(value);
  };

  const handleEditRow = (id: string | number | boolean) => {
    const role = rows.find((r) => r.id === String(id)) ?? null;
    setEditRole(role);
    setFormOpen(true);
  };

  const handleAssignRow = useCallback(
    (id: string | number | boolean) => {
      const role = rows.find((r) => r.id === String(id)) ?? null;
      setAssignRole(role);
      setAssignOpen(true);
    },
    [rows],
  );

  const columnOrder = useMemo(
    () => buildColumnOrder(handleAssignRow),
    [handleAssignRow],
  );

  const handleCreateOpen = () => {
    setEditRole(null);
    setFormOpen(true);
  };

  return (
    <>
      <Card className="overflow-visible border-0 bg-transparent shadow-none rounded-none">
        <CardHeader className="px-0 py-0 sm:px-0 sm:py-0">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/6 px-3 py-1 text-xs font-semibold text-primary">
                <Shield className="size-3.5" />
                Management
              </div>
              <CardTitle className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Manage Roles
              </CardTitle>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setBulkImportOpen(true)}
                aria-label="Open bulk import dialog"
              >
                <FileSpreadsheet className="size-3.5" />
                Bulk Import
              </Button>
              <Button
                size="sm"
                variant="default"
                onClick={handleCreateOpen}
                aria-label="Create new role"
              >
                <Plus className="size-3.5" />
                Create
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 bg-transparent p-0 pt-6">
          <TableTop
            onSearchText={handleSearch}
            onPerPageNumber={handlePerPageNumber}
            perPage={perPage}
            perPageOptions={[5, 10, 20, 50, 100]}
            CSV={endpoints.manageRoles.csv}
            onCsvDownload={downloadCsv}
            isCsvDownloading={isDownloading}
            searchPlaceholder="Search roles…"
            searchSize="md"
            searchPosition="right"
            searchWrapperClassName="md:max-w-[680px]"
            searchFieldWrapperClassName="lg:max-w-[380px]"
            searchInputClassName="h-10 text-sm"
          />

          {/* Desktop: outer wrapper enables horizontal scroll without compressing table-fixed columns */}
          <div className="w-full ">
            <div className="w-full md:min-w-[800px]">
              <Table
                rows={rows}
                isLoading={isLoading}
                page={currentPage}
                perPage={perPage}
                columnOrder={columnOrder}
                id={["id"]}
                onEditClick={handleEditRow}
                onDeleteClick={handleDeleteRow}
                modalDeleteHeading="Delete Role"
                modalDeleteContent="Are you sure you want to delete this role? This cannot be undone."
                modalTypeContent="error"
              >
                <THead
                  columnOrder={columnOrder}
                  onIconClick={handleSortChange}
                  action
                />
                <div>
                  {!isLoading && (
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      handleNextClick={() =>
                        setCurrentPage((p) => Math.min(p + 1, totalPages || 1))
                      }
                      handlePreviousClick={() =>
                        setCurrentPage((p) => Math.max(p - 1, 1))
                      }
                      perPage={perPage}
                      totalCount={totalCount}
                    />
                  )}
                </div>
                <div />
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create / Edit role dialog */}
      <RoleFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        role={editRole}
      />

      {/* User-role assignment sheet */}
      <UserRoleAssignment
        open={assignOpen}
        onOpenChange={setAssignOpen}
        role={assignRole}
      />

      {/* Bulk Excel import dialog */}
      <BulkImportDialog
        open={bulkImportOpen}
        onOpenChange={setBulkImportOpen}
      />
    </>
  );
}
