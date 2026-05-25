"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
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
import { getMentorMyIgs } from "@/features/home/api/home.api";
import {
  useCreateOpportunity,
  useUpdateOpportunity,
} from "../hooks/use-opportunities";
import type { Opportunity } from "../schemas";
import { OpportunityFormSchema, type OpportunityFormValues } from "../schemas";

interface OpportunityFormDialogProps {
  opportunity?: Opportunity;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

// Convert backend ISO string to <input type="datetime-local"> value
function toDateTimeLocal(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const DEFAULTS: OpportunityFormValues = {
  title: "",
  description: "",
  type: "CHALLENGE",
  ig_id: "",
  status: "DRAFT",
  eligibility: "",
  application_url: "",
  starts_at: "",
  ends_at: "",
};

export function OpportunityFormDialog({
  opportunity,
  open,
  onOpenChange,
}: OpportunityFormDialogProps) {
  const isEdit = !!opportunity;
  const { mutate: create, isPending: isCreating } = useCreateOpportunity();
  const { mutate: update, isPending: isUpdating } = useUpdateOpportunity(
    opportunity?.id ?? "",
  );
  const isPending = isCreating || isUpdating;

  const { data: myIgs = [] } = useQuery({
    queryKey: ["mentor-my-igs"],
    queryFn: getMentorMyIgs,
  });

  const form = useForm<OpportunityFormValues>({
    resolver: zodResolver(OpportunityFormSchema),
    defaultValues: DEFAULTS,
  });

  useEffect(() => {
    if (!open) return;
    if (opportunity) {
      form.reset({
        title: opportunity.title,
        description: opportunity.description ?? "",
        type: opportunity.type,
        ig_id: opportunity.ig_id ?? "",
        status: opportunity.status,
        eligibility: opportunity.eligibility ?? "",
        application_url: opportunity.application_url ?? "",
        starts_at: toDateTimeLocal(opportunity.starts_at),
        ends_at: toDateTimeLocal(opportunity.ends_at),
      });
    } else {
      form.reset(DEFAULTS);
    }
  }, [open, opportunity, form]);

  function onSubmit(values: OpportunityFormValues) {
    if (isEdit) {
      update(values, { onSuccess: () => onOpenChange(false) });
    } else {
      create(values, { onSuccess: () => onOpenChange(false) });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Opportunity" : "New Opportunity"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

            <FormField
              control={form.control}
              name="ig_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Interest Group</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
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
                        <SelectItem key={ig.ig_id} value={ig.ig_id}>
                          {ig.ig_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
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
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="DRAFT">Draft</SelectItem>
                        <SelectItem value="PUBLISHED">Published</SelectItem>
                        <SelectItem value="CLOSED">Closed</SelectItem>
                        <SelectItem value="ARCHIVED">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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

            <div className="flex justify-end gap-2 pt-2">
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
