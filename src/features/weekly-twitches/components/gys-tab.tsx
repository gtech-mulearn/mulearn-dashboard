"use client";

import { Eye, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import Pagination from "@/components/dashboard/table/pagination";
import Table, { type Data } from "@/components/dashboard/table/Table";
import TableTop from "@/components/dashboard/table/TableTop";
import THead from "@/components/dashboard/table/Thead";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGysList, useGysMutations } from "../hooks";
import { formatTime } from "../lib/format-time";
import type { GysItem } from "../schemas";
import { GysDetailDialog } from "./gys-detail-dialog";
import { GysForm } from "./gys-form";

const STATUS_COLORS: Record<string, string> = {
  upcoming: "app-status-applied",
  ongoing: "app-status-accepted",
  completed: "ig-status-cancelled",
};

const COLUMNS = [
  { column: "title", Label: "Title", isSortable: false, width: "w-52" },
  { column: "campus", Label: "Campus", isSortable: false, width: "w-40" },
  { column: "performer", Label: "Performer", isSortable: false, width: "w-36" },
  { column: "date", Label: "Date", isSortable: false, width: "w-28" },
  { column: "time", Label: "Time", isSortable: false, width: "w-20" },
  { column: "status", Label: "Status", isSortable: false, width: "w-28" },
];

export function GysTab() {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [viewTarget, setViewTarget] = useState<GysItem | null>(null);
  const [editTarget, setEditTarget] = useState<GysItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<GysItem | null>(null);

  const { data, isLoading } = useGysList({
    pageIndex: page,
    perPage,
    search,
    status: status || undefined,
  });

  const { remove } = useGysMutations();

  const rows = data?.data ?? [];
  const totalPages = data?.pagination.totalPages ?? 0;
  const totalCount = data?.pagination.count;

  const tableRows: Data[] = rows.map((r) => ({
    ...r,
    time: formatTime(r.time),
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
          if (column === "time") {
            const t = String(row.time ?? "");
            return t ? (
              <span>{t}</span>
            ) : (
              <span className="text-muted-foreground">—</span>
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

      <GysForm
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        initialData={editTarget}
      />

      <GysDetailDialog item={viewTarget} onClose={() => setViewTarget(null)} />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Grab Your Superpowers Session?"
        description={`"${deleteTarget?.title}" will be soft-deleted and hidden from all listings.`}
        onConfirm={handleDelete}
        isPending={remove.isPending}
      />
    </div>
  );
}
