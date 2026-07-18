/**
 * College / School Section
 *
 * 📍 src/features/manage-users/components/college-section.tsx
 *
 * Form section for college/school cascading selects (country → state → district → college → department + graduation year).
 */

"use client";

import type { Control, UseFormSetValue } from "react-hook-form";
import {
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
import type { ManageUserFormValues } from "../schemas";

interface CollegeSectionProps {
  control: Control<ManageUserFormValues>;
  setValue: UseFormSetValue<ManageUserFormValues>;
  isBusy: boolean;
  countryId: string;
  stateId: string;
  countries: { value: string; label: string }[];
  states: { value: string; label: string }[];
  districts: { value: string; label: string }[];
  colleges: { value: string; label: string }[];
  departments: { value: string; label: string }[];
}

const selectTriggerClassName =
  "h-12 w-full rounded-2xl border border-border bg-muted px-3.5 text-base";
const fieldClassName =
  "h-12 rounded-2xl border border-border bg-muted px-4 text-base focus-visible:ring-1 focus-visible:ring-primary/20";

export function CollegeSection({
  control,
  isBusy,
  countryId,
  stateId,
  countries,
  states,
  districts,
  colleges,
  departments,
}: CollegeSectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-center text-2xl font-semibold uppercase tracking-wide text-primary">
        College / School
      </h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          control={control}
          name="country_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Country</FormLabel>
              <Select
                value={field.value || "__empty"}
                onValueChange={(value) => {
                  field.onChange(value === "__empty" ? "" : value);
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
                  {countries.map((country) => (
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
          control={control}
          name="state_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>State</FormLabel>
              <Select
                value={field.value || "__empty"}
                onValueChange={(value) => {
                  field.onChange(value === "__empty" ? "" : value);
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
          control={control}
          name="district_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>District</FormLabel>
              <Select
                value={field.value || "__empty"}
                onValueChange={(value) => {
                  field.onChange(value === "__empty" ? "" : value);
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
                    <SelectItem key={district.value} value={district.value}>
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
          control={control}
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
          control={control}
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
                    <SelectItem key={department.value} value={department.value}>
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
          control={control}
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
  );
}
