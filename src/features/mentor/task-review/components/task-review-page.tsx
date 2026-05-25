"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle, Search, XCircle } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useReviewItem, useReviewQueue } from "../hooks/use-task-review";
import type { ReviewItem } from "../schemas";

const RejectSchema = z.object({
  feedback: z.string().min(1, "Feedback is required for rejection"),
});
type RejectFormValues = z.infer<typeof RejectSchema>;

function RejectDialog({
  item,
  open,
  onOpenChange,
}: {
  item: ReviewItem | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { mutate: review, isPending } = useReviewItem();
  const form = useForm<RejectFormValues>({
    resolver: zodResolver(RejectSchema),
    defaultValues: { feedback: "" },
  });

  function onSubmit(values: RejectFormValues) {
    if (!item) return;
    review(
      {
        kalId: item.id,
        data: { status: "REJECTED", feedback: values.feedback },
      },
      {
        onSuccess: () => {
          form.reset();
          onOpenChange(false);
        },
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Reject Task Submission</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Rejecting{" "}
          <span className="font-medium text-foreground">
            {item?.task_title}
          </span>{" "}
          submitted by{" "}
          <span className="font-medium text-foreground">{item?.user_name}</span>
          .
        </p>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="feedback"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Feedback for the learner</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      placeholder="Explain why this submission is being rejected..."
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
              <Button type="submit" variant="destructive" disabled={isPending}>
                {isPending ? "Rejecting..." : "Reject"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

const STATUS_BADGE: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  PENDING: "secondary",
  APPROVED: "default",
  REJECTED: "destructive",
};

function ReviewTable({
  items,
  isLoading,
  showActions,
}: {
  items: ReviewItem[] | undefined;
  isLoading: boolean;
  showActions: boolean;
}) {
  const { mutate: review, isPending: isApproving } = useReviewItem();
  const [rejectTarget, setRejectTarget] = useState<ReviewItem | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="flex min-h-[200px] flex-col items-center justify-center gap-2 text-muted-foreground">
        <CheckCircle className="h-8 w-8" />
        <p className="text-sm">No items found.</p>
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Task</TableHead>
            <TableHead>Submitted By</TableHead>
            <TableHead>IG</TableHead>
            <TableHead>Karma</TableHead>
            <TableHead>Submitted</TableHead>
            <TableHead>Status</TableHead>
            {showActions && <TableHead>Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">
                {item.task_title}
                {item.task_hashtag && (
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    #{item.task_hashtag}
                  </p>
                )}
              </TableCell>
              <TableCell>
                <p className="font-medium">{item.user_name}</p>
                {item.user_muid && (
                  <p className="text-xs text-muted-foreground">
                    {item.user_muid}
                  </p>
                )}
              </TableCell>
              <TableCell>
                {item.ig_name ? (
                  item.ig_name
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell>
                <Badge variant="outline">{item.karma} K</Badge>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {new Date(item.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    STATUS_BADGE[item.mentor_review_status] ?? "secondary"
                  }
                >
                  {item.mentor_review_status}
                </Badge>
                {item.mentor_review_feedback && (
                  <p className="mt-0.5 max-w-[160px] truncate text-xs text-muted-foreground">
                    {item.mentor_review_feedback}
                  </p>
                )}
              </TableCell>
              {showActions && (
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950"
                          disabled={
                            isApproving ||
                            item.mentor_review_status !== "PENDING"
                          }
                          onClick={() =>
                            review({
                              kalId: item.id,
                              data: { status: "APPROVED" },
                            })
                          }
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Approve</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:bg-destructive/10"
                          disabled={item.mentor_review_status !== "PENDING"}
                          onClick={() => setRejectTarget(item)}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Reject</TooltipContent>
                    </Tooltip>
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <RejectDialog
        item={rejectTarget}
        open={!!rejectTarget}
        onOpenChange={(v) => !v && setRejectTarget(null)}
      />
    </>
  );
}

export function TaskReviewPage() {
  const [activeTab, setActiveTab] = useState("pending");
  const [search, setSearch] = useState("");

  const { data: pending, isLoading: pendingLoading } = useReviewQueue({
    status: "PENDING",
    search: search || undefined,
  });
  const { data: all, isLoading: allLoading } = useReviewQueue({
    search: search || undefined,
  });

  return (
    <TooltipProvider delayDuration={200}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Task Review</h1>
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by task or user..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="pending">
              Pending
              {pending && pending.data.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {pending.data.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="mt-4">
            <ReviewTable
              items={pending?.data}
              isLoading={pendingLoading}
              showActions
            />
          </TabsContent>

          <TabsContent value="all" className="mt-4">
            <ReviewTable
              items={all?.data}
              isLoading={allLoading}
              showActions={false}
            />
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  );
}
