"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
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

interface EditUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string | null;
}

function normalizePayload(values: ManageUserFormValues) {
  const organizations = values.college_id
    ? [values.college_id, ...values.communities]
    : values.communities;

  const payload: Record<string, unknown> = {
    full_name: values.full_name,
    email: values.email,
    mobile: values.mobile,
    discord_id: values.discord_id,
    district: values.location_id,
    roles: values.roles,
    interest_groups: values.interest_groups,
    organizations,
    department: values.department_id,
    graduation_year: values.graduation_year
      ? Number(values.graduation_year)
      : undefined,
    community: values.communities,
  };

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

export function EditUserDialog({
  open,
  onOpenChange,
  userId,
}: EditUserDialogProps) {
  const { data: detail, isLoading: isDetailLoading } = useManageUserDetail(
    userId,
    open,
  );
  const { data: meta, isLoading: isMetaLoading } = useManageUsersMeta();
  const updateUserMutation = useUpdateManageUser();

  const [locationSearch, setLocationSearch] = useState("india");
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
  const { data: collegeData } = useCollegeData({
    countryId,
    stateId,
    districtId,
  });

  const colleges = collegeData?.colleges ?? [];
  const departments = collegeData?.departments ?? [];

  const isBusy =
    isDetailLoading || isMetaLoading || updateUserMutation.isPending;

  useEffect(() => {
    if (!detail || !open) return;

    const organizations = detail.organizations ?? [];
    const collegeOrg = organizations.find(
      (org) => org.org_type === "College" || org.org_type === "School",
    );

    const selectedCommunities = organizations
      .filter((org) => org.org_type === "Community")
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
      country_id: collegeOrg?.country ?? "",
      state_id: collegeOrg?.state ?? "",
      district_id: collegeOrg?.district ?? "",
      college_id: collegeOrg?.org ?? "",
      department_id: collegeOrg?.department ?? "",
      graduation_year: collegeOrg?.graduation_year
        ? String(collegeOrg.graduation_year)
        : "",
    });

    setLocationSearch("india");
  }, [detail, open, form]);

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
    if (!userId) return;

    const parsed = ManageUserFormSchema.safeParse(values);
    if (!parsed.success) {
      toast.error("Please fix form errors before saving");
      return;
    }

    try {
      await updateUserMutation.mutateAsync({
        id: userId,
        payload: normalizePayload(parsed.data),
      });

      toast.success("User edited");
      onOpenChange(false);
    } catch {
      toast.error("Failed to edit user");
    }
  };

  const handleInvalidSubmit = () => {
    toast.error("Please fix form errors before saving");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Update user details and affiliations.
          </DialogDescription>
        </DialogHeader>

        {isDetailLoading ? (
          <div className="flex items-center justify-center py-10">
            <Spinner className="size-6 text-primary" />
          </div>
        ) : (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit, handleInvalidSubmit)}
              className="space-y-6"
            >
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground">
                  Basic Info
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="full_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={isBusy} />
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
                          <Input type="email" {...field} disabled={isBusy} />
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
                          <Input maxLength={10} {...field} disabled={isBusy} />
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
                          <Input {...field} disabled={isBusy} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground">
                  Location
                </h3>
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
              </div>

              <Separator />

              <div className="grid gap-4 md:grid-cols-3">
                <MultiSelectDropdown
                  label="Communities"
                  options={meta?.communities ?? []}
                  selectedValues={selectedCommunities}
                  onToggle={(value, checked) =>
                    toggleArrayField("communities", value, checked)
                  }
                />
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

              <Separator />

              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground">
                  College / School
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
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
                            form.setValue("state_id", "", {
                              shouldDirty: true,
                            });
                            form.setValue("district_id", "", {
                              shouldDirty: true,
                            });
                            form.setValue("college_id", "", {
                              shouldDirty: true,
                            });
                            form.setValue("department_id", "", {
                              shouldDirty: true,
                            });
                          }}
                          disabled={isBusy}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select country" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="__empty">None</SelectItem>
                            {(meta?.countries ?? []).map((country) => (
                              <SelectItem
                                key={country.value}
                                value={country.value}
                              >
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
                            form.setValue("district_id", "", {
                              shouldDirty: true,
                            });
                            form.setValue("college_id", "", {
                              shouldDirty: true,
                            });
                            form.setValue("department_id", "", {
                              shouldDirty: true,
                            });
                          }}
                          disabled={isBusy || !countryId}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
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
                            form.setValue("college_id", "", {
                              shouldDirty: true,
                            });
                            form.setValue("department_id", "", {
                              shouldDirty: true,
                            });
                          }}
                          disabled={isBusy || !stateId}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
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
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select college / school" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="__empty">None</SelectItem>
                            {colleges.map((college) => (
                              <SelectItem
                                key={college.value}
                                value={college.value}
                              >
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
                            <SelectTrigger className="w-full">
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
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isBusy}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isBusy}>
                  {updateUserMutation.isPending && <Spinner className="mr-2" />}
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
