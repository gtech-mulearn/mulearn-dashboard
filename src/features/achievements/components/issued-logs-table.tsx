"use client";

import { format } from "date-fns";
import * as React from "react";
import { Blank } from "@/components/dashboard/table/Blank";
import Pagination from "@/components/dashboard/table/pagination";
import Table, { type Data } from "@/components/dashboard/table/Table";
import TableTop from "@/components/dashboard/table/TableTop";
import THead from "@/components/dashboard/table/Thead";
import { useDebounce } from "@/hooks/use-debounce";
import { ISSUED_LOGS_PAGE_SIZE } from "../constants/constants";
import { useIssuedLogs } from "../hooks/use-achievement-logs";
import { BulkIssueDialog } from "./bulk-issue-dialog";

const COLUMN_ORDER = [
  { column: "muid", Label: "MUID", isSortable: false },
  { column: "user_name", Label: "User", isSortable: false },
  { column: "achievement", Label: "Achievement", isSortable: false },
  { column: "issued_by", Label: "Issued By", isSortable: false },
  { column: "issued_on", Label: "Issued On", isSortable: false },
];

export function IssuedLogsTable() {
  const [page, setPage] = React.useState(1);
  const [perPage, setPerPage] = React.useState(ISSUED_LOGS_PAGE_SIZE);
  const [search, setSearch] = React.useState("");
  const debouncedSearch = useDebounce(search, 400);

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally reset page when search changes
  React.useEffect(() => {
    setPage(1);
  }, [search]);

  const { data, isLoading } = useIssuedLogs(page, perPage, debouncedSearch);

  const rows = (data?.data ?? []) as unknown as Data[];
  const totalPages = data?.pagination.totalPages ?? 1;
  const total = data?.pagination.total ?? 0;

  const customCellRender = (column: string, row: Data) => {
    if (column === "muid") {
      return (
        <span className="font-mono text-xs">{String(row.muid ?? "")}</span>
      );
    }
    if (column === "user_name") {
      return <span className="font-medium">{String(row.user_name ?? "")}</span>;
    }
    if (column === "issued_by") {
      return (
        <span className="text-sm text-muted-foreground">
          {String(row.issued_by ?? "")}
        </span>
      );
    }
    if (column === "issued_on") {
      const val = row.issued_on;
      if (!val) return <span className="text-sm text-muted-foreground">—</span>;
      try {
        return (
          <span className="text-sm text-muted-foreground">
            {format(new Date(String(val)), "dd MMM yyyy, HH:mm")}
          </span>
        );
      } catch {
        return <span className="text-sm text-muted-foreground">—</span>;
      }
    }
    return null;
  };

  return (
    <div className="space-y-4" data-testid="issued-logs-table">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Issued Logs</h2>
          <p className="text-sm text-muted-foreground">
            Full history of issued achievements.
          </p>
        </div>
        <BulkIssueDialog />
      </div>

      <TableTop
        onSearchText={(val) => setSearch(val)}
        onPerPageNumber={(val) => {
          setPerPage(val);
          setPage(1);
        }}
        CSV=""
        perPage={perPage}
        perPageOptions={[10, 20, 50]}
        searchPlaceholder="Search by MUID or user..."
        searchSize="md"
        searchPosition="left"
      />

      <Table
        rows={rows}
        isLoading={isLoading}
        page={page}
        perPage={perPage}
        columnOrder={COLUMN_ORDER}
        id={[]}
        customCellRender={customCellRender}
      >
        <THead
          columnOrder={COLUMN_ORDER}
          onIconClick={() => {}}
          action={false}
        />
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          perPage={perPage}
          totalCount={total}
          handlePreviousClick={() => setPage((p) => Math.max(1, p - 1))}
          handleNextClick={() => setPage((p) => p + 1)}
        />
        <Blank />
      </Table>
    </div>
  );
}
