"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import {
  type ChangeOrganizationFormValues,
  ChangeOrganizationRequestSchema,
  useChangeOrganization,
  useColleges,
  useDepartments,
} from "@/features/settings";

export default function ChangeOrganizationPage() {
  const changeOrganizationMutation = useChangeOrganization();
  const collegesQuery = useColleges();
  const departmentsQuery = useDepartments();

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
    },
  });

  async function onSubmit(values: ChangeOrganizationFormValues) {
    const res = await changeOrganizationMutation.mutateAsync(values);
    if (!res.hasError) reset();
  }

  const colleges = collegesQuery.data ?? [];
  const departments = departmentsQuery.data ?? [];

  const isLoading =
    collegesQuery.isLoading ||
    departmentsQuery.isLoading ||
    changeOrganizationMutation.isPending;

  return (
    <section className="flex min-h-screen items-center justify-center px-4">
      <div className="bg-background border-muted w-full max-w-xl rounded-md border px-6 py-12 shadow-sm">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-semibold">Change Campus</h1>
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
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full border-primary text-primary focus:ring-primary">
                    <SelectValue placeholder="Select organization" />
                  </SelectTrigger>

                  <SelectContent
                    position="popper"
                    side="bottom"
                    sideOffset={8}
                    align="start"
                    avoidCollisions={false}
                    className="max-h-72 overflow-y-auto"
                  >
                    {colleges.map((college) => (
                      <SelectItem
                        key={college.id}
                        value={college.id}
                        className="text-primary focus:bg-primary/10 focus:text-primary"
                      >
                        {college.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full border-primary text-primary focus:ring-primary">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>

                  <SelectContent
                    position="popper"
                    side="bottom"
                    sideOffset={8}
                    align="start"
                    avoidCollisions={false}
                    className="max-h-72 overflow-y-auto"
                  >
                    {departments.map((dept) => (
                      <SelectItem
                        key={dept.id}
                        value={dept.id}
                        className="max-h-72 text-primary focus:bg-primary/10 focus:text-primary"
                      >
                        {dept.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.department?.message && (
              <p className="text-sm text-destructive">
                {errors.department.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Input
              type="text"
              placeholder="Graduation Year"
              className="pr-10"
              required
            />
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
