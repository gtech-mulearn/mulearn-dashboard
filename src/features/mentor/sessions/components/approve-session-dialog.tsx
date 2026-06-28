"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { getApiResponseError } from "@/hooks/use-get-error";
import { useApproveSession } from "../hooks/use-sessions";
import type { Session } from "../schemas";

const ApproveFormSchema = z.object({
  apply_to_series: z.boolean().optional().default(false),
});
type ApproveFormValues = z.infer<typeof ApproveFormSchema>;

interface ApproveSessionDialogProps {
  session: Session | null;
  action: "approve" | "reject" | "cancel";
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ACTION_CONFIG = {
  approve: {
    status: "SCHEDULED" as const,
    title: "Approve Session",
    button: "Approve",
    variant: "default" as const,
    seriesHint:
      "This will approve all future recurring sessions in this series.",
  },
  reject: {
    status: "REJECTED" as const,
    title: "Reject Session",
    button: "Reject",
    variant: "destructive" as const,
    seriesHint:
      "This will reject all future recurring sessions in this series.",
  },
  cancel: {
    status: "CANCELLED" as const,
    title: "Cancel Session",
    button: "Cancel Session",
    variant: "destructive" as const,
    seriesHint: "This will cancel all scheduled sessions in this series.",
  },
};

export function ApproveSessionDialog({
  session,
  action,
  open,
  onOpenChange,
}: ApproveSessionDialogProps) {
  const { mutate: approve, isPending } = useApproveSession();
  const config = ACTION_CONFIG[action];

  const form = useForm<ApproveFormValues>({
    resolver: zodResolver(ApproveFormSchema) as any,
    defaultValues: {
      apply_to_series: false,
    } as any,
  });

  function onSubmit(values: ApproveFormValues) {
    if (!session) return;
    approve(
      {
        id: session.id,
        data: {
          status: config.status,
          apply_to_series: values.apply_to_series,
        },
      },
      {
        onSuccess: () => onOpenChange(false),
        onError: (error) => {
          toast.error(
            getApiResponseError(error, {
              fallback: "Failed to update session status",
            }),
          );
        },
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{config.title}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit as any)}
            className="space-y-4"
          >
            {session?.is_recurring && (
              <FormField
                control={form.control}
                name="apply_to_series"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Apply to entire series</FormLabel>
                      <FormDescription>{config.seriesHint}</FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            )}

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant={config.variant}
                disabled={isPending}
              >
                {isPending ? "Submitting..." : config.button}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
