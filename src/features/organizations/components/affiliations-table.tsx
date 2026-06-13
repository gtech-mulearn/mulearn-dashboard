"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Link2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Pagination from "@/components/dashboard/table/pagination";
import Table, { type Data } from "@/components/dashboard/table/Table";
import TableTop from "@/components/dashboard/table/TableTop";
import THead from "@/components/dashboard/table/Thead";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { AffiliationRecord } from "../api/affiliations.api";
import {
  useAffiliationList,
  useCreateAffiliation,
  useDeleteAffiliation,
  useEditAffiliation,
} from "../hooks/use-affiliations";

// ─── Constants ────────────────────────────────────────────────────────────────

const PER_PAGE = 15;

// ─── Table Columns ────────────────────────────────────────────────────────────

const COLUMN_ORDER = [
  { column: "title", Label: "Title", isSortable: true, width: "w-[280px]" },
  {
    column: "organization_count",
    Label: "Organizations",
    isSortable: false,
    width: "w-[140px]",
  },
  {
    column: "created_by",
    Label: "Created By",
    isSortable: false,
    width: "w-[150px]",
  },
  {
    column: "created_at",
    Label: "Created At",
    isSortable: false,
    width: "w-[150px]",
  },
  {
    column: "updated_by",
    Label: "Updated By",
    isSortable: false,
    width: "w-[150px]",
  },
  {
    column: "updated_at",
    Label: "Updated At",
    isSortable: false,
    width: "w-[150px]",
  },
];

// ─── Form Schema ──────────────────────────────────────────────────────────────

const AffiliationFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
});

type AffiliationFormData = z.infer<typeof AffiliationFormSchema>;

// ─── Form Dialog ──────────────────────────────────────────────────────────────

interface AffiliationFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingAffiliation: AffiliationRecord | null;
}

