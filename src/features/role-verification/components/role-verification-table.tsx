"use client";

import { useState } from "react";
import { endpoints } from "@/api/endpoints";
import { Blank } from "@/components/dashboard/table/Blank";
import Pagination from "@/components/dashboard/table/pagination";
import { nextSortState } from "@/components/dashboard/table/sort-cycle";
import Table from "@/components/dashboard/table/Table";
import TableTop from "@/components/dashboard/table/TableTop";
import THead from "@/components/dashboard/table/Thead";
import { Badge } from "@/components/ui/badge";
import { formatShortDate } from "@/lib/datetime";
import {
  useRoleVerificationCsvDownload,
  useRoleVerifications,
} from "../hooks/use-role-verification";
import { keepRequestsForRole } from "../lib/role-rows";
import type { RoleVerificationItem } from "../schemas";
import { RoleVerificationActions } from "./role-verification-actions";

// Sortable keys must exist in UserVerificationAPI's sort_fields
// (mulearnbackend/api/dashboard/user/dash_user_views.py) — pinned by
// features/role-verification/lib/sort-contract.test.ts.
export const ROLE_REQUEST_COLUMNS = [
  { column: "full_name", Label: "Full Name", isSortable: true },
  { column: "muid", Label: "MuID", isSortable: true },
  { column: "email", Label: "Email", isSortable: true },
  { column: "mobile", Label: "Mobile", isSortable: true },
  { column: "created_at", Label: "Requested", isSortable: true },
  { column: "verified", Label: "Status", isSortable: false },
];

interface RoleVerificationTableProps {
  /**
   * Role.title to list, e.g. "Enabler". Not named `role`: Biome's
   * useValidAriaRole reads a JSX `role` prop as the ARIA attribute.
   */
  roleTitle: string;
}

export function RoleVerificationTable({
  roleTitle,
}: RoleVerificationTableProps) {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("");

  const { data, isLoading } = useRoleVerifications({
    pageIndex: page,
    perPage: perPage,
    search: search.trim(),
    sortBy: sort,
    role: roleTitle,
  });

  const rows = keepRequestsForRole(data?.data || [], roleTitle);
  const pagination = data?.pagination;

  // biome-ignore lint/suspicious/noExplicitAny: tableRows must satisfy Data[] (Record<string, primitive>) which RoleVerificationItem is structurally compatible with after the spread
  const tableRows: any[] = rows.map((row: RoleVerificationItem) => ({
    ...row,
    discord_id: row.discord_id || "N/A",
    mobile: row.mobile || "N/A",
    created_at: formatShortDate(row.created_at),
  }));

  const handleSort = (column: string) => {
    setPage(1);
    setSort((prev) => nextSortState(prev, column));
  };

  const csvPath = `${endpoints.admin.roleVerification.csv}?${new URLSearchParams({ role: roleTitle })}`;
  const { downloadCsv, isDownloading: isCsvDownloading } =
    useRoleVerificationCsvDownload(csvPath);

  return (
    <div className="space-y-4">
      <TableTop
        onSearchText={(text) => {
          setSearch(text);
          setPage(1);
        }}
        onPerPageNumber={(n) => {
          setPerPage(n);
          setPage(1);
        }}
        CSV={csvPath}
        onCsvDownload={downloadCsv}
        isCsvDownloading={isCsvDownloading}
        perPage={perPage}
        perPageOptions={[10, 25, 50, 100]}
        searchPlaceholder="Search name, email, MuID or mobile…"
        searchSize="sm"
        searchPosition="right"
      />

      <Table
        rows={tableRows}
        isLoading={isLoading}
        page={page}
        perPage={perPage}
        columnOrder={ROLE_REQUEST_COLUMNS}
        id={["id"]}
        customActionRender={(row) => (
          <RoleVerificationActions item={row as RoleVerificationItem} />
        )}
        customCellRender={(column, row) => {
          const rowData = row as RoleVerificationItem;
          if (column === "verified") {
            return rowData.verified ? (
              <Badge variant="success" className="cursor-default">
                Verified
              </Badge>
            ) : (
              <Badge variant="warning" className="cursor-default">
                Pending
              </Badge>
            );
          }
          return null;
        }}
      >
        <THead
          columnOrder={ROLE_REQUEST_COLUMNS}
          onIconClick={handleSort}
          action={true}
        />

        <div>
          {!isLoading && pagination && (
            <Pagination
              currentPage={page}
              totalPages={pagination.totalPages}
              handleNextClick={() =>
                setPage((p) => Math.min(p + 1, pagination.totalPages))
              }
              handlePreviousClick={() => setPage((p) => Math.max(p - 1, 1))}
              perPage={perPage}
              totalCount={pagination.count}
            />
          )}
        </div>

        <Blank />
      </Table>
    </div>
  );
}
