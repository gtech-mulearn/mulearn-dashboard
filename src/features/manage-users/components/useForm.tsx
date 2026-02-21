"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2 } from "lucide-react";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import Loader from "@/app/loading";
import { Form } from "@/components/ui/form";
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
import { BasicInfoSection } from "./basic-info-section";
import { CollegeSection } from "./college-section";
import {
  type DirtyFields,
  normalizePayload,
  resolveOptionValue,
} from "./form-utils";

type Props = { id: string; closeModal: () => void; formId?: string };

export const UserForm = forwardRef<
  { handleSubmitExternally: () => void },
  Props
>(({ id, closeModal, formId = "manage-users-edit-form" }, ref) => {
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

    const resolvedDistrict = resolveOptionValue(collegeOrg.district, districts);
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

        <BasicInfoSection
          control={form.control}
          isBusy={isBusy}
          locationSearch={locationSearch}
          isLocationMenuOpen={isLocationMenuOpen}
          isLocationFetching={isLocationFetching}
          locationOptions={locationOptions}
          onLocationSearchChange={setLocationSearch}
          onLocationMenuOpenChange={setIsLocationMenuOpen}
          communities={meta?.communities ?? []}
          roles={meta?.roles ?? []}
          interests={meta?.interests ?? []}
          selectedCommunities={selectedCommunities}
          selectedRoles={selectedRoles}
          selectedInterests={selectedInterests}
          onToggleArrayField={toggleArrayField}
        />

        <CollegeSection
          control={form.control}
          setValue={form.setValue}
          isBusy={isBusy}
          countryId={countryId}
          stateId={stateId}
          countries={meta?.countries ?? []}
          states={states}
          districts={districts}
          colleges={colleges}
          departments={departments}
        />
      </form>
    </Form>
  );
});
