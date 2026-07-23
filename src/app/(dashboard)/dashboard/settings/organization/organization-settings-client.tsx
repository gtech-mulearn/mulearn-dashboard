"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
  type ChangeOrganizationFormValues,
  ChangeOrganizationRequestSchema,
  useChangeOrganization,
  useCollegeSearch,
  useDepartmentSearch,
} from "@/features/settings";

export function ChangeOrganizationPageClient() {
  const changeOrganizationMutation = useChangeOrganization();
  const [collegeSearch, setCollegeSearch] = useState("");
  const [departmentSearch, setDepartmentSearch] = useState("");
  const collegeSearchQuery = useCollegeSearch(collegeSearch);
  const departmentSearchQuery = useDepartmentSearch(departmentSearch);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ChangeOrganizationFormValues>({
    resolver: zodResolver(ChangeOrganizationRequestSchema),
    defaultValues: {
      organization: "",
      department: "",
      graduation_year: undefined as unknown as number,
    },
  });

  async function onSubmit(values: ChangeOrganizationFormValues) {
    const res = await changeOrganizationMutation.mutateAsync(values);
    if (!res.hasError) reset();
  }

  const colleges = collegeSearchQuery.data ?? [];
  const departments = departmentSearchQuery.data ?? [];

  const isLoading = changeOrganizationMutation.isPending;

  return (
    <section className="flex min-h-screen items-center justify-center px-4">
      <div className="bg-background border-muted w-full max-w-xl rounded-md border px-6 py-12 shadow-sm">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-semibold">Change Organization</h1>
          <p className="text-muted-foreground mt-2">
            Please select your college details
          </p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Controller
              control={control}
              name="organization"
              render={({ field }) => (
                <Combobox
                  options={colleges}
                  value={field.value}
                  onValueChange={field.onChange}
                  onSearchChange={setCollegeSearch}
                  loading={collegeSearchQuery.isFetching}
                  placeholder="Search organization"
                  emptyText={
                    collegeSearch.trim().length < 2
                      ? "Type your college to search"
                      : "No organizations found."
                  }
                />
              )}
            />
            {errors.organization?.message && (
              <p className="text-sm text-destructive">
                {errors.organization.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Controller
              control={control}
              name="department"
              render={({ field }) => (
                <Combobox
                  options={departments}
                  value={field.value}
                  onValueChange={field.onChange}
                  onSearchChange={setDepartmentSearch}
                  loading={departmentSearchQuery.isFetching}
                  placeholder="Search department"
                  emptyText={
                    departmentSearch.trim().length < 2
                      ? "Type your department to search"
                      : "No departments found."
                  }
                />
              )}
            />
            {errors.department?.message && (
              <p className="text-sm text-destructive">
                {errors.department.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Controller
              control={control}
              name="graduation_year"
              render={({ field }) => (
                <Input
                  type="number"
                  placeholder="Graduation Year"
                  className="pr-10"
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value ? Number(e.target.value) : undefined,
                    )
                  }
                  required
                />
              )}
            />
            {errors.graduation_year?.message && (
              <p className="text-sm text-destructive">
                {errors.graduation_year.message}
              </p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Spinner className="mr-2 h-4 w-4" />}
            Change Organization
          </Button>
        </form>
      </div>
    </section>
  );
}
