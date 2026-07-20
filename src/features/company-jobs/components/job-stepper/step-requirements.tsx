"use client";

/**
 * StepRequirements — Step 2: Experience, description, karma, level + advanced options
 *
 * 📍 src/features/company-jobs/components/job-stepper/step-requirements.tsx
 */

import { ChevronDown, Settings2 } from "lucide-react";
import { useEffect, useState } from "react";
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
import { cn } from "@/lib/utils";
import { DURATION_UNIT_OPTIONS } from "../../constants";
import type { JobFormValues } from "../../schemas";

interface StepRequirementsProps {
  form: UseFormReturn<JobFormValues>;
}

export function StepRequirements({ form }: StepRequirementsProps) {
  const jobType = form.watch("job_type");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [hasOpenedGig, setHasOpenedGig] = useState(false);

  useEffect(() => {
    if (jobType === "Gig" && !hasOpenedGig) {
      setShowAdvanced(true);
      setHasOpenedGig(true);
    }
  }, [jobType, hasOpenedGig]);

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
              <FormLabel>
                Experience Required <span className="text-destructive">*</span>
              </FormLabel>
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

      {/* Advanced options collapsible */}
      <div className="rounded-xl border border-border overflow-hidden">
        <button
          type="button"
          onClick={() => setShowAdvanced((p) => !p)}
          className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-foreground hover:bg-muted/50 transition-colors"
        >
          <span className="flex items-center gap-2 text-muted-foreground">
            <Settings2 className="size-4" />
            Advanced options
            <span className="text-xs font-normal text-muted-foreground/70">
              — compensation, duration, certificate
            </span>
          </span>
          <ChevronDown
            className={cn(
              "size-4 text-muted-foreground transition-transform duration-200",
              showAdvanced && "rotate-180",
            )}
          />
        </button>

        {/* Animated reveal using grid trick */}
        <div
          className={cn(
            "grid transition-all duration-300 ease-in-out",
            showAdvanced ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
          )}
        >
          <div className="overflow-hidden">
            <div className="border-t border-border px-4 py-5">
              <div className="grid gap-5 sm:grid-cols-2">
                {/* Certificate Provided */}
                <FormField
                  control={form.control}
                  name="certificate_provided"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border px-4 py-3 h-fit mt-auto">
                      <div className="space-y-0.5">
                        <FormLabel className="text-sm font-medium cursor-pointer">
                          Certificate Provided
                        </FormLabel>
                        <p className="text-[11px] text-muted-foreground">
                          Completion certificate on finishing
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

                {/* Duration Combined */}
                <div className="space-y-2">
                  <label
                    htmlFor="duration_value"
                    className="text-sm font-medium leading-none"
                  >
                    Duration
                  </label>
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
                              max={365}
                              placeholder="e.g. 3"
                              value={field.value ?? ""}
                              onChange={(e) => {
                                const v = e.target.value;
                                field.onChange(
                                  v === "" ? undefined : Number(v),
                                );
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
                              <SelectTrigger>
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
                </div>

                {/* Hourly Rate */}
                <FormField
                  control={form.control}
                  name="hourly_rate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hourly Rate</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g. ₹500/hr, $25/hr" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Stipend */}
                <FormField
                  control={form.control}
                  name="stipend"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stipend</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g. ₹15,000/month" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Deliverables */}
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
                          placeholder="Type a deliverable and press Enter..."
                        />
                      </FormControl>
                      <p className="text-[11px] text-muted-foreground mt-1">
                        Press Enter or comma to add each deliverable
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
