"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Building, Download, Plus } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useAddOrganization,
  useAffiliations,
  useCountries,
  useDeleteOrganization,
  useDistricts,
  useDownloadOrgCsv,
  useEditOrganization,
  useOrganizations,
  useStates,
} from "../hooks/use-organizations";
import {
  ORG_TYPES,
  type OrgFormData,
  OrgFormSchema,
  type OrgInfo,
  type OrgType,
} from "../schemas";

// ─── Column config per org type ───────────────────────────────────────────────

// Helper: resolve a field that may come back as either `key` or `key_name`
function resolveField(row: Record<string, unknown>, key: string): string {
  const plain = row[key];
  const named = row[`${key}_name`];
  const value = plain ?? named;
  return value != null ? String(value) : "—";
}

const COLLEGE_COLUMNS = [
  { column: "title", Label: "Title", isSortable: true, width: "min-w-[180px]" },
  { column: "code", Label: "Code", isSortable: true, width: "min-w-[100px]" },
  {
    column: "affiliation",
    Label: "Affiliation",
    isSortable: false,
    width: "min-w-[150px]",
    wrap: (_: string, _id: string, row: Record<string, unknown>) => (
      <span>{resolveField(row, "affiliation")}</span>
    ),
  },
  {
    column: "district",
    Label: "District",
    isSortable: false,
    width: "min-w-[120px]",
    wrap: (_: string, _id: string, row: Record<string, unknown>) => (
      <span>{resolveField(row, "district")}</span>
    ),
  },
  {
    column: "zone",
    Label: "Zone",
    isSortable: false,
    width: "min-w-[120px]",
    wrap: (_: string, _id: string, row: Record<string, unknown>) => (
      <span>{resolveField(row, "zone")}</span>
    ),
  },
];

const COMPANY_COLUMNS = [
  { column: "title", Label: "Title", isSortable: true, width: "min-w-[180px]" },
  { column: "code", Label: "Code", isSortable: true, width: "min-w-[100px]" },
  {
    column: "district",
    Label: "District",
    isSortable: false,
    width: "min-w-[120px]",
    wrap: (_: string, _id: string, row: Record<string, unknown>) => (
      <span>{resolveField(row, "district")}</span>
    ),
  },
  {
    column: "zone",
    Label: "Zone",
    isSortable: false,
    width: "min-w-[120px]",
    wrap: (_: string, _id: string, row: Record<string, unknown>) => (
      <span>{resolveField(row, "zone")}</span>
    ),
  },
  {
    column: "state",
    Label: "State",
    isSortable: false,
    width: "min-w-[120px]",
    wrap: (_: string, _id: string, row: Record<string, unknown>) => (
      <span>{resolveField(row, "state")}</span>
    ),
  },
  {
    column: "country",
    Label: "Country",
    isSortable: false,
    width: "min-w-[120px]",
    wrap: (_: string, _id: string, row: Record<string, unknown>) => (
      <span>{resolveField(row, "country")}</span>
    ),
  },
];

const COMMUNITY_COLUMNS = [
  { column: "title", Label: "Title", isSortable: true, width: "min-w-[180px]" },
  { column: "code", Label: "Code", isSortable: true, width: "min-w-[100px]" },
  {
    column: "state",
    Label: "State",
    isSortable: false,
    width: "min-w-[120px]",
    wrap: (_: string, _id: string, row: Record<string, unknown>) => (
      <span>{resolveField(row, "state")}</span>
    ),
  },
  {
    column: "zone",
    Label: "Zone",
    isSortable: false,
    width: "min-w-[120px]",
    wrap: (_: string, _id: string, row: Record<string, unknown>) => (
      <span>{resolveField(row, "zone")}</span>
    ),
  },
];

