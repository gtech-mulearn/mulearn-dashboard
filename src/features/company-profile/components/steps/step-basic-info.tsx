"use client";

import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { ProfileEditFormValues } from "../../schemas";

const COMPANY_SIZE_OPTIONS = [
  { value: "1-10", label: "1–10 employees" },
  { value: "11-50", label: "11–50 employees" },
  { value: "51-200", label: "51–200 employees" },
  { value: "201-500", label: "201–500 employees" },
  { value: "500+", label: "500+ employees" },
];

export function StepBasicInfo() {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<ProfileEditFormValues>();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">
          Basic Information
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Tell us about your company — name, identity, and core details.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-1 sm:col-span-2">
          <p className="text-sm font-medium text-foreground">
            Company Name <span className="text-destructive">*</span>
          </p>
          <Input
            {...register("name")}
            className="rounded-xl border-border bg-background"
            placeholder="e.g. Acme Corporation"
          />
          {errors.name?.message && (
            <p className="text-xs text-destructive">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-1 sm:col-span-2">
          <p className="text-sm font-medium text-foreground">
            Slug <span className="text-destructive">*</span>
          </p>
          <Input
            {...register("slug")}
            className="rounded-xl border-border bg-background"
            placeholder="e.g. acme-corporation"
          />
          <p className="text-xs text-muted-foreground">
            URL-friendly identifier (lowercase letters, numbers, hyphens)
          </p>
          {errors.slug?.message && (
            <p className="text-xs text-destructive">{errors.slug.message}</p>
          )}
        </div>

        <div className="space-y-1 sm:col-span-2">
          <p className="text-sm font-medium text-foreground">
            Description <span className="text-destructive">*</span>
          </p>
          <Textarea
            {...register("description")}
            className="rounded-xl border-border bg-background"
            placeholder="Describe your company, mission, and what you do..."
            rows={4}
          />
          {errors.description?.message && (
            <p className="text-xs text-destructive">
              {errors.description.message}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">
            Industry / Sector
          </p>
          <Input
            {...register("industry_sector")}
            className="rounded-xl border-border bg-background"
            placeholder="e.g. Software, FinTech, EdTech"
          />
        </div>

        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">Company Size</p>
          <select
            className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm"
            value={watch("company_size") ?? ""}
            onChange={(e) =>
              setValue("company_size", e.target.value || null, {
                shouldValidate: true,
              })
            }
          >
            <option value="">Select size</option>
            {COMPANY_SIZE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">Founded Year</p>
          <Input
            type="number"
            className="rounded-xl border-border bg-background"
            placeholder={`e.g. ${new Date().getFullYear() - 5}`}
            value={watch("founded_year") ?? ""}
            onChange={(e) => {
              const val = e.target.value;
              setValue("founded_year", val === "" ? null : parseInt(val, 10), {
                shouldValidate: true,
              });
            }}
          />
          {errors.founded_year?.message && (
            <p className="text-xs text-destructive">
              {errors.founded_year.message}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">Location</p>
          <Input
            {...register("location")}
            className="rounded-xl border-border bg-background"
            placeholder="e.g. Kochi, Kerala, India"
          />
        </div>
      </div>
    </div>
  );
}
