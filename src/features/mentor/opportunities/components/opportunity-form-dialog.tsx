"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
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
import { useTaskIgDropdown } from "@/features/mentor/tasks/hooks/use-mentor-tasks";
import { useCompanies } from "@/features/onboarding/hooks";

import {
  useCreateOpportunity,
  useOpportunityDetail,
  useUpdateOpportunity,
} from "../hooks/use-opportunities";

import type { Opportunity, OpportunityFormValues } from "../schemas";
import { OpportunityFormSchema } from "../schemas";

interface OpportunityFormDialogProps {
  opportunity?: Opportunity;
  open: boolean;
  onOpenChange: (value: boolean) => void;
}

// ─── Date helpers ─────────────────────────────────────────────────────────────

/**
 * Converts a backend ISO datetime into the value expected by
 * <input type="datetime-local">.
 *
 * Example:
 * 2026-09-21T09:00:00.000Z
 *        ↓
 * 2026-09-21T14:30
 */
function toDateTimeLocal(iso: string | null | undefined): string {
  if (!iso) {
    return "";
  }

  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const pad = (value: number) => String(value).padStart(2, "0");

  return [
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
    `${pad(date.getHours())}:${pad(date.getMinutes())}`,
  ].join("T");
}

/**
 * Converts <input type="datetime-local"> into an ISO datetime
 * accepted by the backend.
 *
 * Example:
 * 2026-09-21T14:30
 *        ↓
 * 2026-09-21T09:00:00.000Z
 *
 * The browser interprets the datetime-local value in the user's
 * local timezone and toISOString() converts it to UTC.
 */
function toBackendDateTime(value: string | undefined): string | undefined {
  if (!value) {
    return undefined;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return undefined;
  }

  return date.toISOString();
}

// ─── Defaults ────────────────────────────────────────────────────────────────

const DEFAULTS: OpportunityFormValues = {
  title: "",
  description: "",
  type: "CHALLENGE",
  ig_id: "",
  org_id: "",
  status: "DRAFT",
  eligibility: "",
  application_url: "",
  starts_at: "",
  ends_at: "",
};

// ─── Component ───────────────────────────────────────────────────────────────

