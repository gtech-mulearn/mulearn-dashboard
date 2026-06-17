"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Building,
  Building2,
  Download,
  GraduationCap,
  Plus,
  Users2,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { getApiResponseError } from "@/hooks/use-get-error";
import { DataTableErrorBoundary } from "@/components/dashboard/DataTableErrorBoundary";
import Pagination from "@/components/dashboard/table/pagination";
import Table from "@/components/dashboard/table/Table";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useAffiliations,
  useCountriesDropdown,
  useCreateOrg,
  useDeleteOrg,
  useDistrictsDropdown,
  useEditOrg,
  useOrgsCsvDownload,
  useOrgsList,
  useStatesDropdown,
} from "../hooks/use-organizations";
import {
  ORG_TYPES,
  OrgFormSchema,
  type OrgFormValues,
  type OrgInfo,
  type OrgType,
} from "../schemas";

// ─── Tab config ───────────────────────────────────────────────────────────────

const TAB_ICONS: Record<OrgType, typeof Building> = {
  College: GraduationCap,
  Company: Building2,
  Community: Users2,
  School: Building,
};

// ─── Column definitions per org type ──────────────────────────────────────────

function getColumnOrder(orgType: OrgType) {
  const base = [
    {
      column: "title",
      Label: "Title",
      isSortable: true,
      width: "min-w-[180px]",
    },
    { column: "code", Label: "Code", isSortable: true, width: "min-w-[100px]" },
  ];

  if (orgType === "College") {
    return [
      ...base,
      {
        column: "affiliation",
        Label: "Affiliation",
        isSortable: false,
        width: "min-w-[150px]",
      },
      {
        column: "district",
        Label: "District",
        isSortable: false,
        width: "min-w-[120px]",
      },
      {
        column: "zone",
        Label: "Zone",
        isSortable: false,
        width: "min-w-[120px]",
      },
    ];
  }
  if (orgType === "Company") {
    return [
      ...base,
      {
        column: "district",
        Label: "District",
        isSortable: false,
        width: "min-w-[120px]",
      },
      {
        column: "zone",
        Label: "Zone",
        isSortable: false,
        width: "min-w-[120px]",
      },
      {
        column: "state",
        Label: "State",
        isSortable: false,
        width: "min-w-[120px]",
      },
      {
        column: "country",
        Label: "Country",
        isSortable: false,
        width: "min-w-[120px]",
      },
    ];
  }
  if (orgType === "Community") {
    return [
      ...base,
      {
        column: "state",
        Label: "State",
        isSortable: false,
        width: "min-w-[120px]",
      },
      {
        column: "zone",
        Label: "Zone",
        isSortable: false,
        width: "min-w-[120px]",
      },
    ];
  }
  // School
  return [
    ...base,
    {
      column: "district",
      Label: "District",
      isSortable: false,
      width: "min-w-[120px]",
    },
    {
      column: "zone",
      Label: "Zone",
      isSortable: false,
      width: "min-w-[120px]",
    },
  ];
}

// ─── Page wrapper ─────────────────────────────────────────────────────────────

export default function OrganizationsPage() {
  return (
    <DataTableErrorBoundary>
      <OrganizationsContent />
    </DataTableErrorBoundary>
  );
}

// ─── Main content ─────────────────────────────────────────────────────────────

