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
import {
  useIsList,
  useIsMutations,
  useSmtList,
  useSmtMutations,
} from "../hooks";
import type { CampusContentItem } from "../schemas";
import { CampusContentDetailDialog } from "./campus-content-detail-dialog";
import {
  CampusContentForm,
  type CampusContentType,
} from "./campus-content-form";

const STATUS_COLORS: Record<string, string> = {
  upcoming: "app-status-applied",
  ongoing: "app-status-accepted",
  completed: "ig-status-cancelled",
};

const COLUMNS = [
  { column: "topic", Label: "Topic", isSortable: false, width: "w-52" },
  { column: "campus", Label: "Campus", isSortable: false, width: "w-40" },
  { column: "zone", Label: "Zone", isSortable: false, width: "w-24" },
  { column: "date", Label: "Date", isSortable: false, width: "w-28" },
  { column: "status", Label: "Status", isSortable: false, width: "w-28" },
];

const LABELS: Record<CampusContentType, string> = {
  smt: "Salt Mango Tree",
  isr: "Inspiration Station Radio",
};

interface Props {
  contentType: CampusContentType;
}

export function CampusContentTab({ contentType }: Props) {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [zone, setZone] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [viewTarget, setViewTarget] = useState<CampusContentItem | null>(null);
  const [editTarget, setEditTarget] = useState<CampusContentItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CampusContentItem | null>(
    null,
  );

  const params = {
    pageIndex: page,
    perPage,
    search,
    status: status || undefined,
    zone: zone || undefined,
  };

  const smtQuery = useSmtList(params, contentType === "smt");
  const isQuery = useIsList(params, contentType === "isr");
  const query = contentType === "smt" ? smtQuery : isQuery;

  const smtMutations = useSmtMutations();
  const isMutations = useIsMutations();
  const { remove } = contentType === "smt" ? smtMutations : isMutations;

  const { data, isLoading } = query;
  const rows = data?.data ?? [];
  const totalPages = data?.pagination.totalPages ?? 0;
  const totalCount = data?.pagination.count;

  const tableRows: Data[] = rows.map((r) => ({ ...r }));

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
  const handleZoneChange = (val: string) => {
    setPage(1);
    setZone(val === "all" ? "" : val);
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

  const label = LABELS[contentType];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <TableTop
          onSearchText={handleSearch}
          onPerPageNumber={handlePerPage}
          CSV=""
          perPage={perPage}
          perPageOptions={[10, 25, 50]}
          searchPlaceholder="Search episodes..."
          searchSize="md"
          searchPosition="left"
          searchWrapperClassName="mb-0"
        />
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:shrink-0">
          <Select value={status || "all"} onValueChange={handleStatusChange}>
            <SelectTrigger className="h-10 w-full rounded-xl border-border bg-background sm:w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="ongoing">Ongoing</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={zone || "all"} onValueChange={handleZoneChange}>
            <SelectTrigger className="h-10 w-full rounded-xl border-border bg-background sm:w-[120px]">
              <SelectValue placeholder="Zone" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All zones</SelectItem>
              <SelectItem value="north">North</SelectItem>
              <SelectItem value="central">Central</SelectItem>
              <SelectItem value="south">South</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={openCreate} className="w-full gap-2 sm:w-auto">
            <Plus className="h-4 w-4" />
            Add Episode
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
          if (column === "zone") {
            const z = String(row.zone ?? "");
            return z ? (
              <span className="capitalize">{z}</span>
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

      <CampusContentForm
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        contentType={contentType}
        initialData={editTarget}
      />

      <CampusContentDetailDialog
        item={viewTarget}
        contentType={contentType}
        onClose={() => setViewTarget(null)}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={`Delete ${label}?`}
        description={`"${deleteTarget?.topic}" will be soft-deleted and hidden from all listings.`}
        onConfirm={handleDelete}
        isPending={remove.isPending}
      />
    </div>
  );
}
