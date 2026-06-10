"use client";

import { zodResolver } from "@hookform/resolvers/zod";

import { useForm } from "react-hook-form";
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useTaskIgDropdown } from "@/features/mentor/tasks/hooks/use-mentor-tasks";
import { useApproveSession } from "../hooks/use-sessions";
import type { Session } from "../schemas";

const ApproveFormSchema = z.object({
  ig_id: z.string().optional(),
  remarks: z.string().optional(),
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
  const { data: myIgs = [] } = useTaskIgDropdown();

  const form = useForm<ApproveFormValues>({
    resolver: zodResolver(ApproveFormSchema) as any,
    defaultValues: {
      ig_id: "GLOBAL",
      remarks: "",
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
      { onSuccess: () => onOpenChange(false) },
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
            {isApprove && (
              <FormField
                control={form.control}
                name="ig_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assign to IG (optional)</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Keep as global" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="GLOBAL">Keep as global</SelectItem>
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
            )}

            <FormField
              control={form.control}
              name="remarks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Remarks{!isApprove && " (required)"}</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      placeholder={
                        isApprove
                          ? "Optional note for the mentor"
                          : "Reason for rejection"
                      }
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                      <p className="text-sm text-muted-foreground">
                        This will {isApprove ? "approve" : "reject"} the current
                        session and all linked pending child sessions.
                      </p>
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
