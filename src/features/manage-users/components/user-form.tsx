"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2 } from "lucide-react";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import Loader from "@/app/loading";
import { Form } from "@/components/ui/form";
import {
  useCollegeData,
  useCompanies,
  useDistricts,
  useLocationSearch,
  useManageUserDetail,
  useManageUsersMeta,
  useResolveLocation,
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

const MAX_INTEREST_GROUPS = 3;

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
  const [isInitialized, setIsInitialized] = useState(false);

  const form = useForm<ManageUserFormValues>({
    resolver: zodResolver(ManageUserFormSchema),
    defaultValues: {
      full_name: "",
      email: "",
      mobile: "",
      discord_id: "",
      location_id: "",
      community: [],
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

  // 1. Parse saved college organization info
  const collegeOrg = useMemo(() => {
    const organizations = detail?.organizations ?? [];
    return organizations.find((org) => {
      const type = (org.org_type ?? "").toLowerCase();
      return type === "college" || type === "school";
    });
  }, [detail]);

  // 2. Resolve Country ID
  const resolvedCountryId = useMemo(() => {
    return resolveOptionValue(collegeOrg?.country, meta?.countries ?? []);
  }, [collegeOrg?.country, meta?.countries]);

  // Use resolved initial country before form is ready/initialized, watched value after
  const activeCountryId = isInitialized ? countryId : resolvedCountryId;

  // 3. Fetch & Resolve States
  const { data: states = [], isLoading: isStatesLoading } =
    useStates(activeCountryId);
  const resolvedStateId = useMemo(() => {
    return resolveOptionValue(collegeOrg?.state, states);
  }, [collegeOrg?.state, states]);

  const activeStateId = isInitialized ? stateId : resolvedStateId;

  // 4. Fetch & Resolve Districts
  const { data: districts = [], isLoading: isDistrictsLoading } =
    useDistricts(activeStateId);
  const resolvedDistrictId = useMemo(() => {
    return resolveOptionValue(collegeOrg?.district, districts);
  }, [collegeOrg?.district, districts]);

  const activeDistrictId = isInitialized ? districtId : resolvedDistrictId;

  // 5. Fetch & Resolve Colleges and Departments
  const { data: collegeData, isLoading: isCollegeDataLoading } =
    useCollegeData(activeDistrictId);
  const colleges = collegeData?.colleges ?? [];
  const departments = collegeData?.departments ?? [];

  const resolvedCollegeId = useMemo(() => {
    return resolveOptionValue(collegeOrg?.org, colleges);
  }, [collegeOrg?.org, colleges]);

  const resolvedDepartmentId = useMemo(() => {
    return resolveOptionValue(collegeOrg?.department, departments);
  }, [collegeOrg?.department, departments]);

  // 6. Location (District) resolution — search by the saved district name to
  //    find the matching option (UUID + label) for pre-populating the combobox.
  const savedDistrictUuid = detail?.district ?? "";
  const savedDistrictName = collegeOrg?.district ?? "";
  const { data: locationsList = [], isLoading: isLocationResolving } =
    useResolveLocation(savedDistrictName || undefined);
  const resolvedLocation = useMemo(() => {
    if (!savedDistrictUuid || locationsList.length === 0) return undefined;
    return locationsList.find((o) => o.value === savedDistrictUuid);
  }, [savedDistrictUuid, locationsList]);

  // 7. General Location query for typing/searching
  const { data: locationOptions = [], isFetching: isLocationFetching } =
    useLocationSearch(locationSearch);

  const { data: companies = [] } = useCompanies();

  const isBusy =
    isDetailLoading ||
    isMetaLoading ||
    isStatesLoading ||
    isDistrictsLoading ||
    isCollegeDataLoading ||
    isLocationResolving ||
    updateUserMutation.isPending;

  // Combined readiness flag
  const isReady = useMemo(() => {
    const basicReady = !isDetailLoading && !isMetaLoading;
    if (!basicReady) return false;

    // If there is country/state/district saved info, wait until their option lists are loaded
    if (resolvedCountryId && isStatesLoading) return false;
    if (resolvedStateId && isDistrictsLoading) return false;
    if (resolvedDistrictId && isCollegeDataLoading) return false;
    if (savedDistrictUuid && isLocationResolving) return false;

    return true;
  }, [
    isDetailLoading,
    isMetaLoading,
    resolvedCountryId,
    isStatesLoading,
    resolvedStateId,
    isDistrictsLoading,
    resolvedDistrictId,
    isCollegeDataLoading,
    savedDistrictUuid,
    isLocationResolving,
  ]);

  // Sync: reset state_id, district_id, college_id, department_id when countryId changes
  // biome-ignore lint/correctness/useExhaustiveDependencies: countryId is the intentional trigger; form and isInitialized guard against premature resets
  useEffect(() => {
    if (form.formState.isDirty && isInitialized) {
      form.setValue("state_id", "");
      form.setValue("district_id", "");
      form.setValue("college_id", "");
      form.setValue("department_id", "");
    }
  }, [countryId, form, isInitialized]);

  // Sync: reset district_id, college_id, department_id when stateId changes
  // biome-ignore lint/correctness/useExhaustiveDependencies: stateId is the intentional trigger
  useEffect(() => {
    if (form.formState.isDirty && isInitialized) {
      form.setValue("district_id", "");
      form.setValue("college_id", "");
      form.setValue("department_id", "");
    }
  }, [stateId, form, isInitialized]);

  // Sync: reset college_id, department_id when districtId changes
  // biome-ignore lint/correctness/useExhaustiveDependencies: districtId is the intentional trigger
  useEffect(() => {
    if (form.formState.isDirty && isInitialized) {
      form.setValue("college_id", "");
      form.setValue("department_id", "");
    }
  }, [districtId, form, isInitialized]);

  // Reset initialization when user id changes
  // biome-ignore lint/correctness/useExhaustiveDependencies: id is a prop-level trigger; setters are stable
  useEffect(() => {
    setIsInitialized(false);
    setLocationSearch("");
  }, [id]);

  // One-time initialization of form fields when all data is fully loaded and resolved
  useEffect(() => {
    if (isReady && !isInitialized && detail) {
      const organizations = detail.organizations ?? [];
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
        community: selectedCommunities,
        roles: selectedRoles,
        interest_groups: detail.interest_groups ?? [],
        country_id: resolvedCountryId,
        state_id: resolvedStateId,
        district_id: resolvedDistrictId,
        college_id: resolvedCollegeId,
        department_id: resolvedDepartmentId,
        graduation_year: collegeOrg?.graduation_year
          ? String(collegeOrg.graduation_year)
          : "",
      });

      if (resolvedLocation) {
        setLocationSearch(resolvedLocation.label);
      } else {
        setLocationSearch("");
      }

      setIsInitialized(true);
    }
  }, [
    isReady,
    isInitialized,
    detail,
    resolvedCountryId,
    resolvedStateId,
    resolvedDistrictId,
    resolvedCollegeId,
    resolvedDepartmentId,
    resolvedLocation,
    collegeOrg,
    form,
  ]);

  const selectedCommunities = form.watch("community");
  const selectedRoles = form.watch("roles");
  const selectedInterests = form.watch("interest_groups");

  const toggleArrayField = (
    fieldName: "communities" | "roles" | "interest_groups",
    value: string,
    checked: boolean,
  ) => {
    const formFieldName = fieldName === "communities" ? "community" : fieldName;
    const currentValues = form.getValues(
      formFieldName as "community" | "roles" | "interest_groups",
    );

    if (
      checked &&
      fieldName === "interest_groups" &&
      currentValues.length >= MAX_INTEREST_GROUPS
    ) {
      toast.error(`You can only select ${MAX_INTEREST_GROUPS} interest groups`);
      return;
    }

    const nextValues = checked
      ? [...new Set([...currentValues, value])]
      : currentValues.filter((item) => item !== value);

    form.setValue(formFieldName, nextValues, { shouldDirty: true });
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

  if (!isInitialized || !isReady) {
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
          user_id={id}
          colleges={colleges}
          companies={companies}
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
