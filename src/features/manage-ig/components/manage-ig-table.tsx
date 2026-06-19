"use client";

import { Download, Eye, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { DataTableErrorBoundary } from "@/components/dashboard/DataTableErrorBoundary";
import Pagination from "@/components/dashboard/table/pagination";
import type { Data } from "@/components/dashboard/table/Table";
import Table from "@/components/dashboard/table/Table";
import TableTop from "@/components/dashboard/table/TableTop";
import THead from "@/components/dashboard/table/Thead";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useInterestGroupsAdmin } from "../hooks/use-manage-ig";
import type { InterestGroup } from "../schemas";
import { IGDetailPanel } from "./ig-detail-panel";
import { InterestGroupFormDialog } from "./ig-form-dialog";

export function ManageIGTable() {
  const {
    interestGroups,
    isLoading,
    page,
    perPage,
    totalCount,
    setPage,
    setPerPage,
    setSearch,
    setSortBy,
    deleteInterestGroup,
    exportCSV,
  } = useInterestGroupsAdmin();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedIG, setSelectedIG] = useState<InterestGroup | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<InterestGroup | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSortChange = (column: string) => {
    setPage(1);
    setSortBy((prev) => (prev === column ? `-${column}` : column));
  };

  const columnOrder = [
    {
      column: "name",
      Label: "Name",
      isSortable: true,
      width: "w-[16rem] max-w-[16rem]",
    },
    { column: "code", Label: "Code", isSortable: false, width: "min-w-[5rem]" },
    { column: "category", Label: "Category", isSortable: true },
    { column: "members", Label: "Members", isSortable: true },
    { column: "status", Label: "Status", isSortable: true },
    { column: "created_by", Label: "Created By", isSortable: true },
    { column: "updated_by", Label: "Updated By", isSortable: true },
    { column: "created_at", Label: "Created On", isSortable: true },
    { column: "updated_at", Label: "Updated On", isSortable: true },
  ];

  const customCellRender = (column: string, row: Data) => {
    if (column === "name") {
      return (
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="font-medium whitespace-normal break-all">
            {row.name}
          </span>
        </div>
      );
    }
    if (column === "category") {
      const colors: Record<string, string> = {
        maker: "ig-cat-maker",
        coder: "ig-cat-coder",
        creative: "ig-cat-creative",
        manager: "ig-cat-manager",
        others: "ig-cat-others",
      };
      const cat = String(row.category || "others");
      return (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${colors[cat] || colors.others}`}
        >
          {cat}
        </span>
      );
    }
    if (column === "status") {
      const status = String(row.status || "");
      const statusClasses: Record<string, string> = {
        active: "bg-primary/10 text-primary border-primary/20",
        requested: "bg-chart-4/15 text-chart-4 border-chart-4/30",
        rejected: "bg-destructive/10 text-destructive border-destructive/20",
        cancelled: "bg-destructive/10 text-destructive border-destructive/20",
      };
      return (
        <Badge
          variant="outline"
          className={`capitalize ${statusClasses[status] || "bg-muted text-muted-foreground border-border"}`}
        >
          {status || "unknown"}
        </Badge>
      );
    }
    if (column === "members") {
      return (
        <span className="tabular-nums font-medium">
          {Number(row.members ?? 0).toLocaleString()}
        </span>
      );
    }
    if (column === "updated_at" || column === "created_at") {
      const dateStr = String(row[column] || "");
      if (!dateStr) return <span className="text-muted-foreground">—</span>;
      try {
        return (
          <span className="text-sm tabular-nums">
            {new Date(dateStr).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </span>
        );
      } catch {
        return <span className="text-sm">{dateStr}</span>;
      }
    }
    return null;
  };

  const handleEdit = (row: InterestGroup) => {
    setSelectedIG(row);
    setIsFormOpen(true);
  };

  const handleView = (row: InterestGroup) => {
    setSelectedIG(row);
    setIsDetailOpen(true);
  };

  const handleDeleteRequest = (row: InterestGroup) => {
    setDeleteTarget(row);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteInterestGroup(deleteTarget.id);
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  const handleCreate = () => {
    setSelectedIG(null);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight">Interest Groups</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage community interest groups, roles, and membership.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={exportCSV}>
            <Download className="mr-2 size-4" /> Export CSV
          </Button>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 size-4" /> Create IG
          </Button>
        </div>
      </div>

      <TableTop
        onSearchText={setSearch}
        onPerPageNumber={setPerPage}
        CSV=""
        perPage={perPage}
        perPageOptions={[10, 25, 50]}
        searchPlaceholder="Search Interest Groups..."
        searchSize="md"
        searchPosition="right"
      />

      <DataTableErrorBoundary>
        <Table
          rows={interestGroups as unknown as Data[]}
          isLoading={isLoading}
          page={page}
          perPage={perPage}
          columnOrder={columnOrder}
          id={["id"]}
          customCellRender={customCellRender}
          customActionRender={(row) => {
            const ig = row as unknown as InterestGroup;
            return (
              <div className="flex items-center justify-end gap-0.5">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                  onClick={() => handleView(ig)}
                  aria-label={`View details for ${ig.name}`}
                >
                  <Eye className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                  onClick={() => handleEdit(ig)}
                  aria-label={`Edit ${ig.name}`}
                >
                  <Pencil className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                  onClick={() => handleDeleteRequest(ig)}
                  aria-label={`Delete ${ig.name}`}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            );
          }}
        >
          <THead
            columnOrder={columnOrder}
            onIconClick={handleSortChange}
            action={true}
          />
          <div className="p-4">
            <Pagination
              currentPage={page}
              totalPages={Math.ceil(totalCount / perPage)}
              perPage={perPage}
              totalCount={totalCount}
              handlePreviousClick={() => setPage((p) => Math.max(1, p - 1))}
              handleNextClick={() =>
                setPage((p) => Math.min(Math.ceil(totalCount / perPage), p + 1))
              }
            />
          </div>
        </Table>
      </DataTableErrorBoundary>

      <InterestGroupFormDialog
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        initialData={selectedIG}
      />

      <IGDetailPanel
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        ig={selectedIG}
        onEdit={(ig) => {
          setIsDetailOpen(false);
          handleEdit(ig);
        }}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title={`Delete "${deleteTarget?.name}"?`}
        description="This will permanently delete this interest group and its associated roles (Member, CampusLead, IGLead). This action cannot be undone."
        onConfirm={handleDeleteConfirm}
        isPending={isDeleting}
        variant="destructive"
        confirmLabel="Delete IG"
      />
    </div>
  );
}
