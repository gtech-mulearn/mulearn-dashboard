"use client";

/**
 * StepRequirements — Step 2: Experience, description, karma, level
 *
 * 📍 src/features/company-jobs/components/job-stepper/step-requirements.tsx
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
import { Textarea } from "@/components/ui/textarea";
import { MIN_LEVEL_OPTIONS } from "../../constants";
import type { JobFormValues } from "../../schemas";

interface StepRequirementsProps {
  form: UseFormReturn<JobFormValues>;
}

export function StepRequirements({ form }: StepRequirementsProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">
          Requirements & Eligibility
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Define what candidates need to qualify for this position.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="experience"
          render={({ field }) => (
            <FormItem className="sm:col-span-2">
              <FormLabel>Experience Required</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="e.g. 2-4 years, Fresher, 5+ years"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="job_description"
          render={({ field }) => (
            <FormItem className="sm:col-span-2">
              <FormLabel>Job Description</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Describe the role, responsibilities, and what a typical day looks like..."
                  rows={6}
                  className="resize-y"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="min_karma"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Minimum Karma</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  min={0}
                  max={10000}
                  placeholder="0"
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="min_level"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Minimum Level</FormLabel>
              <Select
                value={String(field.value)}
                onValueChange={(val) => field.onChange(Number(val))}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {MIN_LEVEL_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={String(opt.value)}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
