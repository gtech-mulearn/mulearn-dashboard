"use client";

import { Pencil, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Blank } from "@/components/dashboard/table/Blank";
import Pagination from "@/components/dashboard/table/pagination";
import Table, { type Data } from "@/components/dashboard/table/Table";
import TableTop from "@/components/dashboard/table/TableTop";
import THead from "@/components/dashboard/table/Thead";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useCreateDepartment,
  useDeleteDepartment,
  useDepartments,
  useUpdateDepartment,
} from "../../hooks/use-departments";
import { DepartmentDialog } from "./department-dialog";

const COLUMNS = [{ column: "title", Label: "Name", isSortable: true }];

export default function DepartmentsView() {
  // ─── Pagination / filter state ──────────────────────────────────────────────
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [searchInput, setSearchInput] = useState("");
  const [sort, setSort] = useState("");

  // ─── Data ───────────────────────────────────────────────────────────────────
  const { data, isLoading, isFetching } = useDepartments({
    page: currentPage,
    perPage,
    search: searchInput,
    sortBy: sort,
  });

  // CSV fetch (lazy)
  const { refetch: refetchCsv } = useDepartments(
    { page: 1, perPage: 1000, search: searchInput, sortBy: sort },
    { enabled: false },
  );

  // ─── Mutations ──────────────────────────────────────────────────────────────
  const createMutation = useCreateDepartment();
  const updateMutation = useUpdateDepartment();
  const deleteMutation = useDeleteDepartment();

  // ─── Dialog state ────────────────────────────────────────────────────────────
  const [modalType, setModalType] = useState<
    "create" | "edit" | "delete" | null
  >(null);
  const [editId, setEditId] = useState("");
  const [deleteId, setDeleteId] = useState("");
  const [titleInput, setTitleInput] = useState("");

  // ─── CSV ─────────────────────────────────────────────────────────────────────
  const [isCsvDownloading, setIsCsvDownloading] = useState(false);

  // ─── Table rows ──────────────────────────────────────────────────────────────
  const rows = useMemo(() => {
    if (!data?.data) return [];
    return data.data.map((item, idx) => ({
      id: item.id,
      slno: (currentPage - 1) * perPage + idx + 1,
      title: item.title,
    }));
  }, [data, currentPage, perPage]);

  const totalPages = data?.pagination?.totalPages ?? 0;
  const totalCount = data?.pagination?.count ?? 0;

  // ─── Handlers ────────────────────────────────────────────────────────────────
  const handleSortChange = (column: string) => {
    setCurrentPage(1);
    setSort((prev) => (prev === column ? `-${column}` : column));
  };

  const handleSubmit = () => {
    if (!titleInput.trim()) {
      toast.error("Department name is required");
      return;
    }

    if (modalType === "create") {
      createMutation.mutate(
        { title: titleInput.trim() },
        {
          onSuccess: () => {
            toast.success("Department created successfully");
            setModalType(null);
            setTitleInput("");
          },
        },
      );
    } else if (modalType === "edit") {
      updateMutation.mutate(
        { id: editId, data: { title: titleInput.trim() } },
        {
          onSuccess: () => {
            toast.success("Department updated successfully");
            setModalType(null);
            setTitleInput("");
            setEditId("");
          },
        },
      );
    }
  };

  const handleDeleteConfirm = () => {
    deleteMutation.mutate(deleteId, {
      onSuccess: () => {
        toast.success("Department deleted successfully");
        setModalType(null);
        setDeleteId("");
      },
    });
  };

  const handleCsvDownload = async () => {
    setIsCsvDownloading(true);
    try {
      const { data: allData } = await refetchCsv();
      if (!allData?.data?.length) {
        toast.error("No data available to export");
        return;
      }
      const headers = ["Sl.no", "Name"];
      const csvRows = [
        headers.join(","),
        ...allData.data.map((item, idx) =>
          [`${idx + 1}`, `"${item.title.replace(/"/g, '""')}"`].join(","),
        ),
      ];
      const csvContent = `data:text/csv;charset=utf-8,${csvRows.join("\n")}`;
      const link = document.createElement("a");
      link.setAttribute("href", encodeURI(csvContent));
      link.setAttribute("download", "departments.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      toast.error("Failed to export CSV");
    } finally {
      setIsCsvDownloading(false);
    }
  };

  const renderActions = (row: Data) => (
    <div className="flex items-center justify-end gap-2">
      <Button
        variant="outline"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => {
          setEditId(String(row.id ?? ""));
          setTitleInput(String(row.title ?? ""));
          setModalType("edit");
        }}
      >
        <Pencil className="size-4 text-muted-foreground" />
      </Button>
      <Button
        variant="destructive"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => {
          setDeleteId(String(row.id ?? ""));
          setModalType("delete");
        }}
      >
        <Trash2 className="size-4" />
      </Button>
    </div>
  );

  return (
    <Card className="border-0 bg-transparent shadow-none rounded-none">
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-0">
        <div>
          <CardTitle className="text-2xl font-bold text-foreground">
            Departments
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Manage academic departments linked to organizations
          </p>
        </div>
        <Button
          onClick={() => {
            setTitleInput("");
            setModalType("create");
          }}
          className="w-full sm:w-auto"
        >
          <Plus className="mr-2 size-4" />
          Create
        </Button>
      </CardHeader>

      <CardContent className="space-y-6 px-0">
        <TableTop
          onSearchText={(val) => {
            setCurrentPage(1);
            setSearchInput(val);
          }}
          onPerPageNumber={(val) => {
            setCurrentPage(1);
            setPerPage(val);
          }}
          perPage={perPage}
          perPageOptions={[10, 20, 50]}
          CSV="true"
          onCsvDownload={handleCsvDownload}
          isCsvDownloading={isCsvDownloading}
          searchPlaceholder="Search departments…"
          searchSize="md"
          searchPosition="right"
          searchWrapperClassName="md:max-w-[680px]"
          searchFieldWrapperClassName="lg:max-w-[380px]"
          searchInputClassName="h-10 text-sm"
        />

        <div className="w-full overflow-x-auto">
          <Table
            rows={rows}
            isLoading={isLoading || isFetching}
            page={currentPage}
            perPage={perPage}
            columnOrder={COLUMNS}
            id={["id"]}
            customActionRender={renderActions}
          >
            <THead
              columnOrder={COLUMNS}
              onIconClick={handleSortChange}
              action={true}
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
      </CardContent>

      {/* Create / Edit dialog */}
      <DepartmentDialog
        isOpen={modalType === "create" || modalType === "edit"}
        onClose={() => setModalType(null)}
        title={
          modalType === "create" ? "Create a new department" : "Edit department"
        }
        description={
          modalType === "create"
            ? "Create a new department name"
            : "Update the department name"
        }
        type="form"
        inputValue={titleInput}
        onInputChange={setTitleInput}
        onSubmit={handleSubmit}
        isPending={createMutation.isPending || updateMutation.isPending}
        actionText={modalType === "create" ? "Submit" : "Save"}
      />

      {/* Delete confirmation dialog */}
      <DepartmentDialog
        isOpen={modalType === "delete"}
        onClose={() => setModalType(null)}
        title="Delete Department"
        description="Are you sure you want to delete this department? This may affect users linked to this department."
        type="confirm"
        onSubmit={handleDeleteConfirm}
        isPending={deleteMutation.isPending}
        variant="destructive"
        actionText="Delete"
      />
    </Card>
  );
}
