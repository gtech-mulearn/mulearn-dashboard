"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Camera } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { extractDjangoMessage } from "@/api/errors";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Combobox } from "@/components/ui/combobox";
import { ImageCropDialog } from "@/components/ui/image-crop-dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { MultiSelectDropdown } from "@/features/manage-users/components";
import {
  MAX_IMAGE_UPLOAD_LABEL,
  MAX_IMAGE_UPLOAD_MB,
  validateImageFile,
} from "@/lib/constants/upload";
import {
  useCommunities,
  useCountries,
  useDistricts,
  useEditableProfile,
  useOrganizationData,
  useStates,
} from "../hooks";
import {
  EditProfileFormSchema,
  type EditProfileFormValues,
  type LocationOption,
  type UserProfile,
} from "../schemas";

interface EditProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: UserProfile;
  fallbackDepartmentId?: string;
  onSave: (
    data: EditProfileFormValues,
    dirtyFields: Partial<Record<keyof EditProfileFormValues, boolean>>,
  ) => Promise<void>;
}

function resolveOptionValue(
  raw: string | null | undefined,
  options: LocationOption[],
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

function normalizeGenderValue(value: string | null | undefined) {
  const raw = (value ?? "").trim().toLowerCase().replace(/\s+/g, "_");
  if (!raw) return "";
  if (raw === "m" || raw === "man" || raw === "male") return "Male";
  if (raw === "f" || raw === "woman" || raw === "female") return "Female";
  if (raw === "other" || raw === "others") return "Other";
  if (
    raw === "prefer_not_to_say" ||
    raw === "prefer-not-to-say" ||
    raw === "prefer_not" ||
    raw === "n/a"
  ) {
    return "Prefer not to say";
  }
  if (value === "Male" || value === "Female" || value === "Other") {
    return value;
  }
  if (value === "Prefer not to say") {
    return value;
  }
  return "";
}

export function EditProfileModal({
  open,
  onOpenChange,
  profile,
  fallbackDepartmentId,
  onSave,
}: EditProfileModalProps) {
  const form = useForm<EditProfileFormValues>({
    resolver: zodResolver(EditProfileFormSchema),
    defaultValues: {
      full_name: profile.full_name ?? "",
      email: profile.email ?? "",
      mobile: profile.mobile ?? "",
      gender: normalizeGenderValue(profile.gender) ?? "",
      dob: profile.dob ? profile.dob.slice(0, 10) : "",
      communities: [],
      country_id: "",
      state_id: "",
      district_id: "",
      org_id: profile.college_id ?? "",
      department_id: "",
      has_college_changes: false,
    },
  });

  const [avatarCropSourceUrl, setAvatarCropSourceUrl] = useState<string | null>(
    null,
  );

  const closeAvatarCropDialog = () => {
    if (avatarCropSourceUrl) URL.revokeObjectURL(avatarCropSourceUrl);
    setAvatarCropSourceUrl(null);
  };

  const countryId = form.watch("country_id") || "";
  const stateId = form.watch("state_id") || "";
  const districtId = form.watch("district_id") || "";
  const selectedImage = form.watch("profile_pic");
  const { data: editableProfile } = useEditableProfile(open);

  const { data: communities = [] } = useCommunities();
  const { data: countries = [] } = useCountries();
  const { data: states = [] } = useStates(countryId);
  const { data: districts = [] } = useDistricts(stateId);
  const { data: organizationData } = useOrganizationData(districtId);

  const currentOrgRaw = profile.college_id || "";
  const collegeOrgDisplayName = profile.college_code || currentOrgRaw;
  const currentOrgOption: LocationOption | null = currentOrgRaw
    ? {
        value: currentOrgRaw,
        label: collegeOrgDisplayName,
      }
    : null;
  const p = profile as typeof profile & {
    department_id?: string | null;
    branch_id?: string | null;
    branch?: string | { id?: string | null } | null;
  };
  const currentDepartmentRaw =
    p.department_id ||
    (typeof p.department === "string" ? p.department : p.department?.id) ||
    p.branch_id ||
    (typeof p.branch === "string" ? p.branch : p.branch?.id) ||
    editableProfile?.department?.id ||
    fallbackDepartmentId ||
    "";
  const currentDepartmentDisplayName =
    profile.department_name ||
    profile.department?.title ||
    profile.department?.name ||
    editableProfile?.department?.title ||
    editableProfile?.department?.name ||
    currentDepartmentRaw;
  const currentDepartmentOption: LocationOption | null = currentDepartmentRaw
    ? {
        value: currentDepartmentRaw,
        label: currentDepartmentDisplayName,
      }
    : null;

  const organizations = [
    ...(currentOrgOption ? [currentOrgOption] : []),
    ...(organizationData?.organizations ?? []),
  ].filter(
    (option, index, list) =>
      list.findIndex((candidate) => candidate.value === option.value) === index,
  );

  const departments = [
    ...(currentDepartmentOption ? [currentDepartmentOption] : []),
    ...(organizationData?.departments ?? []),
  ].filter(
    (option, index, list) =>
      list.findIndex((candidate) => candidate.value === option.value) === index,
  );

  const organizationOptions = organizations.map((option) => ({
    id: option.value,
    title: option.label,
  }));
  const departmentOptions = departments.map((option) => ({
    id: option.value,
    title: option.label,
  }));

  useEffect(() => {
    if (!open) return;
    const sourceFullName =
      profile.full_name || editableProfile?.full_name || "";
    form.reset({
      full_name: sourceFullName,
      email: profile.email || editableProfile?.email || "",
      mobile: profile.mobile || editableProfile?.mobile || "",
      gender: normalizeGenderValue(
        profile.gender || editableProfile?.gender || "",
      ),
      dob: profile.dob
        ? profile.dob.slice(0, 10)
        : editableProfile?.dob
          ? editableProfile.dob.slice(0, 10)
          : "",
      communities: editableProfile?.communities ?? [],
      country_id: editableProfile?.district?.state?.country?.id || "",
      state_id: editableProfile?.district?.state?.id || "",
      district_id:
        editableProfile?.district?.id || profile.org_district_id || "",
      org_id: profile.college_id || "",
      department_id: currentDepartmentRaw,
      has_college_changes: false,
    });
  }, [currentDepartmentRaw, editableProfile, form, open, profile]);

  useEffect(() => {
    if (!open) return;
    const communityRaw = editableProfile?.communities ?? [];
    if (communityRaw.length === 0) return;
    const resolvedCommunities = communityRaw
      .map((value) => resolveOptionValue(value, communities))
      .filter((value) => Boolean(value));
    const current = form.getValues("communities") ?? [];
    if (resolvedCommunities.join("|") !== current.join("|")) {
      form.setValue("communities", resolvedCommunities, { shouldDirty: false });
    }
  }, [communities, editableProfile, form, open]);

  useEffect(() => {
    if (!open) return;
    const orgRaw = profile.college_id;
    if (!orgRaw) return;
    const resolvedOrg = resolveOptionValue(orgRaw, organizations);
    if (resolvedOrg && form.getValues("org_id") !== resolvedOrg) {
      form.setValue("org_id", resolvedOrg, { shouldDirty: false });
    }
  }, [form, open, organizations, profile.college_id]);

  useEffect(() => {
    if (!open) return;
    const departmentRaw = currentDepartmentRaw;
    if (!departmentRaw) return;
    const resolvedDepartment = resolveOptionValue(departmentRaw, departments);
    if (
      resolvedDepartment &&
      form.getValues("department_id") !== resolvedDepartment
    ) {
      form.setValue("department_id", resolvedDepartment, {
        shouldDirty: false,
      });
    }
  }, [currentDepartmentRaw, departments, form, open]);

  const imagePreviewUrl = useMemo(() => {
    if (selectedImage instanceof File) {
      return URL.createObjectURL(selectedImage);
    }
    return profile.profile_pic ?? null;
  }, [profile.profile_pic, selectedImage]);

  useEffect(() => {
    return () => {
      if (
        selectedImage instanceof File &&
        imagePreviewUrl?.startsWith("blob:")
      ) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl, selectedImage]);

  const handleSubmit = async (values: EditProfileFormValues) => {
    const dirtyFields = form.formState.dirtyFields as Partial<
      Record<keyof EditProfileFormValues, boolean>
    >;

    const fullName = values.full_name?.trim() || "";
    const normalizedValues: EditProfileFormValues = {
      ...values,
      full_name: fullName,
    };

    try {
      await onSave(normalizedValues, dirtyFields);
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as {
        data?: { response?: unknown; message?: unknown };
        message?: string;
      } | null;
      let hasFieldErrors = false;

      // Handle backend validation errors that come in `error.data.response` or `error.data.message`
      const backendErrors = err?.data?.response || err?.data?.message;

      if (backendErrors && typeof backendErrors === "object") {
        for (const [key, messages] of Object.entries(
          backendErrors as Record<string, unknown>,
        )) {
          let errorMessage = "";
          if (Array.isArray(messages) && messages.length > 0) {
            errorMessage = Array.from(new Set(messages)).join(" ");
          } else if (typeof messages === "string") {
            errorMessage = messages;
          }

          if (errorMessage) {
            // Check if the key exists in our form schema
            const isValidField = Object.keys(form.getValues()).includes(key);
            if (isValidField) {
              form.setError(key as keyof EditProfileFormValues, {
                type: "server",
                message: errorMessage,
              });
              hasFieldErrors = true;
            }
          }
        }
      }

      if (hasFieldErrors) {
        toast.error("Please fix the validation errors in the form");
        return;
      }

      // If no specific field errors were found or it's a general error, show a toast
      const generalMessage =
        extractDjangoMessage(err?.data) ||
        err?.message ||
        "Failed to update profile";
      toast.error(generalMessage);
    }
  };

  const fieldClassName =
    "h-12 w-full min-w-0 rounded-2xl border border-border bg-muted px-4 text-base focus-visible:ring-1 focus-visible:ring-primary/20";
  const selectTriggerClassName =
    "h-12 w-full min-w-0 overflow-hidden rounded-2xl border border-border bg-muted px-3.5 text-base [&>span]:truncate";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col gap-0 p-0 sm:max-w-3xl">
        <DialogHeader className="shrink-0 px-4 pt-4 pb-3 sm:px-6 sm:pt-6 sm:pb-4">
          <DialogTitle className="text-center text-2xl font-bold sm:text-3xl">
            Edit Profile
          </DialogTitle>
          <DialogDescription className="text-center">
            Update your profile details and save changes.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            className="flex flex-col min-h-0"
            onSubmit={form.handleSubmit(handleSubmit)}
          >
            <div className="overflow-y-auto px-4 py-2 sm:px-6 sm:py-4 space-y-6 sm:space-y-8">
              <div className="flex flex-col items-center gap-3">
                <div className="relative">
                  <div className="h-24 w-24 overflow-hidden rounded-2xl bg-muted">
                    {imagePreviewUrl ? (
                      <Image
                        src={imagePreviewUrl}
                        alt={profile.full_name}
                        width={96}
                        height={96}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-primary/10 text-3xl font-bold text-primary">
                        {profile.full_name?.charAt(0) || "?"}
                      </div>
                    )}
                  </div>
                  <label
                    htmlFor="profilePic"
                    className="absolute -bottom-1 -right-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm"
                    title="Change photo"
                  >
                    <Camera className="h-4 w-4" />
                  </label>
                </div>
                <input
                  id="profilePic"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;

                    const error = validateImageFile(file);
                    if (error) {
                      toast.error(error);
                      event.target.value = "";
                      return;
                    }

                    setAvatarCropSourceUrl(URL.createObjectURL(file));
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  Upload a profile image · {MAX_IMAGE_UPLOAD_LABEL}
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-center text-lg font-semibold uppercase tracking-wide text-primary sm:text-2xl">
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
                          <Input {...field} className={fieldClassName} />
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
                            {...field}
                            type="email"
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
                          <Input {...field} className={fieldClassName} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender</FormLabel>
                        <Select
                          value={field.value || "__none__"}
                          onValueChange={(value) =>
                            field.onChange(value === "__none__" ? "" : value)
                          }
                        >
                          <FormControl>
                            <SelectTrigger className={selectTriggerClassName}>
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent position="popper">
                            <SelectItem value="__none__">None</SelectItem>
                            <SelectItem value="Male">Male</SelectItem>
                            <SelectItem value="Female">Female</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                            <SelectItem value="Prefer not to say">
                              Prefer not to say
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="dob"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of Birth</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="date"
                            className={fieldClassName}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="communities"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Community</FormLabel>
                        <MultiSelectDropdown
                          options={communities}
                          selectedValues={field.value ?? []}
                          onToggle={(value, checked) => {
                            const current = field.value ?? [];
                            if (checked) {
                              if (!current.includes(value)) {
                                field.onChange([...current, value]);
                              }
                              return;
                            }
                            field.onChange(
                              current.filter(
                                (selectedValue) => selectedValue !== value,
                              ),
                            );
                          }}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-center text-lg font-semibold uppercase tracking-wide text-primary sm:text-2xl">
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
                          value={field.value || "__none__"}
                          onValueChange={(value) => {
                            form.setValue("has_college_changes", true, {
                              shouldDirty: false,
                            });
                            field.onChange(value === "__none__" ? "" : value);
                            form.setValue("state_id", "", {
                              shouldDirty: true,
                            });
                            form.setValue("district_id", "", {
                              shouldDirty: true,
                            });
                            form.setValue("org_id", "", { shouldDirty: true });
                            form.setValue("department_id", "", {
                              shouldDirty: true,
                            });
                          }}
                        >
                          <FormControl>
                            <SelectTrigger className={selectTriggerClassName}>
                              <SelectValue placeholder="Select country" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent position="popper">
                            <SelectItem value="__none__">None</SelectItem>
                            {countries.map((country) => (
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
                          value={field.value || "__none__"}
                          onValueChange={(value) => {
                            form.setValue("has_college_changes", true, {
                              shouldDirty: false,
                            });
                            field.onChange(value === "__none__" ? "" : value);
                            form.setValue("district_id", "", {
                              shouldDirty: true,
                            });
                            form.setValue("org_id", "", { shouldDirty: true });
                            form.setValue("department_id", "", {
                              shouldDirty: true,
                            });
                          }}
                          disabled={!countryId}
                        >
                          <FormControl>
                            <SelectTrigger className={selectTriggerClassName}>
                              <SelectValue placeholder="Select state" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent position="popper">
                            <SelectItem value="__none__">None</SelectItem>
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
                          value={field.value || "__none__"}
                          onValueChange={(value) => {
                            form.setValue("has_college_changes", true, {
                              shouldDirty: false,
                            });
                            field.onChange(value === "__none__" ? "" : value);
                            form.setValue("org_id", "", { shouldDirty: true });
                            form.setValue("department_id", "", {
                              shouldDirty: true,
                            });
                          }}
                          disabled={!stateId}
                        >
                          <FormControl>
                            <SelectTrigger className={selectTriggerClassName}>
                              <SelectValue placeholder="Select district" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent position="popper">
                            <SelectItem value="__none__">None</SelectItem>
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
                    name="org_id"
                    render={({ field }) => (
                      <FormItem className="min-w-0 sm:col-span-2">
                        <FormLabel>College / School</FormLabel>
                        <FormControl>
                          <Combobox
                            options={organizationOptions}
                            value={field.value}
                            onValueChange={(value) => {
                              form.setValue("has_college_changes", true, {
                                shouldDirty: false,
                              });
                              field.onChange(value);
                            }}
                            selectedLabel={collegeOrgDisplayName}
                            placeholder="Search college / school"
                            disabled={!districtId && organizations.length === 0}
                          />
                        </FormControl>
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
                        <FormControl>
                          <Combobox
                            options={departmentOptions}
                            value={field.value}
                            onValueChange={(value) => {
                              form.setValue("has_college_changes", true, {
                                shouldDirty: false,
                              });
                              field.onChange(value);
                            }}
                            selectedLabel={currentDepartmentDisplayName}
                            placeholder="Search department"
                            disabled={!districtId && departments.length === 0}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="space-y-2">
                    <div className="text-sm font-medium">MUID</div>
                    <Input
                      value={profile.muid}
                      disabled
                      className={fieldClassName}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="shrink-0 flex flex-col-reverse gap-2 px-4 py-4 sm:px-6 sm:flex-row sm:justify-end border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={form.formState.isSubmitting}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
                className="w-full sm:w-auto"
              >
                {form.formState.isSubmitting && (
                  <Spinner className="mr-2 h-4 w-4" />
                )}
                Save Changes
              </Button>
            </div>
          </form>
        </Form>

        {avatarCropSourceUrl ? (
          <ImageCropDialog
            open
            imageSrc={avatarCropSourceUrl}
            aspect={1}
            outputMaxSizeMB={MAX_IMAGE_UPLOAD_MB}
            onCropComplete={(file) => {
              closeAvatarCropDialog();
              form.setValue("profile_pic", file, { shouldDirty: true });
            }}
            onCancel={closeAvatarCropDialog}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
