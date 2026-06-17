"use client";

import { format } from "date-fns";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { Blank } from "@/components/dashboard/table/Blank";
import Modal from "@/components/dashboard/table/Modal";
import Pagination from "@/components/dashboard/table/pagination";
import Table from "@/components/dashboard/table/Table";
import TableTop from "@/components/dashboard/table/TableTop";
import THead from "@/components/dashboard/table/Thead";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/use-debounce";
import { useDeleteIGRequest, useIGRequestsList } from "../hooks";
import { IGRequestFormDialog } from "./ig-request-form-dialog";
import { IGRequestStatusBadge } from "./ig-request-status-badge";

const columnOrder = [
  { column: "name", Label: "Name", isSortable: true },
  { column: "code", Label: "Code", isSortable: false },
  { column: "category", Label: "Category", isSortable: false },
  { column: "status", Label: "Status", isSortable: true },
  { column: "created_at", Label: "Created", isSortable: true },
  { column: "created_by", Label: "Requested By", isSortable: false },
];

const STATUS_TABS = [
  { label: "All", value: "" },
  { label: "Requested", value: "requested" },
  { label: "Active", value: "active" },
  { label: "Rejected", value: "rejected" },
  { label: "Cancelled", value: "cancelled" },
];

export function IGRequestsPage() {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [status, setStatus] = useState("");
  const [sortBy, setSortBy] = useState("");

  const { data, isLoading } = useIGRequestsList({
    page,
    perPage,
    search: debouncedSearch,
    status,
    sortBy,
  });

  const { mutate: cancelRequest } = useDeleteIGRequest();
  const [cancelId, setCancelId] = useState<string | null>(null);

  const rows = (data?.response?.data as any[]) || [];
  const hasAction = rows.some((row) => row.status === "requested");

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortBy(`-${column}`);
    } else if (sortBy === `-${column}`) {
      setSortBy("");
    } else {
      setSortBy(column);
    }
  };

  const handleNext = () => setPage((p) => p + 1);
  const handlePrevious = () => setPage((p) => Math.max(1, p - 1));

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Interest Group Requests
          </h1>
          <p className="text-muted-foreground mt-1">
            Propose and track new interest groups for your organization.
          </p>
        </div>
        <IGRequestFormDialog />
      </div>

      <div className="flex gap-2 mb-2">
        {STATUS_TABS.map((tab) => (
          <Button
            key={tab.label}
            variant={status === tab.value ? "default" : "outline"}
            onClick={() => {
              setStatus(tab.value);
              setPage(1);
            }}
            size="sm"
          >
            {tab.label}
          </Button>
        ))}
      </div>

      <TableTop
        onSearchText={setSearch}
        onPerPageNumber={setPerPage}
        CSV={""}
        perPage={perPage}
        perPageOptions={[10, 20, 50, 100]}
        searchPlaceholder="Search requests..."
        searchSize="md"
        searchPosition="left"
      />

      <div className="rounded-md bg-background">
        <Table
          isloading={isLoading}
          rows={rows}
          page={page}
          perPage={perPage}
          columnOrder={columnOrder}
          customCellRender={(column, row) => {
            if (column === "status") {
              return <IGRequestStatusBadge status={row.status as any} />;
            }
            if (column === "created_at") {
              return (
                <span className="text-muted-foreground whitespace-nowrap">
                  {format(new Date(String(row.created_at)), "MMM d, yyyy")}
                </span>
              );
            }
            if (column === "category") {
              return <span className="capitalize">{String(row.category)}</span>;
            }
            if (column === "created_by") {
              return (
                <span>{row.created_by ? String(row.created_by) : "-"}</span>
              );
            }
            return null;
          }}
          id={hasAction ? ["id"] : undefined}
          customActionRender={(row) => {
            if (row.status === "requested") {
              return (
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:bg-muted hover:text-foreground"
                  onClick={() => setCancelId(String(row.id))}
                  title="Cancel Request"
                >
                  <Trash2 className="size-4" />
                </Button>
              );
            }
            return <div className="w-8" />;
          }}
        >
          <THead
            columnOrder={columnOrder}
            onIconClick={handleSort}
            action={hasAction}
          />
          {data?.response?.pagination ? (
            <Pagination
              totalPages={data.response.pagination.totalPages}
              totalCount={data.response.pagination.count}
              currentPage={page}
              perPage={perPage}
              handleNextClick={handleNext}
              handlePreviousClick={handlePrevious}
            />
          ) : (
            <div />
          )}
        </Table>
      </div>

      <Modal
        isOpen={Boolean(cancelId)}
        setIsOpen={(value) => {
          if (!value) setCancelId(null);
        }}
        id={cancelId ?? ""}
        heading="Cancel IG Request"
        content="Are you sure you want to cancel this Interest Group request? This action cannot be undone."
        type="error"
        click={async (id) => {
          cancelRequest(String(id), {
            onSuccess: () => setCancelId(null),
          });
        }}
      />
    </div>
  );
}
