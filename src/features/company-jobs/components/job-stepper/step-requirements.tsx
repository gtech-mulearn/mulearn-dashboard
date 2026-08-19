"use client";

/**
 * StepRequirements — Step 2: Experience, description, engagement details
 *
 * 📍 src/features/company-jobs/components/job-stepper/step-requirements.tsx
 *
 * The old "Advanced options" drawer showed duration, hourly rate, stipend,
 * deliverables and a completion certificate to every job type at once, so a
 * permanent role was asked whether it provides a certificate. Those fields are
 * now grouped as "Engagement details" and rendered only for the job types they
 * belong to (fixed-term work), with no drawer to expand.
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
import { MarkdownEditor } from "@/components/ui/markdown-editor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { TagInput } from "@/components/ui/tag-input";
import {
  DURATION_UNIT_OPTIONS,
  getJobTypeFieldModel,
  JOB_FIELD_LIMITS,
} from "../../constants";
import type { JobFormValues } from "../../schemas";
import { CharCount, FieldHint } from "./field-hint";

interface StepRequirementsProps {
  form: UseFormReturn<JobFormValues>;
}

export function StepRequirements({ form }: StepRequirementsProps) {
  const jobType = form.watch("job_type");
  const model = getJobTypeFieldModel(jobType);

  const hasEngagementSection =
    model.duration || model.deliverables || model.certificate;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Role Details</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          What the work involves and who it&apos;s for.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="experience"
          render={({ field }) => (
            <FormItem className="sm:col-span-2">
              <div className="flex items-center gap-2">
                <FormLabel>
                  Experience Required{" "}
                  <span className="text-destructive">*</span>
                </FormLabel>
                <CharCount
                  value={field.value}
                  max={JOB_FIELD_LIMITS.experience}
                  threshold={0.5}
                />
              </div>
              <FormControl>
                <Input
                  {...field}
                  maxLength={JOB_FIELD_LIMITS.experience}
                  placeholder="e.g. Fresher, 2-4 years"
                />
              </FormControl>
              <FieldHint>
                A short band, not a sentence — {JOB_FIELD_LIMITS.experience}{" "}
                characters max.
              </FieldHint>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="job_description"
          render={({ field }) => (
            <FormItem className="sm:col-span-2">
              <FormLabel>
                Job Description <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <MarkdownEditor
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Describe the role, responsibilities, and what a typical day looks like…"
                  rows={8}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Engagement details — fixed-term job types only */}
      {hasEngagementSection && (
        <div className="rounded-xl border border-border p-4 sm:p-5">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-foreground">
              Engagement Details
            </h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Optional — these apply because this is a fixed-term{" "}
              {jobType?.toLowerCase()} listing.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {model.duration && (
              <div className="space-y-2">
                <div className="text-sm font-medium leading-none">
                  Expected Duration
                </div>
                <div className="flex gap-2">
                  <FormField
                    control={form.control}
                    name="duration_value"
                    render={({ field }) => (
                      <FormItem className="flex-1 space-y-0">
                        <FormControl>
                          <Input
                            id="duration_value"
                            type="number"
                            min={1}
                            inputMode="numeric"
                            placeholder="e.g. 3"
                            aria-label="Duration amount"
                            value={field.value ?? ""}
                            onChange={(e) => {
                              const v = e.target.value;
                              field.onChange(v === "" ? undefined : Number(v));
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="duration_unit"
                    render={({ field }) => (
                      <FormItem className="w-1/3 space-y-0">
                        <Select
                          value={field.value ?? ""}
                          onValueChange={(val) =>
                            field.onChange(val || undefined)
                          }
                        >
                          <FormControl>
                            <SelectTrigger aria-label="Duration unit">
                              <SelectValue placeholder="Unit" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {DURATION_UNIT_OPTIONS.map((opt) => (
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
                </div>
                <FieldHint>
                  Leave both blank if the length isn&apos;t fixed yet — but fill
                  either one and the other becomes required.
                </FieldHint>
              </div>
            )}

            {model.certificate && (
              <FormField
                control={form.control}
                name="certificate_provided"
                render={({ field }) => (
                  <FormItem className="mt-auto flex h-fit flex-row items-center justify-between rounded-lg border border-border px-4 py-3">
                    <div className="space-y-0.5 pr-3">
                      <FormLabel className="cursor-pointer text-sm font-medium">
                        Completion Certificate
                      </FormLabel>
                      <p className="text-[11px] text-muted-foreground">
                        Issued to the candidate when the work wraps up
                      </p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value ?? false}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}

            {model.deliverables && (
              <FormField
                control={form.control}
                name="deliverables"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Deliverables</FormLabel>
                    <FormControl>
                      <TagInput
                        value={field.value ?? []}
                        onChange={field.onChange}
                        placeholder="Type a deliverable and press Enter…"
                      />
                    </FormControl>
                    <FieldHint>
                      The concrete artefacts you expect — press Enter or comma
                      after each one.
                    </FieldHint>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
