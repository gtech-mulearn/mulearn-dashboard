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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useCreateAffiliation,
  useUpdateAffiliation,
} from "../hooks/use-affiliations";
import {
  AffiliationFormSchema,
  type AffiliationFormValues,
  type AffiliationItem,
} from "../schemas";

interface AffiliationFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  affiliation?: AffiliationItem | null;
}

export function AffiliationFormDialog({
  open,
  onOpenChange,
  affiliation,
}: AffiliationFormDialogProps) {
  const isEdit = Boolean(affiliation);
  const createMutation = useCreateAffiliation();
  const updateMutation = useUpdateAffiliation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AffiliationFormValues>({
    resolver: zodResolver(AffiliationFormSchema),
    defaultValues: { title: "" },
  });

  // Sync form values when dialog opens or affiliation changes
  useEffect(() => {
    if (open) {
      reset({ title: affiliation?.title ?? "" });
    }
  }, [open, affiliation, reset]);

  const isPending =
    isSubmitting || createMutation.isPending || updateMutation.isPending;

  const onSubmit = async (values: AffiliationFormValues) => {
    if (isEdit && affiliation) {
      await updateMutation.mutateAsync({ id: affiliation.id, payload: values });
    } else {
      await createMutation.mutateAsync(values);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-3xl border border-border bg-card">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Affiliation" : "Create Affiliation"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the affiliation name."
              : "Add a new university or organization affiliation."}
          </DialogDescription>
        </DialogHeader>

        <form
          id="affiliation-form"
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 pt-2"
        >
          <div className="space-y-1.5">
            <Label htmlFor="affiliation-title">Affiliation Name</Label>
            <Input
              id="affiliation-title"
              placeholder="e.g. Kerala Technological University"
              {...register("title")}
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title.message}</p>
            )}
          </div>
        </form>

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
            form="affiliation-form"
            disabled={isPending}
            aria-label={isEdit ? "Update affiliation" : "Create affiliation"}
          >
            {isPending ? "Saving…" : isEdit ? "Update" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
