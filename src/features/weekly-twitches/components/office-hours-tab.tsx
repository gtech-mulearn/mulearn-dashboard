"use client";

import { Eye, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import Pagination from "@/components/dashboard/table/pagination";
import Table, { type Data } from "@/components/dashboard/table/Table";
import TableTop from "@/components/dashboard/table/TableTop";
import THead from "@/components/dashboard/table/Thead";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useOfficeHoursList, useOfficeHoursMutations } from "../hooks";
import type { OfficeHoursItem } from "../schemas";
import { OfficeHoursDetailDialog } from "./office-hours-detail-dialog";
import { OfficeHoursForm } from "./office-hours-form";

const STATUS_COLORS: Record<string, string> = {
  upcoming: "app-status-applied",
  ongoing: "app-status-accepted",
  completed: "ig-status-cancelled",
};

const COLUMNS = [
  { column: "title", Label: "Title", isSortable: false, width: "w-52" },
  { column: "performer", Label: "Performer", isSortable: false, width: "w-36" },
  { column: "date", Label: "Date", isSortable: false, width: "w-28" },
  { column: "status", Label: "Status", isSortable: false, width: "w-28" },
  {
    column: "interest_groups",
    Label: "Interest Groups",
    isSortable: false,
    width: "w-44",
  },
];

export function OfficeHoursTab() {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [viewTarget, setViewTarget] = useState<OfficeHoursItem | null>(null);
  const [editTarget, setEditTarget] = useState<OfficeHoursItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<OfficeHoursItem | null>(
    null,
  );

  const { data, isLoading } = useOfficeHoursList({
    pageIndex: page,
    perPage,
    search,
    status: status || undefined,
  });

  const { remove } = useOfficeHoursMutations();

  const rows = data?.data ?? [];
  const totalPages = data?.pagination.totalPages ?? 0;
  const totalCount = data?.pagination.count;

  const tableRows: Data[] = rows.map((r) => ({
    ...r,
    interest_groups: (r.interest_groups ?? []).join(", "),
  }));

  const handleSearch = (val: string) => {
    setPage(1);
    setSearch(val);
  };

  const handlePerPage = (val: number) => {
    setPage(1);
    setPerPage(val);
  };

  const handleStatusChange = (val: string) => {
    setPage(1);
    setStatus(val === "all" ? "" : val);
  };

  const openCreate = () => {
    setEditTarget(null);
    setFormOpen(true);
  };

  const openEdit = (id: string | number | boolean) => {
    const item = rows.find((r) => r.id === String(id));
    if (item) {
      setEditTarget(item);
      setFormOpen(true);
    }
  };

  const openView = (id: string | number | boolean) => {
    const item = rows.find((r) => r.id === String(id));
    if (item) setViewTarget(item);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await remove.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <TableTop
          onSearchText={handleSearch}
          onPerPageNumber={handlePerPage}
          CSV=""
          perPage={perPage}
          perPageOptions={[10, 25, 50]}
          searchPlaceholder="Search sessions..."
          searchSize="md"
          searchPosition="left"
          searchWrapperClassName="mb-0"
        />
        <div className="flex shrink-0 items-center gap-2">
          <Select value={status || "all"} onValueChange={handleStatusChange}>
            <SelectTrigger className="h-10 w-[140px] rounded-xl border-border bg-background">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="ongoing">Ongoing</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={openCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Session
          </Button>
        </div>
      </div>

      <Table
        rows={tableRows}
        isLoading={isLoading}
        page={page}
        perPage={perPage}
        columnOrder={COLUMNS}
        id={["id"]}
        customCellRender={(column, row) => {
          if (column === "status") {
            const s = String(row.status ?? "");
            return (
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${STATUS_COLORS[s] ?? ""}`}
              >
                {s}
              </span>
            );
          }
          if (column === "interest_groups") {
            const val = String(row.interest_groups ?? "");
            if (!val) return <span className="text-muted-foreground">—</span>;
            return (
              <div className="flex flex-wrap gap-1">
                {val.split(", ").map((ig) => (
                  <Badge key={ig} variant="secondary" className="text-xs">
                    {ig}
                  </Badge>
                ))}
              </div>
            );
          }
          return null;
        }}
        customActionRender={(row) => (
          <div className="flex items-center justify-center gap-1">
            <Button
              size="icon"
              variant="ghost"
              className="text-muted-foreground hover:bg-muted hover:text-foreground"
              onClick={() => openView(row.id ?? "")}
              aria-label="View"
            >
              <Eye className="size-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="text-muted-foreground hover:bg-muted hover:text-foreground"
              onClick={() => openEdit(row.id ?? "")}
              aria-label="Edit"
            >
              <Pencil className="size-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="text-destructive hover:bg-muted hover:text-destructive"
              onClick={() => {
                const item = rows.find((r) => r.id === String(row.id));
                if (item) setDeleteTarget(item);
              }}
              aria-label="Delete"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        )}
      >
        <THead columnOrder={COLUMNS} onIconClick={() => {}} action={true} />
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          perPage={perPage}
          totalCount={totalCount}
          currentPageCount={rows.length}
          handlePreviousClick={() => setPage((p) => Math.max(p - 1, 1))}
          handleNextClick={() => setPage((p) => Math.min(p + 1, totalPages))}
        />
      </Table>

      <OfficeHoursForm
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        initialData={editTarget}
      />

      <OfficeHoursDetailDialog
        item={viewTarget}
        onClose={() => setViewTarget(null)}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Office Hours Session?"
        description={`"${deleteTarget?.title}" will be soft-deleted and hidden from all listings.`}
        onConfirm={handleDelete}
        isPending={remove.isPending}
      />
    </div>
  );
}
