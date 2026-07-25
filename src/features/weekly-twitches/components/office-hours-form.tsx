"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ImageUpload } from "@/components/ui/image-upload";
import { Input } from "@/components/ui/input";
import { MultiSelect } from "@/components/ui/multi-select";
import { Textarea } from "@/components/ui/textarea";
import { useInterestGroupsList } from "@/features/interest-groups";
import { useOfficeHoursMutations } from "../hooks";
import {
  type OfficeHoursItem,
  type OfficeHoursWrite,
  OfficeHoursWriteSchema,
} from "../schemas";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialData?: OfficeHoursItem | null;
}

const DEFAULTS: OfficeHoursWrite = {
  title: "",
  date: "",
  performer: "",
  designation: "",
  description: "",
  link: "",
  interest_groups: [],
};

function isoToInputDate(isoDate: string): string {
  if (!isoDate) return "";
  if (isoDate.includes("/")) {
    const [day, month, year] = isoDate.split("/");
    return `${year}-${month}-${day}`;
  }
  return isoDate;
}

export function OfficeHoursForm({ isOpen, onClose, initialData }: Props) {
  const { create, update } = useOfficeHoursMutations();
  const { data: igListData } = useInterestGroupsList();
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const igOptions = (igListData?.response?.interestGroup ?? []).map((ig) => ({
    value: ig.code ?? ig.id,
    label: ig.name,
  }));

  const {
    register,
    control,
    reset,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<OfficeHoursWrite>({
    resolver: zodResolver(OfficeHoursWriteSchema),
    defaultValues: DEFAULTS,
  });

  useEffect(() => {
    if (!isOpen) return;
    setPosterFile(null);
    if (initialData) {
      reset({
        title: initialData.title,
        date: isoToInputDate(initialData.date),
        performer: initialData.performer ?? "",
        designation: initialData.designation ?? "",
        description: initialData.description ?? "",
        link: initialData.link ?? "",
        interest_groups: initialData.interest_groups ?? [],
      });
    } else {
      reset(DEFAULTS);
    }
  }, [isOpen, initialData, reset]);

  const onSubmit = async (values: OfficeHoursWrite) => {
    if (initialData) {
      await update.mutateAsync({
        id: initialData.id,
        data: values,
        posterFile,
      });
    } else {
      await create.mutateAsync({ data: values, posterFile });
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
              ? "Edit Office Hours Session"
              : "Add Office Hours Session"}
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
              placeholder="e.g. Intro to REST APIs with Django"
              {...register("title")}
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title.message}</p>
            )}
          </div>

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
              <p className="text-xs text-destructive">{errors.date.message}</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">Performer</p>
              <Input
                className="rounded-xl border-border bg-background"
                placeholder="e.g. Alice Thomas"
                {...register("performer")}
              />
              {errors.performer && (
                <p className="text-xs text-destructive">
                  {errors.performer.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">Designation</p>
              <Input
                className="rounded-xl border-border bg-background"
                placeholder="e.g. Senior Developer"
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
            <p className="text-sm font-medium text-foreground">Description</p>
            <Textarea
              className="rounded-xl border-border bg-background"
              placeholder="Session description..."
              rows={3}
              {...register("description")}
            />
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">Meeting Link</p>
            <Input
              className="rounded-xl border-border bg-background"
              placeholder="https://meet.google.com/..."
              {...register("link")}
            />
            {errors.link && (
              <p className="text-xs text-destructive">{errors.link.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">
              Interest Groups
            </p>
            <Controller
              control={control}
              name="interest_groups"
              render={({ field }) => (
                <MultiSelect
                  options={igOptions}
                  value={Array.isArray(field.value) ? field.value : []}
                  onChange={field.onChange}
                  placeholder="Select interest groups..."
                  className="rounded-xl"
                />
              )}
            />
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">
              Poster Thumbnail
            </p>
            <ImageUpload
              value={posterFile}
              onChange={setPosterFile}
              currentUrl={initialData?.poster_thumbnail}
              maxSizeMB={5}
            />
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
