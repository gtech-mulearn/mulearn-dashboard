"use client";

import { ShieldCheck } from "lucide-react";
import { useState } from "react";
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
import { useDeleteManageUser } from "@/features/manage-users/hooks";
import type { ManageUserListItem } from "@/features/manage-users/schemas";
import UserForm from "@/features/manage-users/components/useForm";
import { Blank } from "./Blank";
import Pagination from "./pagination";
import Table from "./Table";
import TableTop from "./TableTop";
import THead from "./Thead";

export type TableColumnConfig = {
  isSortable: boolean;
  column: string;
  Label: string;
};
type ManagementTablePageProps = {
  badgeText: string;
  titleText: string;
  columnOrder: TableColumnConfig[];
  rowIdColumns: string[];
  rows: ManageUserListItem[];
  isLoading: boolean;
  totalPages: number;
  totalCount?: number;
  currentPage: number;
  perPage: number;
  onSearch: (value: string) => void;
  onPerPageNumber: (value: number) => void;
  onNextClick: () => void;
  onPreviousClick: () => void;
  onSortChange: (column: string) => void;
  onAfterDelete?: () => void;
  enableEdit?: boolean;
  enableDelete?: boolean;
};
export default function ManagementTablePage({
  badgeText,
  titleText,
  columnOrder,
  rowIdColumns,
  rows,
  isLoading,
  totalPages,
  totalCount,
  currentPage,
  perPage,
  onSearch,
  onPerPageNumber,
  onNextClick,
  onPreviousClick,
  onSortChange,
  onAfterDelete,
  enableEdit = false,
  enableDelete = false,
}: ManagementTablePageProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [id, setId] = useState("");

  const deleteMutation = useDeleteManageUser();

  const handleEdit = (value: string | number | boolean) => {
    if (!enableEdit) return;
    setId(String(value));
    setIsModalOpen(true);
  };

  const handleDelete = async (value: string | undefined) => {
    if (!enableDelete) return;
    if (!value) return;
    try {
      await deleteMutation.mutateAsync(value);
      toast.success("User deleted");
      onAfterDelete?.();
    } catch {
      toast.error("Failed to delete user");
    }
  };

  return (
    <>
      <Card className="overflow-visible border-0 bg-transparent shadow-none rounded-none">
        <CardHeader className="px-0 py-0 sm:px-0 sm:py-0">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/[0.06] px-3 py-1 text-xs font-semibold text-primary">
              <ShieldCheck className="size-3.5" />
              {badgeText}
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {titleText}
            </CardTitle>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 bg-transparent p-0">
          <TableTop
            onSearchText={onSearch}
            onPerPageNumber={onPerPageNumber}
            perPage={perPage}
            perPageOptions={[5, 10, 20, 50, 100]}
            CSV={endpoints.manageUsers.csv}
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
            columnOrder={columnOrder}
            id={rowIdColumns}
            onEditClick={enableEdit ? handleEdit : undefined}
            onDeleteClick={enableDelete ? handleDelete : undefined}
            modalDeleteHeading="Delete"
            modalTypeContent="error"
            modalDeleteContent="Are you sure you want to delete this user?"
          >
            <THead
              columnOrder={columnOrder}
              onIconClick={onSortChange}
              action={enableEdit || enableDelete}
            />
            <div>
              {!isLoading && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  handleNextClick={onNextClick}
                  handlePreviousClick={onPreviousClick}
                  perPage={perPage}
                  totalCount={totalCount}
                />
              )}
            </div>
            <Blank />
          </Table>
        </CardContent>
      </Card>

      {enableEdit && (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-h-[92vh] overflow-y-auto rounded-3xl border border-border bg-card sm:max-w-5xl">
            <DialogHeader className="sr-only">
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>
                Enter the details of the user.
              </DialogDescription>
            </DialogHeader>
            <UserForm
              id={id}
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
      )}
    </>
  );
}
