"use client";

import {
  Briefcase,
  Download,
  Eye,
  Pencil,
  Plus,
  Trash2,
  Upload,
} from "lucide-react";
import { useEffect, useState } from "react";
import Modal from "@/components/dashboard/table/Modal";
import Pagination from "@/components/dashboard/table/pagination";
import Table, { type Data } from "@/components/dashboard/table/Table";
import TableTop from "@/components/dashboard/table/TableTop";
import THead from "@/components/dashboard/table/Thead";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDeleteHiring, useHiringCsvDownload, useHiringList } from "../hooks";
import type { Hiring, HiringStatusFilter } from "../schemas";
import { HiringCsvImportDialog } from "./hiring-csv-import-dialog";
import { HiringFormDialog } from "./hiring-form-dialog";
import { HiringViewDialog } from "./hiring-view-dialog";

const STATUS_TABS: { value: HiringStatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "ongoing", label: "Ongoing" },
  { value: "previous", label: "Previous" },
];

const columnOrder = [
  { column: "title", Label: "Title", isSortable: true, width: "min-w-[200px]" },
  {
    column: "organization",
    Label: "Organization",
    isSortable: true,
    width: "min-w-[150px]",
  },
  { column: "role", Label: "Role", isSortable: false, width: "min-w-[130px]" },
  {
    column: "location",
    Label: "Location",
    isSortable: false,
    width: "min-w-[120px]",
  },
  {
    column: "vacancies",
    Label: "Vacancies",
    isSortable: true,
    width: "min-w-[100px]",
  },
  {
    column: "lastdate",
    Label: "Last Date",
    isSortable: true,
    width: "min-w-[120px]",
  },
  {
    column: "created_by",
    Label: "Created By",
    isSortable: false,
    width: "min-w-[120px] hidden xl:table-cell",
  },
  {
    column: "created_at",
    Label: "Created At",
    isSortable: true,
    width: "min-w-[140px] hidden xl:table-cell",
  },
  {
    column: "updated_by",
    Label: "Updated By",
    isSortable: false,
    width: "min-w-[120px] hidden xl:table-cell",
  },
  {
    column: "updated_at",
    Label: "Updated At",
    isSortable: true,
    width: "min-w-[140px] hidden xl:table-cell",
  },
];

export function HiringTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [sort, setSort] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<HiringStatusFilter>("all");

  const [formOpen, setFormOpen] = useState(false);
  const [editHiring, setEditHiring] = useState<Hiring | null>(null);
  const [viewHiring, setViewHiring] = useState<Hiring | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [importOpen, setImportOpen] = useState(false);

  const { data, isLoading } = useHiringList({
    pageIndex: currentPage,
    perPage,
    search,
    sortBy: sort,
    status,
  });
  const deleteMutation = useDeleteHiring();
  const { downloadCsv, isDownloading } = useHiringCsvDownload();

  const rows = (data?.data ?? []) as Hiring[];
  const totalPages = data?.pagination.total_items
    ? Math.ceil(data.pagination.total_items / perPage)
    : 0;
  const totalCount = data?.pagination.total_items;

  useEffect(() => {
    setEditHiring((current) =>
      current ? (rows.find((r) => r.id === current.id) ?? null) : current,
    );
  }, [rows]);

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
  const handleStatusChange = (value: HiringStatusFilter) => {
    setCurrentPage(1);
    setStatus(value);
  };

  const handleConfirmDelete = async (id: string) => {
    await deleteMutation.mutateAsync(id);
    setDeleteId(null);
  };

  const handleEditRow = (hiring: Hiring) => {
    setEditHiring(hiring);
    setFormOpen(true);
  };

  const handleCreateOpen = () => {
    setEditHiring(null);
    setFormOpen(true);
  };

  return (
    <>
      <Card className="overflow-visible border-0 bg-transparent shadow-none rounded-none">
        <CardHeader className="px-0 py-0 sm:px-0 sm:py-0">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/6 px-3 py-1 text-xs font-semibold text-primary">
                <Briefcase className="size-3.5" />
                Career Labs
              </div>
              <CardTitle className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Hiring Postings
              </CardTitle>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={downloadCsv}
                disabled={isDownloading}
                aria-label="Export hiring postings CSV"
              >
                <Download className="size-3.5" />
                {isDownloading ? "Exporting…" : "Export CSV"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setImportOpen(true)}
                aria-label="Open bulk import dialog"
              >
                <Upload className="size-3.5" />
                Bulk Import
              </Button>
              <Button
                size="sm"
                variant="default"
                onClick={handleCreateOpen}
                aria-label="Create new hiring posting"
              >
                <Plus className="size-3.5" />
                Create
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 bg-transparent p-0 pt-6">
          <div className="flex gap-1 border-b pb-0">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => handleStatusChange(tab.value)}
                className={`inline-flex items-center gap-1.5 shrink-0 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                  status === tab.value
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <TableTop
            onSearchText={handleSearch}
            onPerPageNumber={handlePerPageNumber}
            perPage={perPage}
            perPageOptions={[5, 10, 20, 50, 100]}
            CSV=""
            searchPlaceholder="Search hiring postings…"
            searchSize="md"
            searchPosition="right"
            searchInputClassName="h-10 text-sm"
          />

          <div className="w-full overflow-x-auto">
            <div className="min-w-[700px]">
              <Table
                rows={rows}
                isLoading={isLoading}
                page={currentPage}
                perPage={perPage}
                columnOrder={columnOrder}
                id={["id"]}
                customActionRender={(row: Data) => {
                  const hiring = rows.find((r) => r.id === row.id);
                  if (!hiring) return null;
                  return (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:bg-muted hover:text-foreground"
                        onClick={() => setViewHiring(hiring)}
                        aria-label="View hiring posting"
                      >
                        <Eye className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:bg-muted hover:text-foreground"
                        onClick={() => handleEditRow(hiring)}
                        aria-label="Edit hiring posting"
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:bg-muted hover:text-foreground"
                        onClick={() => setDeleteId(hiring.id)}
                        aria-label="Delete hiring posting"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </>
                  );
                }}
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

      <HiringFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        hiring={editHiring}
      />

      <HiringViewDialog
        hiring={viewHiring}
        onClose={() => setViewHiring(null)}
      />

      <HiringCsvImportDialog open={importOpen} onOpenChange={setImportOpen} />

      <Modal
        isOpen={Boolean(deleteId)}
        setIsOpen={(open) => {
          if (!open) setDeleteId(null);
        }}
        id={deleteId ?? ""}
        heading="Delete Hiring Posting"
        content="Are you sure you want to delete this hiring posting? This cannot be undone."
        type="error"
        click={async (id) => handleConfirmDelete(String(id))}
      />
    </>
  );
}