const SCHOOL_COLUMNS = [
  { column: "title", Label: "Title", isSortable: true, width: "min-w-[180px]" },
  { column: "code", Label: "Code", isSortable: true, width: "min-w-[100px]" },
  {
    column: "district",
    Label: "District",
    isSortable: false,
    width: "min-w-[120px]",
    wrap: (_: string, _id: string, row: Record<string, unknown>) => (
      <span>{resolveField(row, "district")}</span>
    ),
  },
  {
    column: "zone",
    Label: "Zone",
    isSortable: false,
    width: "min-w-[120px]",
    wrap: (_: string, _id: string, row: Record<string, unknown>) => (
      <span>{resolveField(row, "zone")}</span>
    ),
  },
];

const COLUMNS_BY_TYPE: Record<OrgType, typeof COLLEGE_COLUMNS> = {
  College: COLLEGE_COLUMNS,
  Company: COMPANY_COLUMNS,
  Community: COMMUNITY_COLUMNS,
  School: SCHOOL_COLUMNS,
};

// ─── Delete Confirm Dialog ────────────────────────────────────────────────────

function DeleteConfirmDialog({
  open,
  onOpenChange,
  orgTitle,
  onConfirm,
  isPending,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  orgTitle: string;
  onConfirm: () => void;
  isPending: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Delete Organization</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Are you sure you want to delete{" "}
          <strong className="text-foreground">{orgTitle}</strong>? This action
          cannot be undone.
        </p>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end pt-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
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

// ─── Organization Form Dialog ─────────────────────────────────────────────────

function OrgFormDialog({
  open,
  onOpenChange,
  editingOrg,
  defaultOrgType,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editingOrg: OrgInfo | null;
  defaultOrgType: OrgType;
}) {
  const isEditing = !!editingOrg;
  const { mutateAsync: addOrg, isPending: isAdding } = useAddOrganization();
  const { mutateAsync: editOrg, isPending: isEditing_ } = useEditOrganization();

  const form = useForm<OrgFormData>({
    resolver: zodResolver(OrgFormSchema),
    defaultValues: {
      title: "",
      code: "",
      org_type: defaultOrgType,
      country: "",
      state: "",
      district: "",
      affiliation: "",
    },
  });

  const watchedCountry = form.watch("country");
  const watchedState = form.watch("state");
  const watchedOrgType = form.watch("org_type");

  // Fetch location data cascadingly
  const { data: countries = [], isLoading: countriesLoading } =
    useCountries(open);
  const { data: states = [], isLoading: statesLoading } = useStates(
    watchedCountry || null,
    open,
  );
  const { data: districts = [], isLoading: districtsLoading } = useDistricts(
    watchedState || null,
    open,
  );
  const { data: affiliations = [], isLoading: affiliationsLoading } =
    useAffiliations(open && watchedOrgType === "College");

  // Reset state/district when country changes
  useEffect(() => {
    if (!open || !watchedCountry) return;
    form.setValue("state", "");
    form.setValue("district", "");
  }, [open, watchedCountry, form.setValue]);

  // Reset district when state changes
  useEffect(() => {
    if (!open || !watchedState) return;
    form.setValue("district", "");
  }, [open, watchedState, form.setValue]);

  // Reset affiliation when type changes away from College
  useEffect(() => {
    if (!open) return;
    if (watchedOrgType !== "College") {
      form.setValue("affiliation", "");
    }
  }, [open, watchedOrgType, form.setValue]);

  // Populate form when editing
  useEffect(() => {
    if (!open) return;
    if (editingOrg) {
      form.reset({
        title: editingOrg.title,
        code: editingOrg.code,
        org_type: editingOrg.org_type as OrgType,
        country: editingOrg.country_uuid ?? "",
        state: editingOrg.state_uuid ?? "",
        district: editingOrg.district_uuid ?? "",
        affiliation: editingOrg.affiliation_uuid ?? "",
      });
    } else {
      form.reset({
        title: "",
        code: "",
        org_type: defaultOrgType,
        country: "",
        state: "",
        district: "",
        affiliation: "",
      });
    }
  }, [open, editingOrg, defaultOrgType, form.reset]);

  const onSubmit = async (data: OrgFormData) => {
    try {
      if (isEditing && editingOrg) {
        await editOrg({ code: editingOrg.code, data });
      } else {
        await addOrg(data);
      }
      onOpenChange(false);
    } catch {
      // Ignore: mutation's onError handles the toast. Catching it here
      // prevents an unhandled promise rejection in the console.
    }
  };

  const isPending = isAdding || isEditing_;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        aria-describedby={undefined}
        className="w-[95vw] max-w-lg max-h-[90vh] overflow-y-auto rounded-xl"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building className="size-4 text-primary" />
            {isEditing ? "Edit Organization" : "Add Organization"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 pt-1"
          >
            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organization Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. IIT Bombay" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Row: Code & Org Type */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Code</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. IITB"
                        {...field}
                        disabled={isEditing}
                        className={
                          isEditing ? "bg-muted cursor-not-allowed" : ""
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="org_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organization Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isEditing}
                    >
                      <FormControl>
                        <SelectTrigger
                          className={
                            isEditing ? "bg-muted cursor-not-allowed" : ""
                          }
                        >
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent
                        position="popper"
                        className="z-[9999] max-h-[200px] overflow-y-auto"
                      >
                        {ORG_TYPES.map((t) => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Row: Country & State */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              countriesLoading ? "Loading…" : "Select country"
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent
                        position="popper"
                        className="z-[9999] max-h-[200px] overflow-y-auto"
                      >
                        {countries.map((c) => (
                          <SelectItem
                            key={c.id || c.value}
                            value={(c.id || c.value) as string}
                          >
                            {c.name || c.title || c.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={!watchedCountry || statesLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              !watchedCountry
                                ? "Select country first"
                                : statesLoading
                                  ? "Loading…"
                                  : "Select state"
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent
                        position="popper"
                        className="z-[9999] max-h-[200px] overflow-y-auto"
                      >
                        {states.map((s) => (
                          <SelectItem
                            key={s.id || s.value}
                            value={(s.id || s.value) as string}
                          >
                            {s.name || s.title || s.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Row: District & Affiliation */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="district"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>District</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={!watchedState || districtsLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              !watchedState
                                ? "Select state first"
                                : districtsLoading
                                  ? "Loading…"
                                  : "Select district"
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent
                        position="popper"
                        className="z-[9999] max-h-[200px] overflow-y-auto"
                      >
                        {districts.map((d) => (
                          <SelectItem
                            key={d.id || d.value}
                            value={(d.id || d.value) as string}
                          >
                            {d.name || d.title || d.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {watchedOrgType === "College" ? (
                <FormField
                  control={form.control}
                  name="affiliation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Affiliation</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={
                                affiliationsLoading
                                  ? "Loading…"
                                  : "Select affiliation"
                              }
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent
                          position="popper"
                          className="z-[9999] max-h-[200px] overflow-y-auto"
                        >
                          {affiliations.map((a) => (
                            <SelectItem key={a.id} value={a.id}>
                              {a.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                <div /> /* Empty div to keep District on the left when Affiliation is hidden */
              )}
            </div>

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end pt-2">
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
                    : "Create Organization"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function OrganizationsTable() {
  // ── Tab state ─────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<OrgType>("College");

  // ── Table state ───────────────────────────────────────────
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 20;
  const [sort, setSort] = useState("");
  const [search, setSearch] = useState("");

  // ── Dialog state ──────────────────────────────────────────
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<OrgInfo | null>(null);

  // ── Data ──────────────────────────────────────────────────
  const { data, isLoading } = useOrganizations({
    perPage,
    pageIndex: currentPage,
    search,
    sortBy: sort,
    org_type: activeTab,
  });

  const rows = (data?.data ?? []) as OrgInfo[];
  const totalPages = data?.pagination?.totalPages ?? 0;
  const totalCount = data?.pagination?.count;

  // ── Mutations ─────────────────────────────────────────────
  const { mutate: deleteOrg, isPending: isDeleting } = useDeleteOrganization();
  const { mutate: downloadCsv, isPending: isCsvDownloading } =
    useDownloadOrgCsv();

  // ── Handlers ──────────────────────────────────────────────

  const handleTabChange = (tab: OrgType) => {
    setActiveTab(tab);
    setCurrentPage(1);
    setSearch("");
    setSort("");
  };

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
      const org = rows.find((r) => r.id === String(id)) ?? null;
      setSelectedOrg(org);
      setFormOpen(true);
    },
    [rows],
  );

  const handleDeleteClick = useCallback(
    (id: string | undefined) => {
      const org = rows.find((r) => r.code === id) ?? null;
      setSelectedOrg(org);
      setDeleteOpen(true);
    },
    [rows],
  );

  const handleConfirmDelete = () => {
    if (!selectedOrg) return;
    deleteOrg(selectedOrg.code, {
      onSuccess: () => {
        setDeleteOpen(false);
        setSelectedOrg(null);
      },
      onError: () => {
        setDeleteOpen(false);
      },
    });
  };

  const handleAddNew = () => {
    setSelectedOrg(null);
    setFormOpen(true);
  };

  // ── Column order ──────────────────────────────────────────

  const columnOrder = useMemo(() => COLUMNS_BY_TYPE[activeTab], [activeTab]);

  return (
    <>
      <Card className="overflow-visible rounded-none border-0 bg-transparent shadow-none">
        <CardHeader className="px-0 py-0 sm:px-0 sm:py-0">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/6 px-3 py-1 text-xs font-semibold text-primary">
                <Building className="size-3.5" />
                Management
              </div>
              <CardTitle className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Organizations
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Create and manage organization profiles across all types.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadCsv(activeTab)}
                disabled={isCsvDownloading}
                className="gap-1.5 rounded-xl"
              >
                <Download className="size-3.5" />
                {isCsvDownloading ? "Exporting…" : "Export CSV"}
              </Button>
              <Button
                size="sm"
                onClick={handleAddNew}
                className="gap-1.5 rounded-xl"
              >
                <Plus className="size-3.5" />
                Add Organization
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 bg-transparent p-0 pt-6">
          {/* ── Tabs ─────────────────────────────────────── */}
          <div className="flex overflow-x-auto gap-0 border-b border-border no-scrollbar">
            {ORG_TYPES.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => handleTabChange(tab)}
                className={`shrink-0 px-5 py-2.5 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
                  activeTab === tab
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground"
                }`}
              >
                {tab}s
              </button>
            ))}
          </div>

          {/* ── Search + Rows per page ────────────────────── */}
          <TableTop
            onSearchText={handleSearch}
            CSV=""
            searchPlaceholder={`Search ${activeTab}s`}
            searchSize="md"
            searchPosition="right"
            wrapperClassName="border-none bg-transparent shadow-none p-0"
            searchWrapperClassName="border-none bg-transparent md:max-w-[680px]"
            searchFieldWrapperClassName="lg:max-w-[380px]"
            searchInputClassName="h-10 text-sm border border-border/50 rounded-lg bg-transparent"
          />

          {/* ── Table ─────────────────────────────────────── */}
          <div className="w-full overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
            <div className="min-w-[600px]">
              <Table
                rows={rows as unknown as Data[]}
                isloading={isLoading}
                page={currentPage}
                perPage={perPage}
                columnOrder={columnOrder}
                id={["code"]}
                onEditClick={handleEditClick}
                onDeleteClick={handleDeleteClick}
                modalDeleteHeading="Delete Organization"
                modalDeleteContent={`Are you sure you want to delete "${selectedOrg?.title}"? This cannot be undone.`}
              >
                <THead
                  columnOrder={columnOrder}
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
                      perPage={perPage}
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

      {/* ── Add / Edit dialog ─────────────────────────── */}
      <OrgFormDialog
        open={formOpen}
        onOpenChange={(v) => {
          setFormOpen(v);
          if (!v) setSelectedOrg(null);
        }}
        editingOrg={selectedOrg}
        defaultOrgType={activeTab}
      />

      {/* ── Delete confirm dialog ──────────────────────── */}
      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        orgTitle={selectedOrg?.title ?? ""}
        onConfirm={handleConfirmDelete}
        isPending={isDeleting}
      />
    </>
  );
}
