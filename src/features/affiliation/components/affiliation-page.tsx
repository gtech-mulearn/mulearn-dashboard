"use client";

import { Handshake, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { DataTableErrorBoundary } from "@/components/dashboard/DataTableErrorBoundary";
import { Blank } from "@/components/dashboard/table/Blank";
import Pagination from "@/components/dashboard/table/pagination";
import Table from "@/components/dashboard/table/Table";
import TableTop from "@/components/dashboard/table/TableTop";
import THead from "@/components/dashboard/table/Thead";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useAffiliationsList,
  useDeleteAffiliation,
} from "../hooks/use-affiliations";
import type { AffiliationItem } from "../schemas";
import { AffiliationFormDialog } from "./affiliation-form-dialog";

// ─── Column definitions ───────────────────────────────────────────────────────

const COLUMN_ORDER = [
  {
    column: "title",
    Label: "Title",
    isSortable: true,
    width: "min-w-[180px]",
  },
  {
    column: "organization_count",
    Label: "Organizations",
    isSortable: false,
    width: "min-w-[130px]",
  },
  {
    column: "created_by",
    Label: "Created By",
    isSortable: false,
    width: "min-w-[140px] hidden lg:table-cell",
  },
  {
    column: "created_at",
    Label: "Created On",
    isSortable: false,
    width: "min-w-[130px] hidden xl:table-cell",
  },
  {
    column: "updated_by",
    Label: "Updated By",
    isSortable: false,
    width: "min-w-[140px] hidden xl:table-cell",
  },
  {
    column: "updated_at",
    Label: "Updated On",
    isSortable: false,
    width: "min-w-[130px] hidden xl:table-cell",
  },
];

// ─── Page wrapper ─────────────────────────────────────────────────────────────

export default function AffiliationPage() {
  return (
    <DataTableErrorBoundary>
      <AffiliationContent />
    </DataTableErrorBoundary>
  );
}

// ─── Main content ─────────────────────────────────────────────────────────────

function AffiliationContent() {
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("");

  // Dialog state
  const [formOpen, setFormOpen] = useState(false);
  const [editingAffiliation, setEditingAffiliation] =
    useState<AffiliationItem | null>(null);

  // ─── Data ─────────────────────────────────────────────────────────────────
  const { data, isLoading } = useAffiliationsList({
    pageIndex: currentPage,
    perPage,
    search,
    sortBy,
  });

  const rows = (data?.data ?? []) as AffiliationItem[];
  const totalPages = data?.pagination.totalPages ?? 0;
  const totalCount = data?.pagination.count;

  // ─── Mutations ────────────────────────────────────────────────────────────
  const deleteMutation = useDeleteAffiliation();

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const handleSearch = (value: string) => {
    setCurrentPage(1);
    setSearch(value);
  };

  const handlePerPage = (value: number) => {
    setCurrentPage(1);
    setPerPage(value);
  };

  const handleSort = (column: string) => {
    setCurrentPage(1);
    setSortBy((prev) => (prev === column ? `-${column}` : column));
  };

  const handleDeleteRow = async (value: string | undefined) => {
    if (!value) return;
    await deleteMutation.mutateAsync(value);
  };

  const handleEditRow = (id: string | number | boolean) => {
    const affiliation = rows.find((r) => r.id === String(id)) ?? null;
    setEditingAffiliation(affiliation);
    setFormOpen(true);
  };

  const handleCreateOpen = () => {
    setEditingAffiliation(null);
    setFormOpen(true);
  };

  const columnOrder = useMemo(() => COLUMN_ORDER, []);

  return (
    <>
      <Card className="overflow-visible border-0 bg-transparent shadow-none rounded-none">
        <CardHeader className="px-0 py-0 sm:px-0 sm:py-0">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/6 px-3 py-1 text-xs font-semibold text-primary">
                <Handshake className="size-3.5" />
                Management
              </div>
              <CardTitle className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Organization Affiliations
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Manage university and organization affiliations for colleges.
              </p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                size="sm"
                className="rounded-xl gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto"
                onClick={handleCreateOpen}
                aria-label="Create affiliation"
              >
                <Plus className="size-3.5" />
                Add Affiliation
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 bg-transparent p-0 pt-6">
          <TableTop
            onSearchText={handleSearch}
            onPerPageNumber={handlePerPage}
            perPage={perPage}
            perPageOptions={[5, 10, 20, 50, 100]}
            CSV=""
            onCsvDownload={undefined}
            isCsvDownloading={false}
            searchPlaceholder="Search affiliations…"
            searchSize="md"
            searchPosition="right"
            searchWrapperClassName="md:max-w-[680px]"
            searchFieldWrapperClassName="lg:max-w-[380px]"
            searchInputClassName="h-10 text-sm"
          />

          <div className="w-full overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
            <div className="min-w-[600px]">
              <Table
                rows={rows}
                isloading={isLoading}
                page={currentPage}
                perPage={perPage}
                columnOrder={columnOrder}
                id={["id"]}
                onEditClick={handleEditRow}
                onDeleteClick={handleDeleteRow}
                modalDeleteHeading="Delete Affiliation"
                modalDeleteContent="Are you sure you want to delete this affiliation? Organizations linked to it may be affected."
                modalTypeContent="error"
              >
                <THead
                  columnOrder={columnOrder}
                  onIconClick={handleSort}
                  action
                />
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
                <Blank />
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create / Edit affiliation dialog */}
      <AffiliationFormDialog
        open={formOpen}
        onOpenChange={(val) => {
          setFormOpen(val);
          if (!val) setEditingAffiliation(null);
        }}
        affiliation={editingAffiliation}
      />
    </>
  );
}