function AffiliationFormDialog({
  open,
  onOpenChange,
  editingAffiliation,
}: AffiliationFormDialogProps) {
  const isEditing = Boolean(editingAffiliation);

  const form = useForm<AffiliationFormData>({
    resolver: zodResolver(AffiliationFormSchema),
    defaultValues: { title: "" },
  });

  // Sync form values whenever the dialog opens or the editing target changes
  useEffect(() => {
    if (open) {
      form.reset({
        title: editingAffiliation?.title ?? "",
      });
    }
  }, [open, editingAffiliation, form]);

  const { mutate: createAff, isPending: isCreating } = useCreateAffiliation();
  const { mutate: editAff, isPending: isUpdating } = useEditAffiliation();
  const isPending = isCreating || isUpdating;

  const handleSubmit = (values: AffiliationFormData) => {
    if (isEditing && editingAffiliation) {
      editAff(
        { id: editingAffiliation.id, title: values.title },
        { onSuccess: () => onOpenChange(false) },
      );
    } else {
      createAff(values.title, { onSuccess: () => onOpenChange(false) });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Affiliation Details" : "Add Affiliation"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4 pt-2"
          >
            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Visvesvaraya Technological University"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit */}
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending
                  ? isEditing
                    ? "Saving…"
                    : "Creating…"
                  : isEditing
                    ? "Save Changes"
                    : "Add Affiliation"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Delete Confirm Dialog ────────────────────────────────────────────────────

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  affiliationTitle: string;
  onConfirm: () => void;
  isPending: boolean;
}

function DeleteConfirmDialog({
  open,
  onOpenChange,
  affiliationTitle,
  onConfirm,
  isPending,
}: DeleteConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Delete Affiliation</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-foreground">
            &quot;{affiliationTitle}&quot;
          </span>
          ? This cannot be undone.
        </p>
        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={isPending}
          >
            {isPending ? "Deleting…" : "Delete"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AffiliationsTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<AffiliationRecord | null>(null);

  // ── Data ──────────────────────────────────────────────────
  const { data, isLoading } = useAffiliationList({
    perPage,
    pageIndex: currentPage,
    search,
    sortBy: sort,
  });

  const rows = (data?.data ?? []) as AffiliationRecord[];
  const totalPages = data?.pagination?.totalPages ?? 0;
  const totalCount = data?.pagination?.count;

  // ── Mutations ─────────────────────────────────────────────
  const { mutate: deleteAff, isPending: isDeleting } = useDeleteAffiliation();

  // ── Handlers ──────────────────────────────────────────────

  const handleSearch = (value: string) => {
    setCurrentPage(1);
    setSearch(value);
  };

  const handleSortChange = (column: string) => {
    setCurrentPage(1);
    setSort((prev) => (prev === column ? `-${column}` : column));
  };

  const handleEditClick = useCallback(
    (id: string | number | boolean) => {
      const aff = rows.find((r) => r.id === String(id)) ?? null;
      setSelected(aff);
      setFormOpen(true);
    },
    [rows],
  );

  const handleDeleteClick = useCallback(
    (id: string | undefined) => {
      const aff = rows.find((r) => r.id === id) ?? null;
      setSelected(aff);
      setDeleteOpen(true);
    },
    [rows],
  );

  const handleConfirmDelete = () => {
    if (!selected) return;
    deleteAff(selected.id, {
      onSuccess: () => {
        setDeleteOpen(false);
        setSelected(null);
      },
      onError: () => {
        setDeleteOpen(false);
      },
    });
  };

  const handleAddNew = () => {
    setSelected(null);
    setFormOpen(true);
  };

  return (
    <>
      <Card className="overflow-visible rounded-none border-0 bg-transparent shadow-none">
        <CardHeader className="px-0 py-0 sm:px-0 sm:py-0">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/6 px-3 py-1 text-xs font-semibold text-primary">
                <Link2 className="size-3.5" />
                Management
              </div>
              <CardTitle className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Organization Affiliations
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Manage university and institution affiliations for colleges.
              </p>
            </div>

            <Button
              size="sm"
              onClick={handleAddNew}
              className="gap-1.5 rounded-xl self-start sm:self-auto"
            >
              Add Affiliation
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 bg-transparent p-0 pt-6">
          {/* ── Search ───────────────────────────────────── */}
          <TableTop
            onSearchText={handleSearch}
            onPerPageNumber={(n) => {
              setPerPage(n);
              setCurrentPage(1);
            }}
            CSV=""
            perPage={perPage}
            perPageOptions={[10, 15, 25, 50]}
            searchPlaceholder="Search affiliations…"
            searchSize="md"
            searchPosition="right"
            searchWrapperClassName="border-none bg-transparent md:max-w-[680px]"
            searchFieldWrapperClassName="lg:max-w-[380px]"
            searchInputClassName="h-10 text-sm border border-border/50 rounded-lg bg-transparent"
          />

          {/* ── Table ────────────────────────────────────── */}
          <div className="w-full overflow-x-auto">
            <div className="min-w-[600px]">
              <Table
                rows={rows as unknown as Data[]}
                isloading={isLoading}
                page={currentPage}
                perPage={PER_PAGE}
                columnOrder={COLUMN_ORDER}
                id={["id"]}
                onEditClick={handleEditClick}
                onDeleteClick={handleDeleteClick}
                modalDeleteHeading="Delete Affiliation"
                modalDeleteContent={`Are you sure you want to delete "${selected?.title}"? This cannot be undone.`}
              >
                <THead
                  columnOrder={COLUMN_ORDER}
                  onIconClick={handleSortChange}
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
                      perPage={PER_PAGE}
                      totalCount={totalCount}
                    />
                  )}
                </div>
                <div />
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Add / Edit dialog ────────────────────────── */}
      <AffiliationFormDialog
        open={formOpen}
        onOpenChange={(v) => {
          setFormOpen(v);
          if (!v) setSelected(null);
        }}
        editingAffiliation={selected}
      />

      {/* ── Delete confirm dialog ────────────────────── */}
      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        affiliationTitle={selected?.title ?? ""}
        onConfirm={handleConfirmDelete}
        isPending={isDeleting}
      />
    </>
  );
}
