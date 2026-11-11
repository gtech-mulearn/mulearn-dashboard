"use client";

import { CheckCircle, Eye, XCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Pagination from "@/components/dashboard/table/pagination";
import { RowActionButton } from "@/components/dashboard/table/row-action-button";
import { nextSortState } from "@/components/dashboard/table/sort-cycle";
import Table, { type Data } from "@/components/dashboard/table/Table";
import TableTop from "@/components/dashboard/table/TableTop";
import THead from "@/components/dashboard/table/Thead";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatShortDate } from "@/lib/datetime";
import { useUnverifiedOrgs } from "../../hooks/use-verification";
import {
  OrgTypeSchema,
  type UnverifiedOrgItem,
} from "../../schemas/verification.schema";
import { OrgRequestSheet } from "./org-request-sheet";
import {
  type OrgRequestDialogMode,
  VerifyActionDialog,
} from "./verify-action-dialog";

// Sortable keys must exist in UnverifiedOrganizationsListAPI's sort_fields
// (mulearnbackend/api/dashboard/organisation/organisation_views.py) — pinned
// by features/role-verification/lib/sort-contract.test.ts.
export const ORG_REQUEST_COLUMNS = [
  { column: "title", Label: "Title", isSortable: true },
  { column: "org_type", Label: "Type", isSortable: false },
  { column: "department", Label: "Department", isSortable: true },
  { column: "graduation_year", Label: "Grad. Year", isSortable: false },
  { column: "created_by", Label: "Submitted By", isSortable: true },
  { column: "created_at", Label: "Submitted", isSortable: true },
];

const DEFAULT_PER_PAGE = 10;

type OrgType = (typeof OrgTypeSchema.options)[number];

export default function VerifyOrgsView() {
  const [searchInput, setSearchInput] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [sortBy, setSortBy] = useState("");
  const [orgType, setOrgType] = useState<OrgType>("College");
  const [viewing, setViewing] = useState<UnverifiedOrgItem | null>(null);
  const [dialog, setDialog] = useState<{
    org: UnverifiedOrgItem;
    mode: OrgRequestDialogMode;
  } | null>(null);

  const { data, isLoading } = useUnverifiedOrgs({
    pageIndex: currentPage,
    perPage,
    search: searchInput,
    sortBy,
    org_type: orgType,
  });

  const orgs = data?.data ?? [];
  const totalPages = data?.pagination?.totalPages ?? 0;
  const totalCount = data?.pagination?.count ?? 0;

  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

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
    setSortBy((prev) => nextSortState(prev, column));
  };

  const handleOrgType = (value: OrgType) => {
    setCurrentPage(1);
    setOrgType(value);
  };

  const rows = useMemo(
    () =>
      orgs.map((item) => ({
        id: item.id,
        title: item.title,
        org_type: item.org_type,
        department: item.department ?? "—",
        graduation_year: item.graduation_year ?? "—",
        created_by: item.created_by,
        created_at: formatShortDate(item.created_at),
        _raw: item,
      })),
    [orgs],
  );

  const renderActions = (row: Data) => {
    const org = row._raw as unknown as UnverifiedOrgItem;
    return (
      <>
        <RowActionButton
          icon={Eye}
          label="View"
          onClick={() => setViewing(org)}
        />
        <RowActionButton
          icon={CheckCircle}
          label="Approve"
          tone="success"
          onClick={() => setDialog({ org, mode: "approve" })}
        />
        <RowActionButton
          icon={XCircle}
          label="Reject"
          tone="destructive"
          onClick={() => setDialog({ org, mode: "reject" })}
        />
      </>
    );
  };

  const renderCell = (column: string, row: Data) => {
    if (column === "org_type") {
      const val = row[column];
      return <Badge variant="outline">{val ? String(val) : "—"}</Badge>;
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Select
          value={orgType}
          onValueChange={(value) => handleOrgType(value as OrgType)}
        >
          <SelectTrigger
            className="w-full sm:w-[180px]"
            aria-label="Organization type"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent position="popper">
            {OrgTypeSchema.options.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Badge
          variant="outline"
          className="text-sm px-3 py-1 self-start sm:self-auto"
        >
          {totalCount} pending
        </Badge>
      </div>

      <TableTop
        onSearchText={handleSearch}
        onPerPageNumber={handlePerPage}
        perPage={perPage}
        perPageOptions={[10, 25, 50]}
        CSV=""
        searchPlaceholder="Search by title, department, or submitter…"
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
          columnOrder={ORG_REQUEST_COLUMNS}
          id={["id"]}
          customActionRender={renderActions}
          customCellRender={renderCell}
        >
          <THead
            columnOrder={ORG_REQUEST_COLUMNS}
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

      <OrgRequestSheet
        org={viewing}
        open={viewing !== null}
        onOpenChange={(open) => !open && setViewing(null)}
        onApprove={(org) => setDialog({ org, mode: "approve" })}
        onReject={(org) => setDialog({ org, mode: "reject" })}
      />

      <VerifyActionDialog
        isOpen={dialog !== null}
        onClose={() => setDialog(null)}
        org={dialog?.org ?? null}
        mode={dialog?.mode ?? "approve"}
      />
    </div>
  );
}
