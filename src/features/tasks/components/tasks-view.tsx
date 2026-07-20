"use client";

import { Pencil, Plus, Trash2, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Blank } from "@/components/dashboard/table/Blank";
import Pagination from "@/components/dashboard/table/pagination";
import Table, { type Data } from "@/components/dashboard/table/Table";
import TableTop from "@/components/dashboard/table/TableTop";
import THead from "@/components/dashboard/table/Thead";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { StateDisplay } from "@/components/ui/state-display";
import { useDebounce } from "@/hooks/use-debounce";
import { useDeleteTask, useDownloadTasksCsv, useTasks } from "../hooks";
import type { Task } from "../schemas/tasks.schema";
import { TaskFormDialog } from "./task-form-dialog";

export default function TasksView() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [searchInput, setSearchInput] = useState("");
  const [sort, setSort] = useState("");

  const debouncedSearch = useDebounce(searchInput, 500);

  const { data, isLoading } = useTasks({
    pageIndex: currentPage,
    perPage,
    search: debouncedSearch,
    sortBy: sort,
  });

  const deleteMutation = useDeleteTask();
  const downloadCsvMutation = useDownloadTasksCsv();

  // Modal / Confirm Dialog state
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);

  const columns = [
    { column: "title", Label: "Title", isSortable: true, width: "w-48" },
    { column: "hashtag", Label: "Hashtag", isSortable: true, width: "w-32" },
    { column: "org", Label: "Organization", isSortable: true, width: "w-40" },
    { column: "active", Label: "Active", isSortable: true, width: "w-28" },
    { column: "karma", Label: "Karma", isSortable: true, width: "w-24" },
    {
      column: "usage_count",
      Label: "Usage Count",
      isSortable: true,
      width: "w-28",
    },
    {
      column: "variable_karma",
      Label: "Variable Karma",
      isSortable: true,
      width: "w-32",
    },
    { column: "ig", Label: "Interest Group", isSortable: true, width: "w-40" },
    { column: "level", Label: "Level", isSortable: true, width: "w-32" },
    { column: "channel", Label: "Channel", isSortable: true, width: "w-40" },
    { column: "event", Label: "Event", isSortable: true, width: "w-40" },
    {
      column: "bonus_time",
      Label: "Bonus time",
      isSortable: true,
      width: "w-40",
    },
    {
      column: "bonus_karma",
      Label: "Bonus karma",
      isSortable: true,
      width: "w-28",
    },
    {
      column: "updated_by",
      Label: "Updated By",
      isSortable: true,
      width: "w-36",
    },
    {
      column: "updated_at",
      Label: "Updated On",
      isSortable: true,
      width: "w-36",
    },
    {
      column: "created_by",
      Label: "Created By",
      isSortable: true,
      width: "w-36",
    },
    {
      column: "created_at",
      Label: "Created On",
      isSortable: true,
      width: "w-36",
    },
  ];

  const rows = useMemo(() => {
    if (!data?.data) return [];
    return data.data.map((item: Task) => ({
      id: String(item.id),
      title: item.title,
      hashtag: item.hashtag,
      org: item.org || "—",
      active: item.active,
      karma: item.karma,
      usage_count: item.usage_count,
      variable_karma: item.variable_karma,
      ig: item.ig || "—",
      level: item.level || "—",
      channel: item.channel || "—",
      event: item.event || "—",
      bonus_time: item.bonus_time || "—",
      bonus_karma: item.bonus_karma,
      updated_by: item.updated_by || "—",
      updated_at: item.updated_at || "—",
      created_by: item.created_by || "—",
      created_at: item.created_at || "—",
    }));
  }, [data]);

  const totalPages = data?.pagination?.totalPages ?? 0;
  const totalCount = data?.pagination?.count ?? 0;

  const handleSortChange = (column: string) => {
    setCurrentPage(1);
    setSort((prev) => (prev === column ? `-${column}` : column));
  };

  const handleDeleteConfirm = () => {
    if (!deleteId) return;
    deleteMutation.mutate(deleteId, {
      onSuccess: () => {
        toast.success("Task deleted successfully");
        setDeleteId(null);
      },
    });
  };

  const handleCsvDownload = async () => {
    try {
      const blob = await downloadCsvMutation.mutateAsync();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "tasks.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Downloaded tasks CSV");
    } catch {
      // Error toast is handled by useDownloadTasksCsv.
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
            Tasks
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Manage task configuration
          </p>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            onClick={() => {
              router.push("/dashboard/management/tasks/bulk-import");
            }}
            className="w-full sm:w-auto"
          >
            <Upload className="mr-2 size-4" />
            Bulk Import
          </Button>
          <Button
            onClick={() => {
              router.push("/dashboard/management/tasks/create");
            }}
            className="w-full sm:w-auto"
          >
            <Plus className="mr-2 size-4" />
            Create Task
          </Button>
        </div>
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
          isCsvDownloading={downloadCsvMutation.isPending}
          searchPlaceholder="Search tasks..."
          searchSize="md"
          searchPosition="right"
          searchWrapperClassName="md:max-w-[680px]"
          searchFieldWrapperClassName="lg:max-w-[380px]"
          searchInputClassName="h-10 text-sm"
        />

        {!isLoading && rows.length === 0 ? (
          debouncedSearch ? (
            <StateDisplay
              variant="no-results"
              size="sm"
              className="rounded-2xl border border-dashed my-4"
              title="No matching tasks"
              description="No tasks match your search. Try a different keyword or clear the search."
            />
          ) : (
            <StateDisplay
              variant="no-tasks"
              className="rounded-2xl border border-dashed my-4"
              title="No tasks configured"
              description="There are currently no tasks configured in the system. Use the 'Create Task' button above to set up a new task."
            />
          )
        ) : (
          <Table
            rows={rows}
            isLoading={isLoading}
            customCellRender={(column, row) => {
              if (column !== "active") return null;

              return row.active === true ? (
                <span className="text-green-600 font-semibold">Active</span>
              ) : (
                <span className="text-muted-foreground">Inactive</span>
              );
            }}
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
        )}
      </CardContent>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteId(null);
        }}
        title="Delete Task"
        description="Are you sure you want to delete this task? This action cannot be undone."
        onConfirm={handleDeleteConfirm}
        isPending={deleteMutation.isPending}
        variant="destructive"
        confirmLabel="Delete"
      />

      {/* Edit Form Modal */}
      <TaskFormDialog
        isOpen={editId !== null}
        onClose={() => setEditId(null)}
        taskId={editId}
      />
    </Card>
  );
}
