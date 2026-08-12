"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useOrgsList } from "@/features/organizations";
import { useGysMutations } from "../hooks";
import { type GysItem, type GysWrite, GysWriteSchema } from "../schemas";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialData?: GysItem | null;
}

const DEFAULTS: GysWrite = {
  title: "",
  date: "",
  time: "",
  campus: "",
  performer: "",
  designation: "",
  description: "",
  link: "",
};

function toTimeInput(time?: string | null): string {
  if (!time) return "";
  return time.slice(0, 5);
}

export function GysForm({ isOpen, onClose, initialData }: Props) {
  const { create, update } = useGysMutations();
  const [campusSearch, setCampusSearch] = useState("");

  const { data: campusData, isFetching: isCampusFetching } = useOrgsList({
    pageIndex: 1,
    perPage: 20,
    search: campusSearch,
    sortBy: "",
    org_type: "College",
    enabled: isOpen,
  });
  const campusOptions = (campusData?.data ?? []).map((org) => ({
    id: org.title,
    title: org.title,
  }));

  const {
    register,
    control,
    reset,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<GysWrite>({
    resolver: zodResolver(GysWriteSchema),
    defaultValues: DEFAULTS,
  });

  useEffect(() => {
    if (!isOpen) return;
    setCampusSearch("");
    if (initialData) {
      reset({
        title: initialData.title,
        date: initialData.date,
        time: toTimeInput(initialData.time),
        campus: initialData.campus,
        performer: initialData.performer ?? "",
        designation: initialData.designation ?? "",
        description: initialData.description ?? "",
        link: initialData.link ?? "",
      });
    } else {
      reset(DEFAULTS);
    }
  }, [isOpen, initialData, reset]);

  const onSubmit = async (values: GysWrite) => {
    if (initialData) {
      await update.mutateAsync({ id: initialData.id, data: values });
    } else {
      await create.mutateAsync(values);
    }
    onClose();
  };

  const isPending = create.isPending || update.isPending || isSubmitting;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex h-[100dvh] w-screen max-w-none flex-col overflow-hidden rounded-none border-0 sm:h-auto sm:w-[94vw] sm:max-w-[640px] sm:rounded-2xl sm:border">
        <DialogHeader className="pb-2">
          <DialogTitle>
            {initialData
              ? "Edit Grab Your Superpowers Session"
              : "Add Grab Your Superpowers Session"}
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4 overflow-y-auto p-1 pb-4"
        >
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">
              Title <span className="text-destructive">*</span>
            </p>
            <Input
              className="rounded-xl border-border bg-background"
              placeholder="e.g. Unlock Your Product Sense"
              {...register("title")}
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">
                Date <span className="text-destructive">*</span>
              </p>
              <Input
                type="date"
                className="rounded-xl border-border bg-background"
                {...register("date")}
              />
              {errors.date && (
                <p className="text-xs text-destructive">
                  {errors.date.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">
                Time <span className="text-destructive">*</span>
              </p>
              <Input
                type="time"
                className="rounded-xl border-border bg-background"
                {...register("time")}
              />
              {errors.time && (
                <p className="text-xs text-destructive">
                  {errors.time.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">
              Campus <span className="text-destructive">*</span>
            </p>
            <Controller
              control={control}
              name="campus"
              render={({ field }) => (
                <Combobox
                  options={campusOptions}
                  value={field.value}
                  onValueChange={field.onChange}
                  onSearchChange={setCampusSearch}
                  loading={isCampusFetching}
                  placeholder="Search campus..."
                  searchPlaceholder="Search campus..."
                  emptyText="No campus found."
                  onCreateNew={field.onChange}
                  createNewText="Use"
                />
              )}
            />
            {errors.campus && (
              <p className="text-xs text-destructive">
                {errors.campus.message}
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">
                Performer <span className="text-destructive">*</span>
              </p>
              <Input
                className="rounded-xl border-border bg-background"
                placeholder="e.g. Anjali Menon"
                {...register("performer")}
              />
              {errors.performer && (
                <p className="text-xs text-destructive">
                  {errors.performer.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">
                Designation <span className="text-destructive">*</span>
              </p>
              <Input
                className="rounded-xl border-border bg-background"
                placeholder="e.g. Product Manager, Zoho"
                {...register("designation")}
              />
              {errors.designation && (
                <p className="text-xs text-destructive">
                  {errors.designation.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">
              Description <span className="text-destructive">*</span>
            </p>
            <Textarea
              className="rounded-xl border-border bg-background"
              placeholder="Session description..."
              rows={3}
              {...register("description")}
            />
            {errors.description && (
              <p className="text-xs text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">
              Meeting Link <span className="text-destructive">*</span>
            </p>
            <Input
              className="rounded-xl border-border bg-background"
              placeholder="https://meet.google.com/..."
              {...register("link")}
            />
            {errors.link && (
              <p className="text-xs text-destructive">{errors.link.message}</p>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {initialData ? "Save Changes" : "Create Session"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
