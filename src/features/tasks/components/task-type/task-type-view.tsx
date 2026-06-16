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
import { useDebounce } from "@/hooks/use-debounce";
import {
  useCreateTaskType,
  useDeleteTaskType,
  useTaskTypes,
  useUpdateTaskType,
} from "../../hooks";
import { TaskTypeDialog } from "./task-type-dialog";

export default function TaskTypeView() {
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [searchInput, setSearchInput] = useState("");
  const [sort, setSort] = useState("");

  const debouncedSearch = useDebounce(searchInput, 500);

  const { data, isLoading } = useTaskTypes({
    page: currentPage,
    perPage,
    search: debouncedSearch,
    sortBy: sort,
  });

  const { refetch: refetchCsv } = useTaskTypes(
    {
      page: 1,
      perPage: 1000,
      search: debouncedSearch,
      sortBy: sort,
    },
    { enabled: false },
  );

  const createMutation = useCreateTaskType();
  const updateMutation = useUpdateTaskType();
  const deleteMutation = useDeleteTaskType();

  // Dialog state
  const [modalType, setModalType] = useState<
    "create" | "edit" | "delete" | null
  >(null);

  const [editId, setEditId] = useState("");
  const [deleteId, setDeleteId] = useState("");
  const [titleInput, setTitleInput] = useState("");

  // CSV download state
  const [isCsvDownloading, setIsCsvDownloading] = useState(false);

  const columns = [
    { column: "title", Label: "Title", isSortable: true },
    { column: "updated_at", Label: "Updated On", isSortable: true },
    { column: "updated_by", Label: "Updated By", isSortable: true },
    { column: "created_at", Label: "Created On", isSortable: true },
    { column: "created_by", Label: "Created By", isSortable: true },
  ];

  const rows = useMemo(() => {
    if (!data?.data) return [];
    return data.data.map((item) => ({
      id: item.id,
      title: item.title,
      updated_at: item.updated_at,
      updated_by: item.updated_by,
      created_at: item.created_at,
      created_by: item.created_by,
    }));
  }, [data]);

  const totalPages = data?.pagination?.totalPages ?? 0;
  const totalCount = data?.pagination?.count ?? 0;

  const handleSortChange = (column: string) => {
    setCurrentPage(1);
    setSort((prev) => (prev === column ? `-${column}` : column));
  };

  const handleSubmit = () => {
    if (modalType === "create") {
      if (!titleInput.trim()) {
        toast.error("Title is required");
        return;
      }
      createMutation.mutate(
        { title: titleInput.trim() },
        {
          onSuccess: () => {
            toast.success("Task type created successfully");
            setModalType(null);
            setTitleInput("");
          },
        },
      );
    } else if (modalType === "edit") {
      if (!titleInput.trim()) {
        toast.error("Title is required");
        return;
      }
      updateMutation.mutate(
        { id: editId, data: { title: titleInput.trim() } },
        {
          onSuccess: () => {
            toast.success("Task type updated successfully");
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
        toast.success("Task type deleted successfully");
        setModalType(null);
        setDeleteId("");
      },
    });
  };

  const handleCsvDownload = async () => {
    setIsCsvDownloading(true);
    try {
      // Fetch up to 1000 items matching current search and sort
      const { data: allData } = await refetchCsv();
      if (!allData?.data) {
        toast.error("No data available to export");
        return;
      }

      const headers = [
        "Title",
        "Updated On",
        "Updated By",
        "Created On",
        "Created By",
      ];
      const csvRows = [
        headers.join(","),
        ...allData.data.map((item) =>
          [
            `"${item.title.replace(/"/g, '""')}"`,
            `"${item.updated_at}"`,
            `"${item.updated_by.replace(/"/g, '""')}"`,
            `"${item.created_at}"`,
            `"${item.created_by.replace(/"/g, '""')}"`,
          ].join(","),
        ),
      ];

      const csvContent = `data:text/csv;charset=utf-8,${csvRows.join("\n")}`;
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "task_types.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      toast.error("Failed to export CSV");
    } finally {
      setIsCsvDownloading(false);
    }
  };

  const renderActions = (row: Data) => {
    return (
      <div className="flex items-center justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setEditId(String(row.id ?? ""));
            setTitleInput(String(row.title ?? ""));
            setModalType("edit");
          }}
          className="h-8 w-8 p-0"
        >
          <Pencil className="size-4 text-muted-foreground" />
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => {
            setDeleteId(String(row.id ?? ""));
            setModalType("delete");
          }}
          className="h-8 w-8 p-0"
        >
          <Trash2 className="size-4 text-muted-foreground hover:text-destructive" />
        </Button>
      </div>
    );
  };

  return (
    <Card className="border-0 bg-transparent shadow-none rounded-none">
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-0">
        <div>
          <CardTitle className="text-2xl font-bold text-foreground">
            Task Type
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Manage Task Types
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
          Create Task Type
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
          searchPlaceholder="Search task type..."
          searchSize="md"
          searchPosition="right"
          searchWrapperClassName="md:max-w-[680px]"
          searchFieldWrapperClassName="lg:max-w-[380px]"
          searchInputClassName="h-10 text-sm"
        />

        <div className="w-full overflow-x-auto">
          <Table
            rows={rows}
            isloading={isLoading}
            page={currentPage}
            perPage={perPage}
            columnOrder={columns}
            id={["id"]}
            customActionRender={renderActions}
          >
            <THead
              columnOrder={columns}
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

      {/* Create/Edit Modal */}
      <TaskTypeDialog
        isOpen={modalType === "create" || modalType === "edit"}
        onClose={() => setModalType(null)}
        title={modalType === "create" ? "Create Task Type" : "Edit Task Type"}
        description={
          modalType === "create"
            ? "Create a new task type for organizing your tasks."
            : "Update the details of the selected task type."
        }
        type="form"
        inputValue={titleInput}
        onInputChange={setTitleInput}
        onSubmit={handleSubmit}
        isPending={createMutation.isPending || updateMutation.isPending}
        actionText={modalType === "create" ? "Create" : "Save"}
      />

      {/* Delete Confirmation Modal */}
      <TaskTypeDialog
        isOpen={modalType === "delete"}
        onClose={() => setModalType(null)}
        title="Delete Task Type"
        description="Are you sure you want to delete this task type? This action cannot be undone."
        type="confirm"
        onSubmit={handleDeleteConfirm}
        isPending={deleteMutation.isPending}
        variant="destructive"
        actionText="Delete"
      />
    </Card>
  );
}
