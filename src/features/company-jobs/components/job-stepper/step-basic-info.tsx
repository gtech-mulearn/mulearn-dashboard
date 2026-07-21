"use client";

/**
 * StepBasicInfo — Step 1: Job title, type, location, salary
 *
 * 📍 src/features/company-jobs/components/job-stepper/step-basic-info.tsx
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
import { JOB_TYPE_OPTIONS } from "../../constants";
import type { JobFormValues } from "../../schemas";

interface StepBasicInfoProps {
  form: UseFormReturn<JobFormValues>;
}

export function StepBasicInfo({ form }: StepBasicInfoProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">
          Basic Information
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Start with the essentials — what&apos;s the role and where is it?
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem className="sm:col-span-2">
              <FormLabel>
                Job Title <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
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
                      {opt.label}
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
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Location <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g. Remote, Kochi, Bangalore" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {form.watch("job_type") !== "Gig" && (
          <FormField
            control={form.control}
            name="salary_range"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>
                  Salary Range <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g. 12-18 LPA, ₹30K-50K/mo" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </div>
    </div>
  );
}
