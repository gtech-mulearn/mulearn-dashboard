"use client";

import { Map as MapIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import type { z } from "zod";
import { DataTableErrorBoundary } from "@/components/dashboard/DataTableErrorBoundary";
import { Blank } from "@/components/dashboard/table/Blank";
import Pagination from "@/components/dashboard/table/pagination";
import Table, { type Data } from "@/components/dashboard/table/Table";
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
  DistrictItemSchema,
  LocationItemSchema,
  StateItemSchema,
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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LocationManagementPage() {
  return (
    <DataTableErrorBoundary>
      <LocationContent />
    </DataTableErrorBoundary>
  );
}

function LocationContent() {
  const tabs = ["countries", "states", "zones", "districts"] as const;
  type TabType = (typeof tabs)[number];

  const [activeTab, setActiveTab] = useState<TabType>("countries");
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [search] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [open, setOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<LocationRow | null>(null);

  const params = { page, perPage, search, sortBy };

  // ─── Queries ───────────────────────────────────────────────────────────────

  const queryMap = {
    countries: useCountries(params),
    states: useStates(params),
    zones: useZones(params),
    districts: useDistricts(params),
  };

  const deleteMap = {
    countries: useDeleteCountry(),
    states: useDeleteState(),
    zones: useDeleteZone(),
    districts: useDeleteDistrict(),
  };

  const currentQuery = queryMap[activeTab];
  const currentDelete = deleteMap[activeTab];

  const rows = currentQuery.data?.data ?? [];
  const totalPages = currentQuery.data?.pagination?.totalPages ?? 1;
  const totalCount = currentQuery.data?.pagination?.count ?? 0;

  // ─── Mutations ─────────────────────────────────────────────────────────────

  const { mutateAsync: addCountry } = useAddCountry();
  const { mutateAsync: addState } = useAddState();
  const { mutateAsync: addZone } = useAddZone();
  const { mutateAsync: addDistrict } = useAddDistrict();

  const { mutateAsync: updateCountry } = useUpdateCountry();
  const { mutateAsync: updateState } = useUpdateState();
  const { mutateAsync: updateZone } = useUpdateZone();
  const { mutateAsync: updateDistrict } = useUpdateDistrict();

  // ─── Dropdowns — only needed when adding, not editing ──────────────────────

  const needsCountry = open && activeTab !== "countries"; // removed !editingItem
  const needsState =
    open && (activeTab === "zones" || activeTab === "districts");
  const needsZone = open && activeTab === "districts";

  const { data: countryList = [] } = useCountryDropdown(needsCountry);
  const { data: statesList = [] } = useStateDropdown(needsState);
  const { data: zonesList = [] } = useZoneDropdown(needsZone);

  // ─── Form ──────────────────────────────────────────────────────────────────

  const { register, handleSubmit, reset, control } = useForm<FormData>({
    defaultValues: {
      label: "",
      country: "",
      state: "",
      zone: "",
    },
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

  // ─── Submit ────────────────────────────────────────────────────────────────

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

        // Match label → UUID from dropdown lists
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

        if (activeTab === "countries") {
          await updateCountry({ id, label });
        } else if (activeTab === "states") {
          await updateState({ id, label, country: countryId });
        } else if (activeTab === "zones") {
          await updateZone({ id, label, country: countryId, state: stateId });
        } else {
          await updateDistrict({
            id,
            label,
            country: countryId,
            state: stateId,
            zone: zoneId,
          });
        }
      } else {
        if (activeTab === "countries") {
          await addCountry({ label });
        } else if (activeTab === "states") {
          await addState({ label, country });
        } else if (activeTab === "zones") {
          await addZone({ label, country, state });
        } else {
          await addDistrict({ label, country, state, zone });
        }
      }

      setOpen(false);
      setEditingItem(null);
      reset({ label: "", country: "", state: "", zone: "" });
    } catch (err) {
      console.error(err);
    }
  };

  // ─── Columns ───────────────────────────────────────────────────────────────

  const columnConfig = useMemo(() => {
    if (activeTab === "countries") {
      return [
        { column: "label", Label: "Country", isSortable: true },
        { column: "created_at", Label: "Created On", isSortable: true },
        { column: "created_by", Label: "Created By", isSortable: true },
        { column: "updated_by", Label: "Updated By", isSortable: true },
        { column: "updated_at", Label: "Updated On", isSortable: true },
      ];
    }
    if (activeTab === "states") {
      return [
        { column: "country", Label: "Country", isSortable: true },
        { column: "label", Label: "State", isSortable: true },
        { column: "created_at", Label: "Created On", isSortable: true },
        { column: "created_by", Label: "Created By", isSortable: true },
        { column: "updated_by", Label: "Updated By", isSortable: true },
        { column: "updated_at", Label: "Updated On", isSortable: true },
      ];
    }
    if (activeTab === "zones") {
      return [
        { column: "country", Label: "Country", isSortable: true },
        { column: "state", Label: "State", isSortable: true },
        { column: "label", Label: "Zone", isSortable: true },
        { column: "created_at", Label: "Created On", isSortable: true },
        { column: "created_by", Label: "Created By", isSortable: true },
        { column: "updated_by", Label: "Updated By", isSortable: true },
        { column: "updated_at", Label: "Updated On", isSortable: true },
      ];
    }
    return [
      { column: "country", Label: "Country", isSortable: true },
      { column: "state", Label: "State", isSortable: true },
      { column: "zone", Label: "Zone", isSortable: true },
      { column: "label", Label: "District", isSortable: true },
      { column: "created_at", Label: "Created On", isSortable: true },
      { column: "created_by", Label: "Created By", isSortable: true },
      { column: "updated_by", Label: "Updated By", isSortable: true },
      { column: "updated_at", Label: "Updated On", isSortable: true },
    ];
  }, [activeTab]);

  const singularize = (tab: TabType) => {
    const map: Record<TabType, string> = {
      countries: "Country",
      states: "State",
      zones: "Zone",
      districts: "District",
    };
    return map[tab];
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <Card className="border-0 bg-transparent shadow-none rounded-none">
      <CardHeader className="px-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MapIcon className="size-5 text-primary" />
            <CardTitle className="text-2xl font-bold">
              Location Management
            </CardTitle>
          </div>
          <Button
            onClick={() => {
              setEditingItem(null);
              setOpen(true);
            }}
          >
            Add {singularize(activeTab)}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="mt-6 p-0 space-y-6">
        {/* Tabs */}
        <div className="flex gap-2 border-b pb-2">
          {tabs.map((tab) => (
            <Button
              key={tab}
              variant="ghost"
              onClick={() => {
                setActiveTab(tab);
                setPage(1);
              }}
              className={`capitalize rounded-none border-b-2 ${
                activeTab === tab
                  ? "border-primary text-primary"
                  : "border-transparent"
              }`}
            >
              {tab}
            </Button>
          ))}
        </div>

        {/* Dialog */}
        <Dialog
          open={open}
          onOpenChange={(val) => {
            setOpen(val);
            if (!val) setEditingItem(null);
          }}
        >
          <DialogContent
            aria-describedby={undefined}
            className="overflow-visible max-h-[90vh]"
          >
            <DialogHeader>
              <DialogTitle>
                {editingItem
                  ? `Edit ${singularize(activeTab)}`
                  : `Add ${singularize(activeTab)}`}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input placeholder="Name" {...register("label")} />

              {/* Country — dropdown when adding, text input when editing */}
              {activeTab !== "countries" &&
                (editingItem ? (
                  <Input
                    placeholder="Country"
                    {...register("country")}
                    readOnly // 👈 prevent editing
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
                ))}

              {/* State — dropdown when adding, text input when editing */}
              {(activeTab === "zones" || activeTab === "districts") &&
                (editingItem ? (
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
                ))}

              {/* Zone — dropdown when adding, text input when editing */}
              {activeTab === "districts" &&
                (editingItem ? (
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
                ))}

              <Button type="submit">{editingItem ? "Update" : "Save"}</Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Table */}
        <Table
          rows={rows as unknown as Data[]}
          isloading={currentQuery.isLoading}
          page={page}
          perPage={perPage}
          columnOrder={columnConfig}
          id={["value"]}
          onDeleteClick={(id) => id && currentDelete.mutate(id)}
          onEditClick={(id) => {
            const fullRow = rows.find(
              (row: LocationRow) =>
                (row as LocationRow & { value: string }).value === id,
            );
            setEditingItem(fullRow ?? null);
            setOpen(true);
          }}
        >
          <THead
            columnOrder={columnConfig}
            onIconClick={(column) => {
              setSortBy(column);
              setPage(1);
            }}
            action
          />
          {!currentQuery.isLoading && (
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              handleNextClick={() => setPage((p) => p + 1)}
              handlePreviousClick={() => setPage((p) => p - 1)}
              perPage={perPage}
              totalCount={totalCount}
            />
          )}
          <Blank />
        </Table>
      </CardContent>
    </Card>
  );
}
