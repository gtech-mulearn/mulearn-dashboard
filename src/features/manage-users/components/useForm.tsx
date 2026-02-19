"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2 } from "lucide-react";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import Loader from "@/app/loading";
import { Button } from "@/components/ui/button";
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
  useCollegeData,
  useDistricts,
  useLocationSearch,
  useManageUserDetail,
  useManageUsersMeta,
  useStates,
  useUpdateManageUser,
} from "../hooks";
import { ManageUserFormSchema, type ManageUserFormValues } from "../schemas";
import { LocationSearchDropdown } from "./location-search-dropdown";
import { MultiSelectDropdown } from "./multi-select-dropdown";

type Props = { id: string; closeModal: () => void; formId?: string };
type DirtyFields = Partial<Record<keyof ManageUserFormValues, boolean>>;

function resolveOptionValue(
  raw: string | null | undefined,
  options: { value: string; label: string }[],
) {
  if (!raw) return "";
  const normalizedRaw = raw.trim().toLowerCase();
  const byValue = options.find(
    (option) => option.value.trim().toLowerCase() === normalizedRaw,
  );
  if (byValue) return byValue.value;
  const byLabel = options.find(
    (option) => option.label.trim().toLowerCase() === normalizedRaw,
  );
  return byLabel?.value ?? "";
}

function normalizePayload(values: ManageUserFormValues, dirty: DirtyFields) {
  const payload: Record<string, unknown> = {};

  if (dirty.full_name) payload.full_name = values.full_name;
  if (dirty.email) payload.email = values.email;
  if (dirty.mobile) payload.mobile = values.mobile;
  if (dirty.discord_id) payload.discord_id = values.discord_id;
  if (dirty.roles) payload.roles = values.roles;
  if (dirty.interest_groups) payload.interest_groups = values.interest_groups;

  if (dirty.location_id || dirty.district_id) {
    payload.district = values.location_id || values.district_id;
  }

  if (dirty.college_id || dirty.communities || dirty.department_id) {
    payload.organizations = values.college_id
      ? [values.college_id, ...values.communities]
      : values.communities;
    payload.community = values.communities;
    payload.department = values.department_id;
  }

  if (dirty.graduation_year) {
    payload.graduation_year = values.graduation_year
      ? Number(values.graduation_year)
      : undefined;
  }

  Object.keys(payload).forEach((key) => {
    const value = payload[key];
    const isEmptyString = typeof value === "string" && value.trim() === "";
    const isEmptyArray = Array.isArray(value) && value.length === 0;

    if (
      value === undefined ||
      value === null ||
      isEmptyString ||
      isEmptyArray
    ) {
      delete payload[key];
    }
  });

  return payload;
}

