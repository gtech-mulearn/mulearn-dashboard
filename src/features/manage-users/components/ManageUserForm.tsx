"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
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
  useAreasOfInterest,
  useCollegesByDistrict,
  useCommunities,
  useCountries,
  useDistricts,
  useLocationSearch,
  useRoles,
  useSchoolsByDistrict,
  useStates,
} from "../hooks";
import {
  type ManageUserDetail,
  type ManageUserFormValues,
  ManageUserFormSchema,
  toManageUserFormValues,
} from "../schemas";

interface ManageUserFormProps {
  initial?: ManageUserDetail | null;
  loading?: boolean;
  pending?: boolean;
  submitLabel?: string;
  onCancel: () => void;
  onSubmit: (values: ManageUserFormValues) => Promise<void>;
}

type Option = {
  id: string;
  label: string;
};

function normalizeOrgType(value: string) {
  const lower = value.trim().toLowerCase();
  if (lower.includes("college")) return "college";
  if (lower.includes("school")) return "school";
  return "";
}

function withSelectedOption(options: Option[], selected?: string) {
  const value = selected?.trim();
  if (!value) return options;
  if (options.some((option) => option.id === value)) return options;
  return [{ id: value, label: value }, ...options];
}

function MultiSelectDropdown({
  label,
  placeholder,
  options,
  values,
  onChange,
  loading = false,
}: {
  label: string;
  placeholder: string;
  options: Option[];
  values: string[];
  onChange: (values: string[]) => void;
  loading?: boolean;
}) {
  const [selectKey, setSelectKey] = useState(0);
  const selected = new Set(values);

  const selectedOptions = options.filter((option) => selected.has(option.id));
  const availableOptions = options.filter((option) => !selected.has(option.id));

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="border-border bg-muted/30 min-h-11 rounded-md border p-2">
        <div className="flex flex-wrap gap-2">
          {selectedOptions.length > 0 ? (
            selectedOptions.map((option) => (
              <span
                key={option.id}
                className="bg-accent text-accent-foreground inline-flex items-center gap-1 rounded-sm px-2 py-1 text-sm"
              >
                {option.label}
                <button
                  type="button"
                  onClick={() =>
                    onChange(values.filter((value) => value !== option.id))
                  }
                  aria-label={`Remove ${option.label}`}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            ))
          ) : (
            <span className="text-muted-foreground text-sm">No selections</span>
          )}
        </div>
      </div>
      <Select
        key={selectKey}
        disabled={loading}
        onValueChange={(value) => {
          if (value === "__none") return;
          onChange([...values, value]);
          setSelectKey((current) => current + 1);
        }}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {loading ? (
            <SelectItem value="__loading" disabled>
              Loading options...
            </SelectItem>
          ) : availableOptions.length > 0 ? (
            availableOptions.map((option) => (
              <SelectItem key={option.id} value={option.id}>
                {option.label}
              </SelectItem>
            ))
          ) : (
            <SelectItem value="__none" disabled>
              No more options
            </SelectItem>
          )}
        </SelectContent>
      </Select>
    </div>
  );
}