function OrganizationsContent() {
  const [activeTab, setActiveTab] = useState<OrgType>("College");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("");

  // Dialog state
  const [formOpen, setFormOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState<OrgInfo | null>(null);

  // ─── Data ─────────────────────────────────────────────────────────────────
  const { data, isLoading } = useOrgsList({
    pageIndex: currentPage,
    perPage,
    search,
    sortBy,
    org_type: activeTab,
  });

  const rows = (data?.data ?? []) as OrgInfo[];
  const totalPages = data?.pagination.totalPages ?? 0;
  const totalCount = data?.pagination.count;

  // ─── Mutations ────────────────────────────────────────────────────────────
  const deleteMutation = useDeleteOrg();
  const { downloadCsv, isDownloading } = useOrgsCsvDownload(activeTab);

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const handleSearch = (value: string) => {
    setCurrentPage(1);
    setSearch(value);
  };
  const handlePerPage = (value: number) => {
    setCurrentPage(1);
    setPerPage(value);
  };
  const handleSort = (column: string) => {
    setCurrentPage(1);
    setSortBy((prev) => (prev === column ? `-${column}` : column));
  };

  const handleDeleteRow = async (value: string | undefined) => {
    if (!value) return;
    // value here is the code
    await deleteMutation.mutateAsync(value);
  };

  const handleEditRow = useCallback(
    (id: string | number | boolean) => {
      const org = rows.find((r) => r.code === String(id)) ?? null;
      setEditingOrg(org);
      setFormOpen(true);
    },
    [rows],
  );

  const handleCreateOpen = () => {
    setEditingOrg(null);
    setFormOpen(true);
  };

  // ─── Column order ─────────────────────────────────────────────────────────
  const columnOrder = useMemo(() => getColumnOrder(activeTab), [activeTab]);

  const _TabIcon = TAB_ICONS[activeTab];

  return (
    <>
      <Card className="overflow-visible border-0 bg-transparent shadow-none rounded-none">
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
                Manage colleges, companies, communities, and schools.
              </p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                className="gap-1.5 w-full sm:w-auto"
                onClick={downloadCsv}
                disabled={isDownloading}
              >
                <Download className="size-3.5" />
                {isDownloading ? "Exporting..." : "Export CSV"}
              </Button>
              <Button
                className="gap-1.5 w-full sm:w-auto"
                onClick={handleCreateOpen}
              >
                <Plus className="size-3.5" />
                Add {activeTab}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 bg-transparent p-0 pt-6">
          {/* Tabs */}
          <div className="flex overflow-x-auto gap-1 border-b pb-0 no-scrollbar">
            {ORG_TYPES.map((tab) => {
              const Icon = TAB_ICONS[tab];
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab);
                    setCurrentPage(1);
                    setSearch("");
                    setSortBy("");
                  }}
                  className={`inline-flex items-center gap-1.5 shrink-0 px-4 py-2.5 text-sm font-medium rounded-none border-b-2 transition-colors ${
                    activeTab === tab
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="size-3.5" />
                  {tab}
                </button>
              );
            })}
          </div>

          {/* TableTop: search + per-page + CSV */}
          <TableTop
            onSearchText={handleSearch}
            onPerPageNumber={handlePerPage}
            perPage={perPage}
            perPageOptions={[5, 10, 20, 50, 100]}
            CSV=""
            onCsvDownload={undefined}
            isCsvDownloading={isDownloading}
            searchPlaceholder={`Search ${activeTab.toLowerCase()}s…`}
            searchSize="md"
            searchPosition="right"
            searchWrapperClassName="md:max-w-[680px]"
            searchFieldWrapperClassName="lg:max-w-[380px]"
            searchInputClassName="h-10 text-sm"
          />

          {/* Table */}
          <div className="w-full overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
            <div className="min-w-[600px]">
              <Table
                rows={rows}
                isLoading={isLoading}
                page={currentPage}
                perPage={perPage}
                columnOrder={columnOrder}
                id={["code"]}
                onEditClick={handleEditRow}
                onDeleteClick={handleDeleteRow}
                modalDeleteHeading={`Delete ${activeTab}`}
                modalDeleteContent={`Are you sure you want to delete this ${activeTab.toLowerCase()}? This action cannot be undone.`}
                modalTypeContent="error"
              >
                <THead
                  columnOrder={columnOrder}
                  onIconClick={handleSort}
                  action
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

      {/* Create / Edit dialog */}
      <OrgFormDialog
        open={formOpen}
        onOpenChange={(val) => {
          setFormOpen(val);
          if (!val) setEditingOrg(null);
        }}
        org={editingOrg}
        defaultOrgType={activeTab}
      />
    </>
  );
}

// ─── Form Dialog ──────────────────────────────────────────────────────────────

interface OrgFormDialogProps {
  open: boolean;
  onOpenChange: (val: boolean) => void;
  org: OrgInfo | null;
  defaultOrgType: OrgType;
}

function OrgFormDialog({
  open,
  onOpenChange,
  org,
  defaultOrgType,
}: OrgFormDialogProps) {
  const isEditing = Boolean(org);

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<OrgFormValues>({
    resolver: zodResolver(OrgFormSchema),
    defaultValues: {
      title: org?.title ?? "",
      code: org?.code ?? "",
      org_type: (org?.org_type as OrgType) || defaultOrgType,
      country: org?.country_uuid ?? "",
      state: org?.state_uuid ?? "",
      district: org?.district_uuid ?? "",
      affiliation: org?.affiliation_uuid ?? null,
    },
  });

  const selectedOrgType = watch("org_type");
  const selectedState = watch("state");

  // Reset form when dialog opens/closes
  const handleOpenChange = (val: boolean) => {
    if (!val) {
      reset();
    } else {
      reset({
        title: org?.title ?? "",
        code: org?.code ?? "",
        org_type: (org?.org_type as OrgType) || defaultOrgType,
        country: org?.country_uuid ?? "",
        state: org?.state_uuid ?? "",
        district: org?.district_uuid ?? "",
        affiliation: org?.affiliation_uuid ?? null,
      });
    }
    onOpenChange(val);
  };

  // ─── Dropdown data ───────────────────────────────────────────────────────
  const { data: countries = [], isLoading: countriesLoading } =
    useCountriesDropdown(open);
  const { data: states = [], isLoading: statesLoading } =
    useStatesDropdown(open);
  const { data: districts = [], isLoading: districtsLoading } =
    useDistrictsDropdown(selectedState, open);
  const { data: affiliations = [], isLoading: affiliationsLoading } =
    useAffiliations(open && selectedOrgType === "College");

  // ─── Mutations ───────────────────────────────────────────────────────────
  const createMutation = useCreateOrg();
  const editMutation = useEditOrg();

  const onSubmit = async (data: OrgFormValues) => {
    try {
      if (isEditing && org) {
        await editMutation.mutateAsync({ code: org.code, payload: data });
      } else {
        await createMutation.mutateAsync(data);
      }
      handleOpenChange(false);
    } catch (err) {
      toast.error(getApiResponseError(err, { fallback: "Operation failed" }));
    }
  };

  const isDropdownLoading =
    countriesLoading ||
    statesLoading ||
    districtsLoading ||
    (selectedOrgType === "College" && affiliationsLoading);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        aria-describedby={undefined}
        className="w-[95vw] max-w-lg rounded-xl overflow-visible max-h-[90vh] overflow-y-auto"
      >
        <DialogHeader>
          <DialogTitle>
            {isEditing ? `Edit ${org?.org_type}` : `Add ${selectedOrgType}`}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="org-title">Organization Name</Label>
            <Input
              id="org-title"
              placeholder="Enter organization name"
              {...register("title")}
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title.message}</p>
            )}
          </div>

          {/* Code */}
          <div className="space-y-1.5">
            <Label htmlFor="org-code">Organization Code</Label>
            <Input
              id="org-code"
              placeholder="e.g. MUCET"
              {...register("code")}
            />
            {errors.code && (
              <p className="text-xs text-destructive">{errors.code.message}</p>
            )}
          </div>

          {/* Org Type */}
          <div className="space-y-1.5">
            <Label htmlFor="org-type">Organization Type</Label>
            <Controller
              name="org_type"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger id="org-type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {ORG_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* Country */}
          <div className="space-y-1.5">
            <Label htmlFor="org-country">Country</Label>
            <Controller
              name="country"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={countriesLoading}
                >
                  <SelectTrigger id="org-country">
                    <SelectValue
                      placeholder={
                        countriesLoading ? "Loading…" : "Select country"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent
                    position="popper"
                    side="bottom"
                    sideOffset={4}
                    className="max-h-[200px] overflow-y-auto"
                  >
                    {countries.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.country && (
              <p className="text-xs text-destructive">
                {errors.country.message}
              </p>
            )}
          </div>

          {/* State */}
          <div className="space-y-1.5">
            <Label htmlFor="org-state">State</Label>
            <Controller
              name="state"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={(val) => {
                    field.onChange(val);
                    setValue("district", "", { shouldDirty: true });
                  }}
                  value={field.value}
                  disabled={statesLoading}
                >
                  <SelectTrigger id="org-state">
                    <SelectValue
                      placeholder={statesLoading ? "Loading…" : "Select state"}
                    />
                  </SelectTrigger>
                  <SelectContent
                    position="popper"
                    side="bottom"
                    sideOffset={4}
                    className="max-h-[200px] overflow-y-auto"
                  >
                    {states.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.state && (
              <p className="text-xs text-destructive">{errors.state.message}</p>
            )}
          </div>

          {/* District */}
          <div className="space-y-1.5">
            <Label htmlFor="org-district">District</Label>
            <Controller
              name="district"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={districtsLoading}
                >
                  <SelectTrigger id="org-district">
                    <SelectValue
                      placeholder={
                        districtsLoading ? "Loading…" : "Select district"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent
                    position="popper"
                    side="bottom"
                    sideOffset={4}
                    className="max-h-[200px] overflow-y-auto"
                  >
                    {districts.map((d) => (
                      <SelectItem key={d.value} value={d.value}>
                        {d.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.district && (
              <p className="text-xs text-destructive">
                {errors.district.message}
              </p>
            )}
          </div>

          {/* Affiliation – College only */}
          {selectedOrgType === "College" && (
            <div className="space-y-1.5">
              <Label htmlFor="org-affiliation">Affiliation</Label>
              <Controller
                name="affiliation"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value ?? ""}
                    disabled={affiliationsLoading}
                  >
                    <SelectTrigger id="org-affiliation">
                      <SelectValue
                        placeholder={
                          affiliationsLoading
                            ? "Loading…"
                            : "Select affiliation"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent
                      position="popper"
                      side="bottom"
                      sideOffset={4}
                      className="max-h-[200px] overflow-y-auto"
                    >
                      {affiliations.map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || isDropdownLoading}>
              {isSubmitting
                ? isEditing
                  ? "Saving…"
                  : "Creating…"
                : isEditing
                  ? "Save Changes"
                  : "Create Organization"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
