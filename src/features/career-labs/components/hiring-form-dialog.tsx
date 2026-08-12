"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Textarea } from "@/components/ui/textarea";
import { useCreateHiring, useUpdateHiring } from "../hooks";
import {
  type Hiring,
  HiringFormSchema,
  type HiringFormValues,
} from "../schemas";

interface HiringFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** If provided, the dialog is in edit mode; otherwise create mode */
  hiring?: Hiring | null;
}

const EMPTY_VALUES: HiringFormValues = {
  posted_date: "",
  role: "",
  organization: "",
  title: "",
  location: "",
  lastdate: "",
  applylink: "",
  jdlink: "",
  duration: "",
  remuneration: "",
  vacancies: 0,
  extracontent: "",
};

export function HiringFormDialog({
  open,
  onOpenChange,
  hiring,
}: HiringFormDialogProps) {
  const isEdit = Boolean(hiring);
  const createMutation = useCreateHiring();
  const updateMutation = useUpdateHiring();

  const form = useForm<HiringFormValues>({
    resolver: zodResolver(HiringFormSchema),
    defaultValues: EMPTY_VALUES,
  });

  useEffect(() => {
    if (open) {
      form.reset(
        hiring
          ? {
              posted_date: hiring.posted_date ?? "",
              role: hiring.role,
              organization: hiring.organization,
              title: hiring.title,
              location: hiring.location ?? "",
              lastdate: hiring.lastdate,
              applylink: hiring.applylink ?? "",
              jdlink: hiring.jdlink ?? "",
              duration: hiring.duration ?? "",
              remuneration: hiring.remuneration ?? "",
              vacancies: hiring.vacancies ?? 0,
              extracontent: hiring.extracontent ?? "",
            }
          : EMPTY_VALUES,
      );
    }
  }, [open, hiring, form]);

  const isPending = createMutation.isPending || updateMutation.isPending;

  const onSubmit = async (values: HiringFormValues) => {
    if (isEdit && hiring) {
      await updateMutation.mutateAsync({ id: hiring.id, payload: values });
    } else {
      await createMutation.mutateAsync(values);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto rounded-3xl border border-border bg-card">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Hiring Posting" : "Create Hiring Posting"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the details for this hiring posting."
              : "Fill in the details for the new hiring posting."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            id="hiring-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Django Backend Internship"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="organization"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organization</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Acme Corp" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Backend Intern" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Remote" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. 3 months" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="posted_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Posted Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastdate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="remuneration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Remuneration</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. ₹15,000/month" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="vacancies"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vacancies</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === ""
                            ? undefined
                            : Number(e.target.value),
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="applylink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Apply Link</FormLabel>
                  <FormControl>
                    <Input placeholder="https://…" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="jdlink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Description Link</FormLabel>
                  <FormControl>
                    <Input placeholder="https://…" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="extracontent"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Extra Content</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any additional notes…"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        <DialogFooter className="gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            aria-label="Cancel"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="default"
            form="hiring-form"
            disabled={isPending}
            aria-label={
              isEdit ? "Update hiring posting" : "Create hiring posting"
            }
          >
            {isPending ? "Saving…" : isEdit ? "Update" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
