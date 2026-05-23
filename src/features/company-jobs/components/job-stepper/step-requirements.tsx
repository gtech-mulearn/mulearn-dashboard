"use client";

/**
 * StepRequirements — Step 2: Experience, description, karma, level + advanced options
 *
 * 📍 src/features/company-jobs/components/job-stepper/step-requirements.tsx
 */

import { ChevronDown, Settings2 } from "lucide-react";
import { useState } from "react";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { DURATION_UNIT_OPTIONS, MIN_LEVEL_OPTIONS } from "../../constants";
import type { JobFormValues } from "../../schemas";

interface StepRequirementsProps {
  form: UseFormReturn<JobFormValues>;
}

export function StepRequirements({ form }: StepRequirementsProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

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
                {/* Karma Reward */}
                <FormField
                  control={form.control}
                  name="karma_reward"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Karma Reward</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          max={10000}
                          placeholder="e.g. 500"
                          value={field.value ?? ""}
                          onChange={(e) => {
                            const v = e.target.value;
                            field.onChange(v === "" ? undefined : Number(v));
                          }}
                        />
                      </FormControl>
                      <p className="text-[11px] text-muted-foreground mt-1">
                        Karma awarded to the hired candidate
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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

                {/* Duration */}
                <FormField
                  control={form.control}
                  name="duration_value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          max={365}
                          placeholder="e.g. 3"
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
                    <FormItem className="mt-auto">
                      <FormLabel className="sr-only">Duration unit</FormLabel>
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
                        <Textarea
                          {...field}
                          placeholder="List the key outputs or deliverables expected from this role..."
                          rows={3}
                          className="resize-y"
                        />
                      </FormControl>
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