export function ManageUserForm({
  initial,
  loading = false,
  pending = false,
  submitLabel = "Save",
  onCancel,
  onSubmit,
}: ManageUserFormProps) {
  const form = useForm<
    z.input<typeof ManageUserFormSchema>,
    unknown,
    ManageUserFormValues
  >({
    resolver: zodResolver(ManageUserFormSchema),
    defaultValues: toManageUserFormValues(initial),
  });

  const {
    register,
    control,
    watch,
    setValue,
    reset,
    handleSubmit,
    formState: { errors },
  } = form;

  useEffect(() => {
    reset(toManageUserFormValues(initial));
  }, [initial, reset]);

  const roleQ = useRoles();
  const communitiesQ = useCommunities();
  const interestsQ = useAreasOfInterest();
  const countriesQ = useCountries();

  const selectedCountry = watch("organization.country") ?? "";
  const selectedState = watch("organization.state") ?? "";
  const selectedDistrict = watch("organization.district") ?? "";
  const selectedOrg = watch("organization.org") ?? "";
  const selectedDepartment = watch("organization.department") ?? "";
  const orgType = watch("organization.org_type") ?? "";
  const normalizedOrgType = normalizeOrgType(orgType);

  const statesQ = useStates(selectedCountry, !!selectedCountry);
  const districtsQ = useDistricts(selectedState, !!selectedState);

  const locationQuery = watch("location_query") ?? "";
  const [debouncedLocationQuery, setDebouncedLocationQuery] =
    useState(locationQuery);
  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedLocationQuery(locationQuery);
    }, 300);
    return () => window.clearTimeout(timeout);
  }, [locationQuery]);

  const locationQ = useLocationSearch(
    debouncedLocationQuery.trim() || "india",
    true,
  );

  const collegesQ = useCollegesByDistrict(selectedDistrict, !!selectedDistrict);
  const schoolsQ = useSchoolsByDistrict(selectedDistrict, !!selectedDistrict);

  const roleOptions = useMemo<Option[]>(
    () =>
      (roleQ.data ?? []).map((item) => ({
        id: String(item.id),
        label: item.title,
      })),
    [roleQ.data],
  );

  const communityOptions = useMemo<Option[]>(
    () =>
      (communitiesQ.data ?? []).map((item) => ({
        id: String(item.id),
        label: item.title,
      })),
    [communitiesQ.data],
  );

  const interestOptions = useMemo<Option[]>(
    () =>
      (interestsQ.data ?? []).map((item) => ({
        id: String(item.id),
        label: item.name,
      })),
    [interestsQ.data],
  );

  const countryOptions = useMemo<Option[]>(
    () =>
      (countriesQ.data ?? []).map((item) => ({
        id: String(item.id),
        label: item.name,
      })),
    [countriesQ.data],
  );

  const stateOptions = useMemo<Option[]>(
    () =>
      (statesQ.data ?? []).map((item) => ({
        id: String(item.id),
        label: item.name,
      })),
    [statesQ.data],
  );

  const districtOptions = useMemo<Option[]>(
    () =>
      (districtsQ.data ?? []).map((item) => ({
        id: String(item.id),
        label: item.name,
      })),
    [districtsQ.data],
  );

  const locationOptions = useMemo<Option[]>(
    () =>
      (locationQ.data ?? []).map((item) => ({
        id: String(item.id),
        label: item.location,
      })),
    [locationQ.data],
  );

  const organizationOptions = useMemo<Option[]>(() => {
    if (normalizedOrgType === "college") {
      return (collegesQ.data?.colleges ?? []).map((item) => ({
        id: String(item.id),
        label: item.title,
      }));
    }
    if (normalizedOrgType === "school") {
      return (schoolsQ.data ?? []).map((item) => ({
        id: String(item.id),
        label: item.title,
      }));
    }
    return [];
  }, [collegesQ.data, normalizedOrgType, schoolsQ.data]);

  const departmentOptions = useMemo<Option[]>(
    () =>
      (collegesQ.data?.departments ?? []).map((item) => ({
        id: String(item.id),
        label: item.title,
      })),
    [collegesQ.data],
  );

  const organizationOptionsWithSelected = useMemo(
    () => withSelectedOption(organizationOptions, selectedOrg),
    [organizationOptions, selectedOrg],
  );
  const departmentOptionsWithSelected = useMemo(
    () => withSelectedOption(departmentOptions, selectedDepartment),
    [departmentOptions, selectedDepartment],
  );

  useEffect(() => {
    const normalized = normalizeOrgType(orgType);
    if (normalized && normalized !== orgType) {
      setValue("organization.org_type", normalized);
    }
  }, [orgType, setValue]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <section className="space-y-3">
        <h3 className="text-base font-semibold">Basic Info</h3>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name</Label>
            <Input id="full_name" {...register("full_name")} />
            {errors.full_name?.message ? (
              <p className="text-destructive text-sm">
                {errors.full_name.message}
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register("email")} />
            {errors.email?.message ? (
              <p className="text-destructive text-sm">{errors.email.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="mobile">Mobile</Label>
            <Input id="mobile" {...register("mobile")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="discord_id">Discord ID</Label>
            <Input id="discord_id" {...register("discord_id")} />
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-base font-semibold">Access and Interests</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <Controller
            control={control}
            name="role"
            render={({ field }) => (
              <MultiSelectDropdown
                label="Roles"
                placeholder="Select roles"
                options={roleOptions}
                values={field.value ?? []}
                onChange={field.onChange}
                loading={roleQ.isLoading}
              />
            )}
          />
          <Controller
            control={control}
            name="communities"
            render={({ field }) => (
              <MultiSelectDropdown
                label="Communities"
                placeholder="Select communities"
                options={communityOptions}
                values={field.value ?? []}
                onChange={field.onChange}
                loading={communitiesQ.isLoading}
              />
            )}
          />
          <Controller
            control={control}
            name="interest_groups"
            render={({ field }) => (
              <MultiSelectDropdown
                label="Interest Groups"
                placeholder="Select interest groups"
                options={interestOptions}
                values={field.value ?? []}
                onChange={field.onChange}
                loading={interestsQ.isLoading}
              />
            )}
          />
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-base font-semibold">College / School</h3>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="location_query">Location</Label>
            <Input
              id="location_query"
              placeholder="Search location"
              {...register("location_query")}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>Location Result</Label>
            <Select
              onValueChange={(value) => {
                const selected = locationOptions.find(
                  (item) => item.id === value,
                );
                if (!selected) return;
                setValue("location_query", selected.label);
                setValue("organization.district", selected.id);
                setValue("organization.org", "");
                setValue("organization.department", "");
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select location option" />
              </SelectTrigger>
              <SelectContent>
                {locationQ.isLoading ? (
                  <SelectItem value="__loading" disabled>
                    Loading locations...
                  </SelectItem>
                ) : locationOptions.length > 0 ? (
                  locationOptions.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.label}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="__none" disabled>
                    No locations available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Country</Label>
            <Controller
              control={control}
              name="organization.country"
              render={({ field }) => (
                <Select
                  value={field.value || ""}
                  onValueChange={(value) => {
                    field.onChange(value);
                    setValue("organization.state", "");
                    setValue("organization.district", "");
                    setValue("organization.org", "");
                    setValue("organization.department", "");
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countriesQ.isLoading ? (
                      <SelectItem value="__loading" disabled>
                        Loading countries...
                      </SelectItem>
                    ) : countryOptions.length > 0 ? (
                      countryOptions.map((option) => (
                        <SelectItem key={option.id} value={option.id}>
                          {option.label}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="__none" disabled>
                        No countries available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label>State</Label>
            <Controller
              control={control}
              name="organization.state"
              render={({ field }) => (
                <Select
                  value={field.value || ""}
                  onValueChange={(value) => {
                    field.onChange(value);
                    setValue("organization.district", "");
                    setValue("organization.org", "");
                    setValue("organization.department", "");
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {statesQ.isLoading ? (
                      <SelectItem value="__loading" disabled>
                        Loading states...
                      </SelectItem>
                    ) : stateOptions.length > 0 ? (
                      stateOptions.map((option) => (
                        <SelectItem key={option.id} value={option.id}>
                          {option.label}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="__none" disabled>
                        Select country first
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label>District</Label>
            <Controller
              control={control}
              name="organization.district"
              render={({ field }) => (
                <Select
                  value={field.value || ""}
                  onValueChange={(value) => {
                    field.onChange(value);
                    setValue("organization.org", "");
                    setValue("organization.department", "");
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select district" />
                  </SelectTrigger>
                  <SelectContent>
                    {districtsQ.isLoading ? (
                      <SelectItem value="__loading" disabled>
                        Loading districts...
                      </SelectItem>
                    ) : districtOptions.length > 0 ? (
                      districtOptions.map((option) => (
                        <SelectItem key={option.id} value={option.id}>
                          {option.label}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="__none" disabled>
                        Select state first
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label>Organization Type</Label>
            <Controller
              control={control}
              name="organization.org_type"
              render={({ field }) => (
                <Select
                  value={normalizeOrgType(field.value || "")}
                  onValueChange={(value) => {
                    field.onChange(value);
                    setValue("organization.org", "");
                    setValue("organization.department", "");
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select organization type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="college">College</SelectItem>
                    <SelectItem value="school">School</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>College / School</Label>
            <Controller
              control={control}
              name="organization.org"
              render={({ field }) => (
                <Select
                  value={field.value || ""}
                  onValueChange={(value) => {
                    field.onChange(value);
                    setValue("organization.org", value, {
                      shouldDirty: true,
                      shouldValidate: true,
                    });
                  }}
                  disabled={!normalizedOrgType || !selectedDistrict}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select organization" />
                  </SelectTrigger>
                  <SelectContent>
                    {collegesQ.isLoading || schoolsQ.isLoading ? (
                      <SelectItem value="__loading" disabled>
                        Loading organizations...
                      </SelectItem>
                    ) : organizationOptionsWithSelected.length > 0 ? (
                      organizationOptionsWithSelected.map((option) => (
                        <SelectItem key={option.id} value={option.id}>
                          {option.label}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="__none" disabled>
                        No organizations available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label>Department</Label>
            <Controller
              control={control}
              name="organization.department"
              render={({ field }) => (
                <Select
                  value={field.value || ""}
                  onValueChange={field.onChange}
                  disabled={normalizeOrgType(orgType) !== "college"}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {collegesQ.isLoading ? (
                      <SelectItem value="__loading" disabled>
                        Loading departments...
                      </SelectItem>
                    ) : departmentOptionsWithSelected.length > 0 ? (
                      departmentOptionsWithSelected.map((option) => (
                        <SelectItem key={option.id} value={option.id}>
                          {option.label}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="__none" disabled>
                        No departments available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label>Year</Label>
            <Input {...register("organization.graduation_year")} />
          </div>
        </div>
      </section>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading || pending}>
          {loading || pending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
