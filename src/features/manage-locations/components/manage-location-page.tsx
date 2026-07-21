"use client";

import { Map as MapIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import type { z } from "zod";
import { DataTableErrorBoundary } from "@/components/dashboard/DataTableErrorBoundary";
import { Blank } from "@/components/dashboard/table/Blank";
import Pagination from "@/components/dashboard/table/pagination";
import ReusableTable, { type Data } from "@/components/dashboard/table/Table";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useAddCountry,
  useAddDistrict,
  useAddState,
  useAddZone,
  useCountries,
  useCountryDropdown,
  useDeleteCountry,
  useDeleteDistrict,
  useDeleteState,
  useDeleteZone,
  useDistricts,
  useStateDropdown,
  useStates,
  useUpdateCountry,
  useUpdateDistrict,
  useUpdateState,
  useUpdateZone,
  useZoneDropdown,
  useZones,
} from "../hooks";

import type {
  CreateCountryInput,
  CreateDistrictInput,
  CreateStateInput,
  CreateZoneInput,
  DistrictItemSchema,
  LocationItemSchema,
  StateItemSchema,
  UpdateCountryInput,
  UpdateDistrictInput,
  UpdateStateInput,
  UpdateZoneInput,
  ZoneItemSchema,
} from "../schema";

// ─── Types ────────────────────────────────────────────────────────────────────

type LocationRow =
  | z.infer<typeof LocationItemSchema>
  | z.infer<typeof StateItemSchema>
  | z.infer<typeof ZoneItemSchema>
  | z.infer<typeof DistrictItemSchema>;

type DropdownOption = { label: string; value: string };

type FormData = {
  label: string;
  country: string;
  state: string;
  zone: string;
};

type MutationFn<TInput> = (data: TInput) => Promise<void>;

const TABS = ["countries", "states", "zones", "districts"] as const;
type TabType = (typeof TABS)[number];

