/**
 * Basic Info Section
 *
 * 📍 src/features/manage-users/components/basic-info-section.tsx
 *
 * Form section for basic user info fields (name, email, mobile, discord, location, communities, roles, IGs).
 */

"use client";

import type { Control } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { ManageUserFormValues } from "../schemas";
import { LocationSearchDropdown } from "./location-search-dropdown";
import { MultiSelectDropdown } from "./multi-select-dropdown";

interface BasicInfoSectionProps {
  control: Control<ManageUserFormValues>;
  isBusy: boolean;
  locationSearch: string;
  isLocationMenuOpen: boolean;
  isLocationFetching: boolean;
  locationOptions: { value: string; label: string }[];
  onLocationSearchChange: (value: string) => void;
  onLocationMenuOpenChange: (open: boolean) => void;
  communities: { value: string; label: string }[];
  roles: { value: string; label: string }[];
  interests: { value: string; label: string }[];
  selectedCommunities: string[];
  selectedRoles: string[];
  selectedInterests: string[];
  onToggleArrayField: (
    fieldName: "communities" | "roles" | "interest_groups",
    value: string,
    checked: boolean,
  ) => void;
}

const fieldClassName =
  "h-12 rounded-2xl border border-border bg-muted px-4 text-base focus-visible:ring-1 focus-visible:ring-primary/20";

export function BasicInfoSection({
  control,
  isBusy,
  locationSearch,
  isLocationMenuOpen,
  isLocationFetching,
  locationOptions,
  onLocationSearchChange,
  onLocationMenuOpenChange,
  communities,
  roles,
  interests,
  selectedCommunities,
  selectedRoles,
  selectedInterests,
  onToggleArrayField,
}: BasicInfoSectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-center text-2xl font-semibold uppercase tracking-wide text-primary">
        Basic Info
      </h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          control={control}
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
          control={control}
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
          control={control}
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
          control={control}
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
          control={control}
          isBusy={isBusy}
          locationSearch={locationSearch}
          isLocationMenuOpen={isLocationMenuOpen}
          isLocationFetching={isLocationFetching}
          locationOptions={locationOptions}
          onLocationSearchChange={onLocationSearchChange}
          onLocationMenuOpenChange={onLocationMenuOpenChange}
        />
        <MultiSelectDropdown
          label="Communities"
          options={communities}
          selectedValues={selectedCommunities}
          onToggle={(value, checked) =>
            onToggleArrayField("communities", value, checked)
          }
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <MultiSelectDropdown
          label="Roles"
          options={roles}
          selectedValues={selectedRoles}
          onToggle={(value, checked) =>
            onToggleArrayField("roles", value, checked)
          }
        />
        <MultiSelectDropdown
          label="Interest Groups"
          options={interests}
          selectedValues={selectedInterests}
          onToggle={(value, checked) =>
            onToggleArrayField("interest_groups", value, checked)
          }
        />
      </div>
    </div>
  );
}
