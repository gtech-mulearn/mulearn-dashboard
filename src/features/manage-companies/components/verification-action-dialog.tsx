"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle, XCircle } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { useVerifyCompany } from "../hooks/use-manage-companies";
import {
  type CompanyVerificationItem,
  VerificationActionFormSchema,
  type VerificationActionFormValues,
} from "../schemas";

// ─── Types ────────────────────────────────────────────────────────────────────

type ActionType = "approve" | "reject";

interface VerificationActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  company: CompanyVerificationItem | null;
  action: ActionType;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function VerificationActionDialog({
  open,
  onOpenChange,
  company,
  action,
}: VerificationActionDialogProps) {
  const verifyMutation = useVerifyCompany();

  const form = useForm<VerificationActionFormValues>({
    resolver: zodResolver(VerificationActionFormSchema),
    defaultValues: { action, reason: "" },
  });

  // Sync action into form whenever dialog opens or action changes
  useEffect(() => {
    if (open) {
      form.reset({ action, reason: "" });
    }
  }, [open, action, form]);

  const isPending = verifyMutation.isPending;

  const onSubmit = async (values: VerificationActionFormValues) => {
    if (!company) return;
    await verifyMutation.mutateAsync({
      companyId: company.id,
      payload: {
        status: values.action === "approve" ? "verified" : "rejected",
        rejection_reason: values.reason || undefined,
      } as any,
    });
    onOpenChange(false);
  };

  const isApprove = action === "approve";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-3xl border border-border bg-card">
        <DialogHeader>
          <div className="flex items-center gap-3">
            {isApprove ? (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/10">
                <CheckCircle className="h-5 w-5 text-success" />
              </div>
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                <XCircle className="h-5 w-5 text-destructive" />
              </div>
            )}
            <div>
              <DialogTitle>
                {isApprove ? "Approve Company" : "Reject Company"}
              </DialogTitle>
              <DialogDescription className="mt-0.5">
                {isApprove
                  ? `Approve "${company?.name}" and grant them access to the platform.`
                  : `Reject "${company?.name}" and notify them with a reason.`}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form
            id="verification-action-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            {/* Reason field — required for rejection, optional for approval */}
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {isApprove ? "Note (optional)" : "Rejection reason"}
                    {!isApprove && (
                      <span className="ml-1 text-destructive">*</span>
                    )}
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={
                        isApprove
                          ? "Add an optional note…"
                          : "Explain why the company is being rejected (e.g. invalid documents)…"
                      }
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
            disabled={isPending}
            className="rounded-2xl"
            aria-label="Cancel"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="verification-action-form"
            disabled={isPending}
            className={
              isApprove
                ? "rounded-2xl bg-success text-primary-foreground hover:bg-success/90 border-bg-success"
                : "rounded-2xl bg-destructive text-destructive-foreground hover:bg-destructive/90 border-bg-destructive"
            }
            aria-label={isApprove ? "Approve company" : "Reject company"}
          >
            {isPending
              ? isApprove
                ? "Approving…"
                : "Rejecting…"
              : isApprove
                ? "Approve"
                : "Reject"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
