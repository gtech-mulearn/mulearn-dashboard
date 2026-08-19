"use client";

/**
 * StepBasicInfo — Step 1: Job title, type, location, compensation
 *
 * 📍 src/features/company-jobs/components/job-stepper/step-basic-info.tsx
 *
 * The compensation field is chosen by job type rather than shown as a fixed
 * "Salary Range" box: a gig is paid hourly, an internship pays a stipend, and
 * a permanent role has a salary range. Only the relevant one is rendered, so
 * the wizard never asks for a figure that does not apply to the listing.
 */

import type { UseFormReturn } from "react-hook-form";
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
import {
  getJobTypeFieldModel,
  JOB_FIELD_LIMITS,
  JOB_TYPE_OPTIONS,
} from "../../constants";
import type { JobFormValues } from "../../schemas";
import { CharCount, FieldHint } from "./field-hint";

interface StepBasicInfoProps {
  form: UseFormReturn<JobFormValues>;
}

export function StepBasicInfo({ form }: StepBasicInfoProps) {
  const jobType = form.watch("job_type");
  const model = getJobTypeFieldModel(jobType);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">
          Basic Information
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          What&apos;s the role, where is it, and what does it pay?
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem className="sm:col-span-2">
              <div className="flex items-center gap-2">
                <FormLabel>
                  Job Title <span className="text-destructive">*</span>
                </FormLabel>
                <CharCount value={field.value} max={JOB_FIELD_LIMITS.title} />
              </div>
              <FormControl>
                <Input
                  {...field}
                  maxLength={JOB_FIELD_LIMITS.title}
                  placeholder="e.g. Backend Engineer, Product Designer"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="job_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Job Type <span className="text-destructive">*</span>
              </FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {JOB_TYPE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <span className="flex flex-col items-start">
                        <span>{opt.label}</span>
                        <span className="text-[11px] text-muted-foreground">
                          {opt.hint}
                        </span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormHintForJobType jobType={jobType} />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center gap-2">
                <FormLabel>
                  Location <span className="text-destructive">*</span>
                </FormLabel>
                <CharCount
                  value={field.value}
                  max={JOB_FIELD_LIMITS.location}
                />
              </div>
              <FormControl>
                <Input
                  {...field}
                  maxLength={JOB_FIELD_LIMITS.location}
                  placeholder="e.g. Kochi, Bangalore, Anywhere"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Compensation — exactly one field, decided by job type */}
        {model.compensation === "salary" && (
          <FormField
            control={form.control}
            name="salary_range"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <div className="flex items-center gap-2">
                  <FormLabel>
                    Salary Range <span className="text-destructive">*</span>
                  </FormLabel>
                  <CharCount
                    value={field.value}
                    max={JOB_FIELD_LIMITS.salaryRange}
                  />
                </div>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    maxLength={JOB_FIELD_LIMITS.salaryRange}
                    placeholder="e.g. 12-18 LPA, ₹30K-50K/month"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {model.compensation === "stipend" && (
          <FormField
            control={form.control}
            name="stipend"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <div className="flex items-center gap-2">
                  <FormLabel>
                    Monthly Stipend <span className="text-destructive">*</span>
                  </FormLabel>
                  <CharCount
                    value={field.value}
                    max={JOB_FIELD_LIMITS.stipend}
                  />
                </div>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    maxLength={JOB_FIELD_LIMITS.stipend}
                    placeholder="e.g. ₹15,000/month"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {model.compensation === "hourly" && (
          <FormField
            control={form.control}
            name="hourly_rate"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>
                  Hourly Rate <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-sm text-muted-foreground">
                      ₹
                    </span>
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      inputMode="decimal"
                      autoComplete="off"
                      placeholder="500.00"
                      className="pl-7"
                    />
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-sm text-muted-foreground">
                      / hour
                    </span>
                  </div>
                </FormControl>
                <FieldHint>
                  Numbers only — the rate is stored as a decimal, so write 500
                  or 499.50 rather than &ldquo;₹500/hr&rdquo;.
                </FieldHint>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </div>
    </div>
  );
}

/** Explains what the selected job type will ask for next. */
function FormHintForJobType({ jobType }: { jobType: string | undefined }) {
  if (!jobType) return null;
  const model = getJobTypeFieldModel(jobType);

  const extras: string[] = [];
  if (model.duration) extras.push("duration");
  if (model.deliverables) extras.push("deliverables");
  if (model.certificate) extras.push("certificate");

  if (extras.length === 0) return null;
  return <FieldHint>Also asks for {extras.join(", ")}.</FieldHint>;
}