const UserForm = forwardRef<{ handleSubmitExternally: () => void }, Props>(
  ({ id, closeModal, formId = "manage-users-edit-form" }, ref) => {
    const { data: detail, isLoading: isDetailLoading } = useManageUserDetail(
      id || null,
      Boolean(id),
    );
    const { data: meta, isLoading: isMetaLoading } = useManageUsersMeta(
      Boolean(id),
    );
    const updateUserMutation = useUpdateManageUser();

    const [locationSearch, setLocationSearch] = useState("");
    const [isLocationMenuOpen, setIsLocationMenuOpen] = useState(false);

    const form = useForm<ManageUserFormValues>({
      resolver: zodResolver(ManageUserFormSchema),
      defaultValues: {
        full_name: "",
        email: "",
        mobile: "",
        discord_id: "",
        location_id: "",
        communities: [],
        roles: [],
        interest_groups: [],
        country_id: "",
        state_id: "",
        district_id: "",
        college_id: "",
        department_id: "",
        graduation_year: "",
      },
    });

    const countryId = form.watch("country_id") || "";
    const stateId = form.watch("state_id") || "";
    const districtId = form.watch("district_id") || "";

    const { data: locationOptions = [], isFetching: isLocationFetching } =
      useLocationSearch(locationSearch);
    const { data: states = [] } = useStates(countryId);
    const { data: districts = [] } = useDistricts(stateId);
    const { data: collegeData } = useCollegeData(districtId);

    const colleges = collegeData?.colleges ?? [];
    const departments = collegeData?.departments ?? [];
    const isBusy =
      isDetailLoading || isMetaLoading || updateUserMutation.isPending;

    const fieldClassName =
      "h-12 rounded-2xl border border-border bg-muted px-4 text-base focus-visible:ring-1 focus-visible:ring-primary/20";
    const selectTriggerClassName =
      "h-12 w-full rounded-2xl border border-border bg-muted px-3.5 text-base";

    useEffect(() => {
      if (!detail) return;

      const organizations = detail.organizations ?? [];
      const collegeOrg = organizations.find((org) => {
        const type = (org.org_type ?? "").toLowerCase();
        return type === "college" || type === "school";
      });

      const selectedCommunities = organizations
        .filter((org) => (org.org_type ?? "").toLowerCase() === "community")
        .map((org) => org.org);

      const selectedRoles = detail.roles?.length
        ? detail.roles
        : (detail.role ?? []);

      form.reset({
        full_name: detail.full_name ?? "",
        email: detail.email ?? "",
        mobile: detail.mobile ?? "",
        discord_id: detail.discord_id ?? "",
        location_id: detail.district ?? "",
        communities: selectedCommunities,
        roles: selectedRoles,
        interest_groups: detail.interest_groups ?? [],
        country_id: resolveOptionValue(
          collegeOrg?.country,
          meta?.countries ?? [],
        ),
        state_id: collegeOrg?.state ?? "",
        district_id: collegeOrg?.district ?? "",
        college_id: collegeOrg?.org ?? "",
        department_id: collegeOrg?.department ?? "",
        graduation_year: collegeOrg?.graduation_year
          ? String(collegeOrg.graduation_year)
          : "",
      });

      setLocationSearch("");
    }, [detail, form, meta?.countries]);

    // Resolve prefilled label values to option ids once cascading options are loaded.
    useEffect(() => {
      if (!detail) return;
      const organizations = detail.organizations ?? [];
      const collegeOrg = organizations.find((org) => {
        const type = (org.org_type ?? "").toLowerCase();
        return type === "college" || type === "school";
      });
      if (!collegeOrg) return;

      const resolvedState = resolveOptionValue(collegeOrg.state, states);
      if (resolvedState && form.getValues("state_id") !== resolvedState) {
        form.setValue("state_id", resolvedState, { shouldDirty: false });
      }

      const resolvedDistrict = resolveOptionValue(
        collegeOrg.district,
        districts,
      );
      if (
        resolvedDistrict &&
        form.getValues("district_id") !== resolvedDistrict
      ) {
        form.setValue("district_id", resolvedDistrict, { shouldDirty: false });
      }

      const resolvedCollege = resolveOptionValue(collegeOrg.org, colleges);
      if (resolvedCollege && form.getValues("college_id") !== resolvedCollege) {
        form.setValue("college_id", resolvedCollege, { shouldDirty: false });
      }

      const resolvedDepartment = resolveOptionValue(
        collegeOrg.department,
        departments,
      );
      if (
        resolvedDepartment &&
        form.getValues("department_id") !== resolvedDepartment
      ) {
        form.setValue("department_id", resolvedDepartment, {
          shouldDirty: false,
        });
      }
    }, [detail, states, districts, colleges, departments, form]);

    const selectedCommunities = form.watch("communities");
    const selectedRoles = form.watch("roles");
    const selectedInterests = form.watch("interest_groups");

    const toggleArrayField = (
      fieldName: "communities" | "roles" | "interest_groups",
      value: string,
      checked: boolean,
    ) => {
      const currentValues = form.getValues(fieldName);
      const nextValues = checked
        ? [...new Set([...currentValues, value])]
        : currentValues.filter((item) => item !== value);

      form.setValue(fieldName, nextValues, { shouldDirty: true });
    };

    const handleSubmit = async (values: ManageUserFormValues) => {
      if (!id) return;

      const parsed = ManageUserFormSchema.safeParse(values);
      if (!parsed.success) {
        toast.error("Please fix form errors before saving");
        return;
      }

      const dirty = form.formState.dirtyFields as DirtyFields;
      const payload = normalizePayload(parsed.data, dirty);
      if (Object.keys(payload).length === 0) {
        toast.message("No changes to save");
        return;
      }

      try {
        await updateUserMutation.mutateAsync({
          id,
          payload,
        });
        toast.success("User edited");
        closeModal();
      } catch {
        toast.error("Failed to edit user");
      }
    };

    const handleInvalidSubmit = () => {
      toast.error("Please fix form errors before saving");
    };

    useImperativeHandle(ref, () => ({
      handleSubmitExternally: () => {
        void form.handleSubmit(handleSubmit, handleInvalidSubmit)();
      },
    }));

    if (isDetailLoading) {
      return (
        <div className="flex items-center justify-center py-10">
          <Loader />
        </div>
      );
    }

    return (
      <Form {...form}>
        <form
          id={formId}
          onSubmit={form.handleSubmit(handleSubmit, handleInvalidSubmit)}
          className="space-y-6"
        >
          <div className="space-y-2 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/15">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/25">
                <CheckCircle2 className="size-5 text-primary" />
              </div>
            </div>
            <h2 className="text-4xl font-bold text-foreground sm:text-5xl">
              Edit User
            </h2>
            <p className="text-base text-muted-foreground">
              Enter the details of the user.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-center text-2xl font-semibold uppercase tracking-wide text-primary">
              Basic Info
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isBusy}
                        className={fieldClassName}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        {...field}
                        disabled={isBusy}
                        className={fieldClassName}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="mobile"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mobile</FormLabel>
                    <FormControl>
                      <Input
                        maxLength={10}
                        {...field}
                        disabled={isBusy}
                        className={fieldClassName}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="discord_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Discord ID</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isBusy}
                        className={fieldClassName}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <LocationSearchDropdown
                control={form.control}
                isBusy={isBusy}
                locationSearch={locationSearch}
                isLocationMenuOpen={isLocationMenuOpen}
                isLocationFetching={isLocationFetching}
                locationOptions={locationOptions}
                onLocationSearchChange={setLocationSearch}
                onLocationMenuOpenChange={setIsLocationMenuOpen}
              />
              <MultiSelectDropdown
                label="Communities"
                options={meta?.communities ?? []}
                selectedValues={selectedCommunities}
                onToggle={(value, checked) =>
                  toggleArrayField("communities", value, checked)
                }
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <MultiSelectDropdown
                label="Roles"
                options={meta?.roles ?? []}
                selectedValues={selectedRoles}
                onToggle={(value, checked) =>
                  toggleArrayField("roles", value, checked)
                }
              />
              <MultiSelectDropdown
                label="Interest Groups"
                options={meta?.interests ?? []}
                selectedValues={selectedInterests}
                onToggle={(value, checked) =>
                  toggleArrayField("interest_groups", value, checked)
                }
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-center text-2xl font-semibold uppercase tracking-wide text-primary">
              College / School
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="country_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <Select
                      value={field.value || "__empty"}
                      onValueChange={(value) => {
                        const nextValue = value === "__empty" ? "" : value;
                        field.onChange(nextValue);
                        form.setValue("state_id", "", { shouldDirty: true });
                        form.setValue("district_id", "", { shouldDirty: true });
                        form.setValue("college_id", "", { shouldDirty: true });
                        form.setValue("department_id", "", {
                          shouldDirty: true,
                        });
                      }}
                      disabled={isBusy}
                    >
                      <FormControl>
                        <SelectTrigger className={selectTriggerClassName}>
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="__empty">None</SelectItem>
                        {(meta?.countries ?? []).map((country) => (
                          <SelectItem key={country.value} value={country.value}>
                            {country.label}
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
                name="state_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <Select
                      value={field.value || "__empty"}
                      onValueChange={(value) => {
                        const nextValue = value === "__empty" ? "" : value;
                        field.onChange(nextValue);
                        form.setValue("district_id", "", { shouldDirty: true });
                        form.setValue("college_id", "", { shouldDirty: true });
                        form.setValue("department_id", "", {
                          shouldDirty: true,
                        });
                      }}
                      disabled={isBusy || !countryId}
                    >
                      <FormControl>
                        <SelectTrigger className={selectTriggerClassName}>
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="__empty">None</SelectItem>
                        {states.map((state) => (
                          <SelectItem key={state.value} value={state.value}>
                            {state.label}
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
                name="district_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>District</FormLabel>
                    <Select
                      value={field.value || "__empty"}
                      onValueChange={(value) => {
                        const nextValue = value === "__empty" ? "" : value;
                        field.onChange(nextValue);
                        form.setValue("college_id", "", { shouldDirty: true });
                        form.setValue("department_id", "", {
                          shouldDirty: true,
                        });
                      }}
                      disabled={isBusy || !stateId}
                    >
                      <FormControl>
                        <SelectTrigger className={selectTriggerClassName}>
                          <SelectValue placeholder="Select district" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="__empty">None</SelectItem>
                        {districts.map((district) => (
                          <SelectItem
                            key={district.value}
                            value={district.value}
                          >
                            {district.label}
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
                name="college_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>College / School</FormLabel>
                    <Select
                      value={field.value || "__empty"}
                      onValueChange={(value) =>
                        field.onChange(value === "__empty" ? "" : value)
                      }
                      disabled={isBusy}
                    >
                      <FormControl>
                        <SelectTrigger className={selectTriggerClassName}>
                          <SelectValue placeholder="Select college / school" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="__empty">None</SelectItem>
                        {colleges.map((college) => (
                          <SelectItem key={college.value} value={college.value}>
                            {college.label}
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
                name="department_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <Select
                      value={field.value || "__empty"}
                      onValueChange={(value) =>
                        field.onChange(value === "__empty" ? "" : value)
                      }
                      disabled={isBusy}
                    >
                      <FormControl>
                        <SelectTrigger className={selectTriggerClassName}>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="__empty">None</SelectItem>
                        {departments.map((department) => (
                          <SelectItem
                            key={department.value}
                            value={department.value}
                          >
                            {department.label}
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
                name="graduation_year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Graduation Year</FormLabel>
                    <FormControl>
                      <Input
                        inputMode="numeric"
                        maxLength={4}
                        {...field}
                        onChange={(event) => {
                          const value = event.target.value
                            .replace(/\D/g, "")
                            .slice(0, 4);
                          field.onChange(value);
                        }}
                        disabled={isBusy}
                        className={fieldClassName}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <Button type="submit" className="hidden">
            submit
          </Button>
        </form>
      </Form>
    );
  },
);

UserForm.displayName = "UserForm";

export default UserForm;
