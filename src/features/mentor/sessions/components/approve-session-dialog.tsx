"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { getApiResponseError } from "@/hooks/use-get-error";
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
import { useApproveSession } from "../hooks/use-sessions";
import type { Session } from "../schemas";

const ApproveFormSchema = z.object({
  apply_to_series: z.boolean().optional().default(false),
});
type ApproveFormValues = z.infer<typeof ApproveFormSchema>;

interface ApproveSessionDialogProps {
  session: Session | null;
  action: "approve" | "reject";
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ApproveSessionDialog({
  session,
  action,
  open,
  onOpenChange,
}: ApproveSessionDialogProps) {
  const { mutate: approve, isPending } = useApproveSession();

  const form = useForm<ApproveFormValues>({
    resolver: zodResolver(ApproveFormSchema) as any,
    defaultValues: {
      apply_to_series: false,
    } as any,
  });

  function onSubmit(values: ApproveFormValues) {
    if (!session) return;
    // Doc payload: { status: "SCHEDULED" } to approve, { status: "REJECTED" } to reject
    approve(
      {
        id: session.id,
        data: {
          status: isApprove ? "SCHEDULED" : "REJECTED",
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

  const isApprove = action === "approve";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isApprove ? "Approve Session" : "Reject Session"}
          </DialogTitle>
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
                      <FormDescription>
                        {isApprove
                          ? "This will approve all future recurring sessions in this series."
                          : "This will reject all future recurring sessions in this series."}
                      </FormDescription>
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
                variant={isApprove ? "default" : "destructive"}
                disabled={isPending}
              >
                {isPending ? "Submitting..." : isApprove ? "Approve" : "Reject"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
