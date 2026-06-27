"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useSmtMutations, useIsMutations } from "../hooks";
import {
  CampusContentWriteSchema,
  type CampusContentItem,
  type CampusContentWrite,
} from "../schemas";

export type CampusContentType = "smt" | "isr";

const LABELS: Record<CampusContentType, { title: string; noun: string }> = {
  smt: { title: "Salt Mango Tree", noun: "episode" },
  isr: { title: "Inspiration Station Radio", noun: "episode" },
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  contentType: CampusContentType;
  initialData?: CampusContentItem | null;
}

const DEFAULTS: CampusContentWrite = {
  topic: "",
  campus: "",
  date: "",
  zone: undefined,
  description: "",
  link: "",
};

export function CampusContentForm({
  isOpen,
  onClose,
  contentType,
  initialData,
}: Props) {
  const smtMutations = useSmtMutations();
  const isMutations = useIsMutations();
  const mutations = contentType === "smt" ? smtMutations : isMutations;
  const { create, update } = mutations;

  const {
    register,
    control,
    reset,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CampusContentWrite>({
    resolver: zodResolver(CampusContentWriteSchema),
    defaultValues: DEFAULTS,
  });

  useEffect(() => {
    if (!isOpen) return;
    if (initialData) {
      reset({
        topic: initialData.topic,
        campus: initialData.campus,
        date: initialData.date,
        zone: initialData.zone ?? undefined,
        description: initialData.description ?? "",
        link: initialData.link ?? "",
      });
    } else {
      reset(DEFAULTS);
    }
  }, [isOpen, initialData, reset]);

  const onSubmit = async (values: CampusContentWrite) => {
    if (initialData) {
      await update.mutateAsync({ id: initialData.id, data: values });
    } else {
      await create.mutateAsync(values);
    }
    onClose();
  };

  const isPending = create.isPending || update.isPending || isSubmitting;
  const label = LABELS[contentType];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex h-[100dvh] w-screen max-w-none flex-col overflow-hidden rounded-none border-0 sm:h-auto sm:w-[94vw] sm:max-w-[580px] sm:rounded-2xl sm:border">
        <DialogHeader className="pb-2">
          <DialogTitle>
            {initialData ? `Edit ${label.title}` : `Add ${label.title}`}
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4 overflow-y-auto p-1 pb-4"
        >
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">
              Topic <span className="text-destructive">*</span>
            </p>
            <Input
              className="rounded-xl border-border bg-background"
              placeholder="e.g. Building Sustainable Startups"
              {...register("topic")}
            />
            {errors.topic && (
              <p className="text-xs text-destructive">{errors.topic.message}</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">
                Campus <span className="text-destructive">*</span>
              </p>
              <Input
                className="rounded-xl border-border bg-background"
                placeholder="e.g. NIT Calicut"
                {...register("campus")}
              />
              {errors.campus && (
                <p className="text-xs text-destructive">
                  {errors.campus.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">Zone</p>
              <Controller
                control={control}
                name="zone"
                render={({ field }) => (
                  <Select
                    value={field.value ?? "none"}
                    onValueChange={(v) =>
                      field.onChange(v === "none" ? undefined : v)
                    }
                  >
                    <SelectTrigger className="rounded-xl border-border bg-background">
                      <SelectValue placeholder="Select zone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No zone</SelectItem>
                      <SelectItem value="north">North</SelectItem>
                      <SelectItem value="central">Central</SelectItem>
                      <SelectItem value="south">South</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
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

          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">Description</p>
            <Textarea
              className="rounded-xl border-border bg-background"
              placeholder="Episode description..."
              rows={3}
              {...register("description")}
            />
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">
              Streaming Link
            </p>
            <Input
              className="rounded-xl border-border bg-background"
              placeholder="https://youtube.com/live/..."
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
              {initialData ? "Save Changes" : `Create ${label.noun}`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
