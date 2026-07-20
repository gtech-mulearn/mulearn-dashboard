"use client";

import { useState } from "react";
import { endpoints } from "@/api/endpoints";
import { Blank } from "@/components/dashboard/table/Blank";
import Pagination from "@/components/dashboard/table/pagination";
import Table from "@/components/dashboard/table/Table";
import TableTop from "@/components/dashboard/table/TableTop";
import THead from "@/components/dashboard/table/Thead";
import { Badge } from "@/components/ui/badge";
import {
  useRoleVerificationCsvDownload,
  useRoleVerifications,
} from "../hooks/use-role-verification";
import type { RoleVerificationItem } from "../schemas";
import { RoleVerificationActions } from "./role-verification-actions";

const COLUMN_ORDER = [
  { column: "full_name", Label: "Full Name", isSortable: true },
  { column: "muid", Label: "MuID", isSortable: true },
  { column: "discord_id", Label: "Discord ID", isSortable: false },
  { column: "email", Label: "Email", isSortable: true },
  { column: "mobile", Label: "Mobile", isSortable: true },
  { column: "role_title", Label: "Role", isSortable: true },
  { column: "verified", Label: "Status", isSortable: false },
];

export function RoleVerificationTable() {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("");

  const { data, isLoading } = useRoleVerifications({
    pageIndex: page,
    perPage: perPage,
    search: search.trim(),
    sortBy: sort,
  });

  const rows = data?.data || [];
  const pagination = data?.pagination;

  // Transform rows to match the Table Data type
  // biome-ignore lint/suspicious/noExplicitAny: tableRows must satisfy Data[] (Record<string, primitive>) which RoleVerificationItem is structurally compatible with after the spread
  const tableRows: any[] = rows.map((row: RoleVerificationItem) => ({
    ...row,
    discord_id: row.discord_id || "N/A",
    mobile: row.mobile || "N/A",
  }));

  const handleSort = (column: string) => {
    if (sort === column) {
      setSort(`-${column}`);
    } else if (sort === `-${column}`) {
      setSort("");
    } else {
      setSort(column);
    }
  };

  const { downloadCsv, isDownloading: isCsvDownloading } =
    useRoleVerificationCsvDownload();

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
        CSV={endpoints.admin.roleVerification.csv}
        onCsvDownload={downloadCsv}
        isCsvDownloading={isCsvDownloading}
        perPage={perPage}
        perPageOptions={[10, 25, 50, 100]}
        searchPlaceholder="Search Name, Email, MuID, Role..."
        searchSize="sm"
        searchPosition="right"
      />

      <Table
        rows={tableRows}
        isLoading={isLoading}
        page={page}
        perPage={perPage}
        columnOrder={COLUMN_ORDER}
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
          columnOrder={COLUMN_ORDER}
          onIconClick={handleSort}
          action={true} // Fixed: Render the Action header in Desktop view
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