export function OpportunityFormDialog({
  opportunity,
  open,
  onOpenChange,
}: OpportunityFormDialogProps) {
  const isEdit = Boolean(opportunity);

  const { data: fetchedDetail } = useOpportunityDetail(
    opportunity?.id ?? "",
    open && isEdit,
  );

  const activeOpportunity = fetchedDetail ?? opportunity;

  const { mutate: create, isPending: isCreating } = useCreateOpportunity();

  const { mutate: update, isPending: isUpdating } = useUpdateOpportunity(
    opportunity?.id ?? "",
  );

  const isPending = isCreating || isUpdating;

  const { data: myIgs = [] } = useTaskIgDropdown();
  const { data: companies = [] } = useCompanies();

  const form = useForm<OpportunityFormValues>({
    resolver: zodResolver(OpportunityFormSchema),
    defaultValues: DEFAULTS,
  });
  const { dirtyFields } = form.formState;

  // ─── Populate form ─────────────────────────────────────────────────────────

  useEffect(() => {
    if (!open) {
      return;
    }

    if (activeOpportunity) {
      form.reset({
        title: activeOpportunity.title,
        description: activeOpportunity.description ?? "",
        type: activeOpportunity.type,

        ig_id: activeOpportunity.ig ?? "",
        org_id: activeOpportunity.org ?? "",

        status: activeOpportunity.status,

        eligibility: activeOpportunity.eligibility ?? "",
        application_url: activeOpportunity.application_url ?? "",

        starts_at: toDateTimeLocal(activeOpportunity.starts_at),

        ends_at: toDateTimeLocal(activeOpportunity.ends_at),
      });

      return;
    }

    form.reset(DEFAULTS);
  }, [open, activeOpportunity, form]);

  // ─── Submit ────────────────────────────────────────────────────────────────

  function onSubmit(values: OpportunityFormValues) {
    if (isEdit) {
      const payload = {
        ...values,
        // Undefined omits unchanged fields; null explicitly clears a date.
        starts_at: dirtyFields.starts_at
          ? (toBackendDateTime(values.starts_at) ?? null)
          : undefined,
        ends_at: dirtyFields.ends_at
          ? (toBackendDateTime(values.ends_at) ?? null)
          : undefined,
      } as Partial<OpportunityFormValues>;

      update(payload, {
        onSuccess: () => onOpenChange(false),
      });

      return;
    }

    create(
      {
        ...values,
        // Convert datetime-local values into backend ISO datetimes.
        starts_at: toBackendDateTime(values.starts_at),
        ends_at: toBackendDateTime(values.ends_at),
      },
      {
        onSuccess: () => onOpenChange(false),
      },
    );
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-w-lg flex-col gap-0 p-0">
        <DialogHeader className="shrink-0 px-6 pb-4 pt-6">
          <DialogTitle>
            {isEdit ? "Edit Opportunity" : "New Opportunity"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex min-h-0 flex-col"
          >
            <div className="space-y-4 overflow-y-auto px-6 py-4">
              {/* ─── Title ─────────────────────────────────────────────── */}

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>

                    <FormControl>
                      <Input
                        placeholder="e.g. Open Source Contributor"
                        {...field}
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* ─── Description ──────────────────────────────────────── */}

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>

                    <FormControl>
                      <Textarea
                        rows={3}
                        placeholder="Describe the opportunity..."
                        {...field}
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* ─── Interest Group ───────────────────────────────────── */}

              <FormField
                control={form.control}
                name="ig_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Interest Group</FormLabel>

                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isEdit}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              myIgs.length === 0
                                ? "No linked IGs — link one from your profile"
                                : "Select an Interest Group..."
                            }
                          />
                        </SelectTrigger>
                      </FormControl>

                      <SelectContent>
                        {myIgs.map((ig) => (
                          <SelectItem key={ig.id} value={ig.id}>
                            {ig.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* ─── Organization ─────────────────────────────────────── */}

              <FormField
                control={form.control}
                name="org_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organization</FormLabel>

                    <Select
                      value={field.value || "none"}
                      onValueChange={(value) =>
                        field.onChange(value === "none" ? "" : value)
                      }
                      disabled={isEdit}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              companies.length === 0
                                ? "No organizations available"
                                : "Select an Organization..."
                            }
                          />
                        </SelectTrigger>
                      </FormControl>

                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {companies.map((company) => (
                          <SelectItem key={company.id} value={company.id}>
                            {company.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* ─── Type + Status ────────────────────────────────────── */}

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>

                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={isEdit}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>

                        <SelectContent>
                          <SelectItem value="CHALLENGE">Challenge</SelectItem>

                          <SelectItem value="INTERNSHIP">Internship</SelectItem>
                        </SelectContent>
                      </Select>

                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>

                      <FormControl>
                        <div className="flex h-9 w-full items-center rounded-md border border-input bg-muted px-3 py-1 text-sm shadow-xs">
                          <span className="font-medium">{field.value}</span>
                        </div>
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* ─── Eligibility ───────────────────────────────────────── */}

              <FormField
                control={form.control}
                name="eligibility"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Eligibility (optional)</FormLabel>

                    <FormControl>
                      <Textarea
                        rows={2}
                        placeholder="Who can apply? (skills, year, prerequisites...)"
                        {...field}
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* ─── Application URL ──────────────────────────────────── */}

              <FormField
                control={form.control}
                name="application_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Application URL (optional)</FormLabel>

                    <FormControl>
                      <Input type="url" placeholder="https://..." {...field} />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* ─── Dates ─────────────────────────────────────────────── */}

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="starts_at"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Starts At (optional)</FormLabel>

                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ends_at"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ends At (optional)</FormLabel>

                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* ─── Actions ─────────────────────────────────────────────── */}

            <div className="flex shrink-0 justify-end gap-2 border-t border-border px-6 py-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>

              <Button type="submit" disabled={isPending}>
                {isPending
                  ? isEdit
                    ? "Saving..."
                    : "Creating..."
                  : isEdit
                    ? "Save Changes"
                    : "Create"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