const SINGULAR: Record<TabType, string> = {
  countries: "Country",
  states: "State",
  zones: "Zone",
  districts: "District",
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LocationManagementPage() {
  return (
    <DataTableErrorBoundary>
      <LocationContent />
    </DataTableErrorBoundary>
  );
}

function LocationContent() {
  const [activeTab, setActiveTab] = useState<TabType>("countries");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [open, setOpen] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    label: string;
  } | null>(null);
  const [editingItem, setEditingItem] = useState<LocationRow | null>(null);

  const params = { page, perPage, search, sortBy };

  const countriesQuery = useCountries({
    ...params,
    enabled: activeTab === "countries",
  });
  const statesQuery = useStates({ ...params, enabled: activeTab === "states" });
  const zonesQuery = useZones({ ...params, enabled: activeTab === "zones" });
  const districtsQuery = useDistricts({
    ...params,
    enabled: activeTab === "districts",
  });

  const queryMap = {
    countries: countriesQuery,
    states: statesQuery,
    zones: zonesQuery,
    districts: districtsQuery,
  };

  const deleteMap = {
    countries: useDeleteCountry(),
    states: useDeleteState(),
    zones: useDeleteZone(),
    districts: useDeleteDistrict(),
  };

  const currentQuery = queryMap[activeTab];
  const currentDelete = deleteMap[activeTab];

  const rows = (currentQuery.data?.data ?? []) as unknown as Data[];
  const totalPages = currentQuery.data?.pagination?.totalPages ?? 1;
  const totalCount = currentQuery.data?.pagination?.count ?? 0;

  // ─── Mutations ─────────────────────────────────────────────────────────────

  const addCountry: MutationFn<CreateCountryInput> =
    useAddCountry().mutateAsync;
  const addState: MutationFn<CreateStateInput> = useAddState().mutateAsync;
  const addZone: MutationFn<CreateZoneInput> = useAddZone().mutateAsync;
  const addDistrict: MutationFn<CreateDistrictInput> =
    useAddDistrict().mutateAsync;

  const updateCountry: MutationFn<UpdateCountryInput> =
    useUpdateCountry().mutateAsync;
  const updateState: MutationFn<UpdateStateInput> =
    useUpdateState().mutateAsync;
  const updateZone: MutationFn<UpdateZoneInput> = useUpdateZone().mutateAsync;
  const updateDistrict: MutationFn<UpdateDistrictInput> =
    useUpdateDistrict().mutateAsync;

  // ─── Dropdowns ─────────────────────────────────────────────────────────────

  const showCountryField =
    activeTab === "states" || (editingItem && activeTab !== "countries");
  const showStateField =
    activeTab === "zones" || (editingItem && activeTab === "districts");

  const needsCountry = open && activeTab === "states";
  const needsState = open && activeTab === "zones";
  const needsZone = open && activeTab === "districts";

  const { data: countryList = [], isLoading: countryListLoading } =
    useCountryDropdown(needsCountry);
  const { data: statesList = [], isLoading: statesListLoading } =
    useStateDropdown(needsState);
  const { data: zonesList = [], isLoading: zonesListLoading } =
    useZoneDropdown(needsZone);

  // ─── Form ──────────────────────────────────────────────────────────────────

  const { register, handleSubmit, reset, control } = useForm<FormData>({
    defaultValues: { label: "", country: "", state: "", zone: "" },
  });

  useEffect(() => {
    if (!open) return;
    if (editingItem) {
      reset({
        label: (editingItem as LocationRow & { label?: string }).label ?? "",
        country:
          (editingItem as LocationRow & { country?: string }).country ?? "",
        state: (editingItem as LocationRow & { state?: string }).state ?? "",
        zone: (editingItem as LocationRow & { zone?: string }).zone ?? "",
      });
    } else {
      reset({ label: "", country: "", state: "", zone: "" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingItem, open, reset]);

  // ─── Submit ───────────────────────

  const onSubmit = async (data: FormData) => {
    try {
      const { label, country, state, zone } = data;

      if (editingItem) {
        const id = (editingItem as LocationRow & { value: string }).value;
        const existingCountryLabel =
          (editingItem as LocationRow & { country?: string }).country ?? "";
        const existingStateLabel =
          (editingItem as LocationRow & { state?: string }).state ?? "";
        const existingZoneLabel =
          (editingItem as LocationRow & { zone?: string }).zone ?? "";

        const countryId =
          (countryList as DropdownOption[]).find(
            (c) => c.label.toLowerCase() === existingCountryLabel.toLowerCase(),
          )?.value ?? "";

        const stateId =
          (statesList as DropdownOption[]).find(
            (s) => s.label.toLowerCase() === existingStateLabel.toLowerCase(),
          )?.value ?? "";

        const zoneId =
          (zonesList as DropdownOption[]).find(
            (z) => z.label.toLowerCase() === existingZoneLabel.toLowerCase(),
          )?.value ?? "";

        if (activeTab === "states" && !countryId) {
          return;
        }
        if (activeTab === "zones" && !stateId) {
          return;
        }
        if (activeTab === "districts" && !zoneId) {
          return;
        }

        if (activeTab === "countries") {
          await updateCountry({ id, label });
        } else if (activeTab === "states") {
          await updateState({ id, label, country: countryId });
        } else if (activeTab === "zones") {
          await updateZone({ id, label, state: stateId });
        } else {
          await updateDistrict({
            id,
            label,
            zone: zoneId,
          });
        }
      } else {
        if (activeTab === "countries") {
          await addCountry({ label });
        } else if (activeTab === "states") {
          await addState({ label, country });
        } else if (activeTab === "zones") {
          await addZone({ label, state });
        } else {
          await addDistrict({ label, zone });
        }
      }

      setOpen(false);
      setEditingItem(null);
      reset({ label: "", country: "", state: "", zone: "" });
    } catch {
      // Handled by the entity-specific add/update mutation's onError toast.
    }
  };

  // ─── Dropdown loading guard for edit mode ──────────────────────────────────

  const isDropdownLoading =
    (needsCountry && countryListLoading) ||
    (needsState && statesListLoading) ||
    (needsZone && zonesListLoading);

  // ─── Columns ───────────────────────────────────────────────────────────────

  const columnConfig = useMemo(() => {
    const base = [
      { column: "created_at", Label: "Created On", isSortable: true },
      { column: "created_by", Label: "Created By", isSortable: true },
      { column: "updated_by", Label: "Updated By", isSortable: true },
      { column: "updated_at", Label: "Updated On", isSortable: true },
    ];
    if (activeTab === "countries") {
      return [{ column: "label", Label: "Country", isSortable: true }, ...base];
    }
    if (activeTab === "states") {
      return [
        { column: "country", Label: "Country", isSortable: true },
        { column: "label", Label: "State", isSortable: true },
        ...base,
      ];
    }
    if (activeTab === "zones") {
      return [
        { column: "country", Label: "Country", isSortable: true },
        { column: "state", Label: "State", isSortable: true },
        { column: "label", Label: "Zone", isSortable: true },
        ...base,
      ];
    }
    return [
      { column: "country", Label: "Country", isSortable: true },
      { column: "state", Label: "State", isSortable: true },
      { column: "zone", Label: "Zone", isSortable: true },
      { column: "label", Label: "District", isSortable: true },
      ...base,
    ];
  }, [activeTab]);

  const handleDeleteClick = (id: string) => {
    const row = (currentQuery.data?.data ?? []).find(
      (r: LocationRow) => (r as LocationRow & { value: string }).value === id,
    );
    const label = (row as LocationRow & { label?: string })?.label ?? id;
    setDeleteTarget({ id, label });
    setOpenDelete(true);
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    currentDelete.mutate(deleteTarget.id, {
      onSuccess: () => {
        setOpenDelete(false);
        setDeleteTarget(null);
      },
      onError: () => {
        setOpenDelete(false);
        setDeleteTarget(null);
      },
    });
  };

  const customCellRender = (column: string, row: Data) => {
    if (column === "label") {
      return <span className="font-medium">{String(row.label ?? "")}</span>;
    }
    return null;
  };

  const customActionRender = (row: Data) => {
    const rawRow = row as unknown as LocationRow & {
      value: string;
      label?: string;
    };
    return (
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setEditingItem(rawRow as LocationRow);
            setOpen(true);
          }}
          aria-label={`Edit ${rawRow.label}`}
        >
          Edit
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => handleDeleteClick(rawRow.value)}
          aria-label={`Delete ${rawRow.label}`}
        >
          Delete
        </Button>
      </div>
    );
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <Card className="border-0 bg-transparent shadow-none rounded-none">
      <CardHeader className="px-0">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <MapIcon className="size-5 text-primary" />
            <CardTitle className="text-2xl font-bold">
              Location Management
            </CardTitle>
          </div>
          <Button
            className="w-full sm:w-auto"
            onClick={() => {
              setEditingItem(null);
              setOpen(true);
            }}
            aria-label={`Add ${SINGULAR[activeTab]}`}
          >
            Add {SINGULAR[activeTab]}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="mt-6 p-0 space-y-6">
        {/* Tabs */}
        <div className="flex overflow-x-auto gap-1 pb-0 no-scrollbar">
          {TABS.map((tab) => (
            <Button
              key={tab}
              variant={activeTab === tab ? "default" : "outline"}
              onClick={() => {
                setActiveTab(tab);
                setPage(1);
                setSearch("");
              }}
              className="capitalize shrink-0"
              aria-label={`${tab} tab`}
            >
              {tab}
            </Button>
          ))}
        </div>

        <TableTop
          onSearchText={(val) => {
            setSearch(val);
            setPage(1);
          }}
          onPerPageNumber={(val) => {
            setPerPage(val);
            setPage(1);
          }}
          CSV=""
          perPage={perPage}
          perPageOptions={[10, 25, 50]}
          searchPlaceholder={`Search ${activeTab}...`}
          searchSize="md"
          searchPosition="left"
        />

        <ReusableTable
          rows={rows}
          isLoading={currentQuery.isLoading}
          page={page}
          perPage={perPage}
          columnOrder={columnConfig}
          id={["value"]}
          customCellRender={customCellRender}
          customActionRender={customActionRender}
        >
          <THead
            columnOrder={columnConfig}
            onIconClick={(column) => {
              setSortBy(column);
              setPage(1);
            }}
            action
          />
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            perPage={perPage}
            totalCount={totalCount}
            handlePreviousClick={() => setPage((p) => Math.max(p - 1, 1))}
            handleNextClick={() => setPage((p) => Math.min(p + 1, totalPages))}
          />
          <Blank />
        </ReusableTable>
      </CardContent>

      {/* Add / Edit Dialog */}
      <Dialog
        open={open}
        onOpenChange={(val) => {
          setOpen(val);
          if (!val) setEditingItem(null);
        }}
      >
        <DialogContent
          aria-describedby={undefined}
          className="w-[95vw] max-w-md rounded-lg overflow-visible max-h-[90vh]"
        >
          <DialogHeader>
            <DialogTitle>
              {editingItem
                ? `Edit ${SINGULAR[activeTab]}`
                : `Add ${SINGULAR[activeTab]}`}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <label
                htmlFor="location-label"
                className="text-sm text-muted-foreground"
              >
                Name
              </label>
              <Input
                id="location-label"
                placeholder="Name"
                {...register("label")}
              />
            </div>

            {/* Country */}
            {showCountryField && (
              <div className="space-y-1">
                <label
                  htmlFor="country"
                  className="text-sm text-muted-foreground"
                >
                  Country
                </label>
                {editingItem ? (
                  <Input
                    placeholder="Country"
                    {...register("country")}
                    readOnly
                    className="bg-muted cursor-not-allowed opacity-60"
                  />
                ) : (
                  <Controller
                    name="country"
                    control={control}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value ?? ""}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Country" />
                        </SelectTrigger>
                        <SelectContent
                          position="popper"
                          side="bottom"
                          sideOffset={4}
                          className="max-h-[200px] overflow-y-auto"
                        >
                          {(countryList as DropdownOption[]).map((c) => (
                            <SelectItem key={c.value} value={c.value}>
                              {c.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                )}
              </div>
            )}

            {/* State */}
            {showStateField && (
              <div className="space-y-1">
                <label
                  htmlFor="state"
                  className="text-sm text-muted-foreground"
                >
                  State
                </label>
                {editingItem ? (
                  <Input
                    placeholder="State"
                    {...register("state")}
                    readOnly
                    className="bg-muted cursor-not-allowed opacity-60"
                  />
                ) : (
                  <Controller
                    name="state"
                    control={control}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value ?? ""}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select State" />
                        </SelectTrigger>
                        <SelectContent
                          position="popper"
                          side="bottom"
                          sideOffset={4}
                          className="max-h-[200px] overflow-y-auto"
                        >
                          {(statesList as DropdownOption[]).map((s) => (
                            <SelectItem key={s.value} value={s.value}>
                              {s.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                )}
              </div>
            )}

            {/* Zone */}
            {activeTab === "districts" && (
              <div className="space-y-1">
                <label
                  htmlFor="district"
                  className="text-sm text-muted-foreground"
                >
                  Zone
                </label>
                {editingItem ? (
                  <Input
                    placeholder="Zone"
                    {...register("zone")}
                    readOnly
                    className="bg-muted cursor-not-allowed opacity-60"
                  />
                ) : (
                  <Controller
                    name="zone"
                    control={control}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value ?? ""}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Zone" />
                        </SelectTrigger>
                        <SelectContent
                          position="popper"
                          side="bottom"
                          sideOffset={4}
                          className="max-h-[200px] overflow-y-auto"
                        >
                          {(zonesList as DropdownOption[]).map((z) => (
                            <SelectItem key={z.value} value={z.value}>
                              {z.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                )}
              </div>
            )}

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setOpen(false);
                  setEditingItem(null);
                }}
                aria-label="Cancel"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isDropdownLoading}
                aria-label={editingItem ? "Update location" : "Save location"}
              >
                {isDropdownLoading
                  ? "Loading..."
                  : editingItem
                    ? "Update"
                    : "Save"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDelete}
        onOpenChange={(val) => {
          setOpenDelete(val);
          if (!val) setDeleteTarget(null);
        }}
      >
        <DialogContent className="w-[95vw] max-w-sm rounded-lg">
          <DialogHeader>
            <DialogTitle>Delete {SINGULAR[activeTab]}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-foreground">
              {deleteTarget?.label}
            </span>
            ? This action cannot be undone.
          </p>
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => {
                setOpenDelete(false);
                setDeleteTarget(null);
              }}
              aria-label="Cancel delete"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={currentDelete.isPending}
              onClick={handleConfirmDelete}
              aria-label="Confirm delete"
            >
              {currentDelete.isPending ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
