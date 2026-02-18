"use client";

import { ShieldCheck } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { endpoints } from "@/api/endpoints";
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
import { useDeleteManageUser, useManageUsersList } from "../hooks";
import type { ManageUserListItem } from "../schemas";
import { Blank } from "./Blank";
import Pagination from "./pagination";
import Table from "./Table";
import TableTop from "./TableTop";
import THead from "./Thead";
import UserForm from "./useForm";

type ColOrderType = { isSortable: boolean; column: string; Label: string };

const columnOrder: ColOrderType[] = [
  { column: "full_name", Label: "Full Name", isSortable: true },
  { column: "karma", Label: "Total Karma", isSortable: true },
  { column: "muid", Label: "Mu ID", isSortable: true },
  { column: "email", Label: "Email", isSortable: true },
  { column: "mobile", Label: "Mobile", isSortable: true },
  { column: "discord_id", Label: "Discord ID", isSortable: true },
  { column: "level", Label: "Level", isSortable: true },
  { column: "created_at", Label: "Created On", isSortable: true },
];

function ManageUsers() {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [perPage, setPerPage] = useState(20);
  const [sort, setSort] = useState("");
  const [search, setSearch] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [id, setId] = useState("");
  const userFormRef = useRef<{ handleSubmitExternally: () => void } | null>(
    null,
  );

  const { data, isLoading } = useManageUsersList({
    pageIndex: currentPage,
    perPage,
    search,
    sortBy: sort,
  });

  const deleteMutation = useDeleteManageUser();
  const rows = (data?.data ?? []) as ManageUserListItem[];

  useEffect(() => {
    setTotalPages(data?.pagination.totalPages ?? 0);
  }, [data?.pagination.totalPages]);

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

  const handleEdit = (value: string | number | boolean) => {
    setId(String(value));
    setIsModalOpen(true);
  };

  const handleDelete = async (value: string | undefined) => {
    if (!value) return;
    try {
      await deleteMutation.mutateAsync(value);
      toast.success("User deleted");
      setCurrentPage(1);
    } catch {
      toast.error("Failed to delete user");
    }
  };

  const handlePerPageNumber = (selectedValue: number) => {
    setCurrentPage(1);
    setPerPage(selectedValue);
  };

  const handleIconClick = (column: string) => {
    setCurrentPage(1);
    setSort((prev) => (prev === column ? `-${column}` : column));
  };

  return (
    <div className="mx-auto w-full space-y-6 overflow-hidden p-3 sm:p-6">
      <Card className="overflow-hidden rounded-3xl border border-border/60 bg-card shadow-[0_10px_30px_-18px_rgba(0,0,0,0.35)]">
        <CardHeader className="border-b border-border/50 bg-background px-4 py-5 sm:px-6 sm:py-6">
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

        <CardContent className="space-y-6 bg-background p-3 sm:p-6">
          <TableTop
            onSearchText={handleSearch}
            onPerPageNumber={handlePerPageNumber}
            CSV={endpoints.manageUsers.csv}
          />
          <Table
            rows={rows}
            isloading={isLoading}
            page={currentPage}
            perPage={perPage}
            columnOrder={columnOrder}
            id={["id"]}
            onEditClick={handleEdit}
            onDeleteClick={handleDelete}
            modalDeleteHeading="Delete"
            modalTypeContent="error"
            modalDeleteContent="Are you sure you want to delete this user?"
          >
            <THead
              columnOrder={columnOrder}
              onIconClick={handleIconClick}
              action
            />
            <div>
              {!isLoading && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  handleNextClick={handleNextClick}
                  handlePreviousClick={handlePreviousClick}
                  onPerPageNumber={handlePerPageNumber}
                  perPage={perPage}
                  setPerPage={setPerPage}
                  totalCount={data?.pagination.total}
                />
              )}
            </div>
            <Blank />
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-h-[92vh] overflow-y-auto rounded-3xl border border-[#dde3ec] bg-[#f5f7fb] sm:max-w-5xl">
          <DialogHeader className="sr-only">
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Enter the details of the user.
            </DialogDescription>
          </DialogHeader>
          <UserForm
            ref={userFormRef}
            id={id}
            closeModal={() => setIsModalOpen(false)}
            formId="manage-users-edit-form"
          />
          <DialogFooter className="grid grid-cols-1 gap-3 pt-1 sm:grid-cols-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              className="h-12 rounded-2xl border-[#1f66e5] text-2xl sm:text-base font-medium text-[#1f66e5] hover:bg-[#eaf1ff]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="manage-users-edit-form"
              className="h-12 rounded-2xl bg-[#1f66e5] text-2xl sm:text-base font-medium text-white hover:bg-[#1857c7]"
            >
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ManageUsers;
export const ManageUsersPage = ManageUsers;
