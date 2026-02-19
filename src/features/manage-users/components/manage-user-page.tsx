"use client";

import { ShieldCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { endpoints } from "@/api/endpoints";
import { Blank } from "@/components/dashboard/table/Blank";
import Pagination from "@/components/dashboard/table/pagination";
import Table from "@/components/dashboard/table/Table";
import TableTop from "@/components/dashboard/table/TableTop";
import THead from "@/components/dashboard/table/Thead";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useDeleteManageUser,
  useManageUsersCsvDownload,
  useManageUsersList,
} from "@/features/manage-users/hooks";
import type { ManageUserListItem } from "@/features/manage-users/schemas";
import UserForm from "./useForm";

export default function ManageUsers() {
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [sort, setSort] = useState("");
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const deleteMutation = useDeleteManageUser();
  const { downloadCsv, isDownloading } = useManageUsersCsvDownload(
    endpoints.manageUsers.csv,
  );

  const { data, isLoading } = useManageUsersList({
    pageIndex: currentPage,
    perPage,
    search,
    sortBy: sort,
  });

  const rows = (data?.data ?? []) as ManageUserListItem[];
  const totalPages = data?.pagination.totalPages ?? 0;
  const totalCount = data?.pagination.total;

  const handleNextClick = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages || 1));
  };

  const handlePreviousClick = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleSearch = (value: string) => {
    setCurrentPage(1);
    setSearch(value);
  };

  const handlePerPageNumber = (value: number) => {
    setCurrentPage(1);
    setPerPage(value);
  };

  const handleSortChange = (column: string) => {
    setCurrentPage(1);
    setSort((prev) => (prev === column ? `-${column}` : column));
  };

  const handleDeleteRow = async (value: string | undefined) => {
    if (!value) return;
    try {
      await deleteMutation.mutateAsync(value);
      toast.success("User deleted");
    } catch {
      toast.error("Failed to delete user");
    }
  };

  const handleEditRow = (value: string | number | boolean) => {
    setSelectedId(String(value));
    setIsModalOpen(true);
  };

  return (
    <>
      <Card className="overflow-visible border-0 bg-transparent shadow-none rounded-none">
        <CardHeader className="px-0 py-0 sm:px-0 sm:py-0">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/[0.06] px-3 py-1 text-xs font-semibold text-primary">
              <ShieldCheck className="size-3.5" />
              User Management
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Manage Users
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 bg-transparent p-0">
          <TableTop
            onSearchText={handleSearch}
            onPerPageNumber={handlePerPageNumber}
            perPage={perPage}
            perPageOptions={[5, 10, 20, 50, 100]}
            CSV={endpoints.manageUsers.csv}
            onCsvDownload={downloadCsv}
            isCsvDownloading={isDownloading}
            searchPlaceholder="Search by name, email, Mu ID..."
            searchSize="md"
            searchPosition="right"
            searchWrapperClassName="md:max-w-[780px]"
            searchFieldWrapperClassName="lg:max-w-[460px]"
            searchInputClassName="h-10 text-sm"
          />
          <Table
            rows={rows}
            isloading={isLoading}
            page={currentPage}
            perPage={perPage}
            columnOrder={[
              { column: "full_name", Label: "Full Name", isSortable: true },
              { column: "karma", Label: "Total Karma", isSortable: true },
              { column: "muid", Label: "Mu ID", isSortable: true },
              { column: "email", Label: "Email", isSortable: true },
              { column: "mobile", Label: "Mobile", isSortable: true },
              { column: "discord_id", Label: "Discord ID", isSortable: true },
              { column: "level", Label: "Level", isSortable: true },
              { column: "created_at", Label: "Created On", isSortable: true },
            ]}
            id={["id"]}
            onEditClick={handleEditRow}
            onDeleteClick={handleDeleteRow}
            modalDeleteHeading="Delete"
            modalTypeContent="error"
            modalDeleteContent="Are you sure you want to delete this user?"
          >
            <THead
              columnOrder={[
                { column: "full_name", Label: "Full Name", isSortable: true },
                { column: "karma", Label: "Total Karma", isSortable: true },
                { column: "muid", Label: "Mu ID", isSortable: true },
                { column: "email", Label: "Email", isSortable: true },
                { column: "mobile", Label: "Mobile", isSortable: true },
                { column: "discord_id", Label: "Discord ID", isSortable: true },
                { column: "level", Label: "Level", isSortable: true },
                { column: "created_at", Label: "Created On", isSortable: true },
              ]}
              onIconClick={handleSortChange}
              action
            />
            <div>
              {!isLoading && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  handleNextClick={handleNextClick}
                  handlePreviousClick={handlePreviousClick}
                  perPage={perPage}
                  totalCount={totalCount}
                />
              )}
            </div>
            <Blank />
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-h-[92vh] overflow-y-auto rounded-3xl border border-border bg-card sm:max-w-5xl">
          <DialogHeader className="sr-only">
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Enter the details of the user.
            </DialogDescription>
          </DialogHeader>
          <UserForm
            id={selectedId}
            closeModal={() => setIsModalOpen(false)}
            formId="manage-users-edit-form"
          />
          <DialogFooter className="grid grid-cols-1 gap-3 pt-1 sm:grid-cols-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              className="h-12 rounded-2xl border-primary text-2xl sm:text-base font-medium text-primary hover:bg-primary/10"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="manage-users-edit-form"
              className="h-12 rounded-2xl bg-primary text-2xl sm:text-base font-medium text-primary-foreground hover:bg-primary/90"
            >
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
