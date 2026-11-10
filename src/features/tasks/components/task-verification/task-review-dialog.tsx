"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { useReviewTask } from "../../hooks";
import type { TaskReviewAction, TaskVerificationItem } from "../../schemas";

const ReasonSchema = z.object({
  reason: z.string().trim().min(1, "Add a reason so the requester knows why."),
});

type ReasonValues = z.infer<typeof ReasonSchema>;

const COPY: Record<
  Exclude<TaskReviewAction, "approve">,
  {
    title: string;
    description: string;
    label: string;
    placeholder: string;
    submit: string;
    pending: string;
  }
> = {
  reject: {
    title: "Reject Task",
    description: "Specify the reason for rejecting this task application.",
    label: "Rejection Reason",
    placeholder: "Explain why this task is being rejected…",
    submit: "Reject Task",
    pending: "Rejecting…",
  },
  request_changes: {
    title: "Request Changes",
    description:
      "Send the task back with what needs to change. It leaves the pending queue until the requester updates it.",
    label: "Requested Changes",
    placeholder: "e.g. Lower the karma to 200 and add submission criteria…",
    submit: "Request Changes",
    pending: "Sending…",
  },
};

interface TaskReviewDialogProps {
  task: TaskVerificationItem | null;
  action: TaskReviewAction;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export function TaskReviewDialog({
  task,
  action,
  open,
  onOpenChange,
}: TaskReviewDialogProps) {
  const { mutate: review, isPending } = useReviewTask();

  const reasonForm = useForm<ReasonValues>({
    resolver: zodResolver(ReasonSchema),
    defaultValues: { reason: "" },
  });

  const copy = action === "approve" ? null : COPY[action];

  function onApproveSubmit() {
    if (!task) return;
    review(
      {
        taskId: task.id,
        data: { action: "approve" },
      },
      { onSuccess: () => onOpenChange(false) },
    );
  }

  function onReasonSubmit(values: ReasonValues) {
    if (!task || action === "approve") return;
    review(
      {
        taskId: task.id,
        data: { action, reason: values.reason.trim() },
      },
      {
        onSuccess: () => {
          reasonForm.reset();
          onOpenChange(false);
        },
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col bg-card text-foreground border border-border">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">
            {copy ? copy.title : "Approve Task"}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {copy
              ? copy.description
              : "Are you sure you want to approve this task? This will make the task live."}
          </DialogDescription>
        </DialogHeader>

        {task && (
          <div className="flex-1 overflow-y-auto space-y-4 my-2 pr-2">
            <div className="rounded-lg border border-border bg-muted/40 p-4 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h3 className="font-semibold text-base text-foreground">
                  {task.title}
                </h3>
                <Badge variant="outline" className="w-fit">
                  {task.hashtag}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {task.description || "No description provided."}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase">
                  Karma
                </span>
                <p className="font-medium text-foreground">{task.karma}</p>
              </div>
              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase">
                  Type
                </span>
                <p className="font-medium text-foreground">
                  {task.type?.title || "—"}
                </p>
              </div>
              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase">
                  Interest Group
                </span>
                <p className="font-medium text-foreground">
                  {task.ig?.name || "—"}
                </p>
              </div>
              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase">
                  Requested By
                </span>
                <p className="font-medium text-foreground">
                  {task.requested_by?.full_name || task.company_name || "—"}
                </p>
              </div>
            </div>
          </div>
        )}

        {copy ? (
          <Form {...reasonForm}>
            <form
              onSubmit={reasonForm.handleSubmit(onReasonSubmit)}
              className="space-y-4 pt-2 border-t border-border"
            >
              <FormField
                control={reasonForm.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-foreground">
                      {copy.label}
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        rows={3}
                        placeholder={copy.placeholder}
                        className="bg-background border-border text-foreground focus-visible:ring-ring"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                  variant={action === "reject" ? "destructive" : "default"}
                  disabled={isPending}
                >
                  {isPending ? copy.pending : copy.submit}
                </Button>
              </div>
            </form>
          </Form>
        ) : (
          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={onApproveSubmit}
              disabled={isPending}
            >
              {isPending ? "Approving…" : "Approve & Publish"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
