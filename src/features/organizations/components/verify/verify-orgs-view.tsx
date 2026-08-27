"use client";

import { useEffect, useMemo, useState } from "react";
import Pagination from "@/components/dashboard/table/pagination";
import Table, { type Data } from "@/components/dashboard/table/Table";
import TableTop from "@/components/dashboard/table/TableTop";
import THead from "@/components/dashboard/table/Thead";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUnverifiedOrgs } from "../../hooks/use-verification";
import type { UnverifiedOrgItem } from "../../schemas/verification.schema";
import { VerifyActionDialog } from "./verify-action-dialog";

const COLUMNS = [
  { column: "title", Label: "Title", isSortable: true },
  { column: "org_type", Label: "Type", isSortable: false },
  { column: "department", Label: "Department", isSortable: true },
  { column: "graduation_year", Label: "Grad. Year", isSortable: false },
  { column: "created_by", Label: "Created By", isSortable: true },
  { column: "created_at", Label: "Created At", isSortable: true },
];

const DEFAULT_PER_PAGE = 10;

export default function VerifyOrgsView() {
  const [searchInput, setSearchInput] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [sortBy, setSortBy] = useState("");

  const { data, isLoading } = useUnverifiedOrgs({
    pageIndex: currentPage,
    perPage,
    search: searchInput,
    sortBy,
  });

  const orgs = data?.data ?? [];
  const totalPages = data?.pagination.totalPages ?? 0;
  const totalCount = data?.pagination.count ?? 0;

  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const [selectedOrg, setSelectedOrg] = useState<UnverifiedOrgItem | null>(
    null,
  );
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleSearch = (value: string) => {
    setCurrentPage(1);
    setSearchInput(value);
  };

  const handlePerPage = (value: number) => {
    setCurrentPage(1);
    setPerPage(value);
  };

  const handleSort = (column: string) => {
    setCurrentPage(1);
    setSortBy((prev) => (prev === column ? `-${column}` : column));
  };

  const rows = useMemo(
    () =>
      orgs.map((item, idx) => ({
        id: item.id,
        slno: idx + 1,
        title: item.title,
        org_type: item.org_type,
        department: item.department ?? "—",
        graduation_year: item.graduation_year ?? "—",
        created_by: item.created_by,
        created_at: new Date(item.created_at).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
        _raw: item,
      })),
    [orgs],
  );

  const renderActions = (row: Data) => (
    <Button
      onClick={() => {
        setSelectedOrg(row._raw as unknown as UnverifiedOrgItem);
        setDialogOpen(true);
      }}
    >
      Review
    </Button>
  );

  const renderCell = (column: string, row: Data) => {
    if (column === "org_type") {
      const val = row[column];
      return <Badge variant="outline">{val ? String(val) : "—"}</Badge>;
    }
    return null; // let Table render default
  };

  return (
    <Card className="border-0 bg-transparent shadow-none rounded-none">
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-0">
        <div>
          <CardTitle className="text-2xl font-bold text-foreground">
            Organization Verification
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Review and approve or reject unverified organization submissions
          </p>
        </div>
        <Badge
          variant="outline"
          className="text-sm px-3 py-1 self-start sm:self-auto"
        >
          {totalCount} pending
        </Badge>
      </CardHeader>

      <CardContent className="space-y-6 px-0">
        <TableTop
          onSearchText={handleSearch}
          onPerPageNumber={handlePerPage}
          perPage={perPage}
          perPageOptions={[10, 25, 50]}
          CSV=""
          searchPlaceholder="Search by name, type, or submitter…"
          searchSize="md"
          searchPosition="right"
          searchWrapperClassName="md:max-w-[680px]"
          searchFieldWrapperClassName="lg:max-w-[380px]"
          searchInputClassName="h-10 text-sm"
        />

        <div className="w-full overflow-x-auto">
          <Table
            rows={rows as unknown as Data[]}
            isLoading={isLoading}
            page={currentPage}
            perPage={perPage}
            columnOrder={COLUMNS}
            id={["id"]}
            customActionRender={renderActions}
            customCellRender={renderCell}
          >
            <THead
              columnOrder={COLUMNS}
              onIconClick={handleSort}
              action={true}
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
      </CardContent>

      <VerifyActionDialog
        isOpen={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setSelectedOrg(null);
        }}
        org={selectedOrg}
      />
    </Card>
  );
}
