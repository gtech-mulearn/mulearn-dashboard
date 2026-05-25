"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle, Plus, XCircle } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { getMentorMyIgs } from "@/features/home/api/home.api";
import {
  useCreateTaskRequest,
  useReviewTaskRequest,
  useTaskRequests,
} from "../hooks/use-task-requests";
import type { TaskRequest } from "../schemas";
import { TaskRequestFormSchema, type TaskRequestFormValues } from "../schemas";

const RejectSchema = z.object({
  admin_note: z.string().min(1, "Reason is required"),
});
type RejectValues = z.infer<typeof RejectSchema>;

function CreateTaskRequestDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { data: myIgs = [] } = useQuery({
    queryKey: ["mentor-my-igs"],
    queryFn: getMentorMyIgs,
  });

  const { mutate: create, isPending } = useCreateTaskRequest();
  const form = useForm<TaskRequestFormValues>({
    resolver: zodResolver(TaskRequestFormSchema),
    defaultValues: {
      title: "",
      hashtag: "",
      ig_id: "",
      karma: 10,
      description: "",
    },
  });

  function onSubmit(values: TaskRequestFormValues) {
    create(values, {
      onSuccess: () => {
        form.reset();
        onOpenChange(false);
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>New Task Request</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Task Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Build a REST API" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="hashtag"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hashtag</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. #build-rest-api" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="ig_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Interest Group</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an IG" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {myIgs.map((ig) => (
                        <SelectItem key={ig.ig_id} value={ig.ig_id}>
                          {ig.ig_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="karma"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Karma Points</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      {...field}
                      onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (optional)</FormLabel>
                  <FormControl>
                    <Textarea rows={2} {...field} />
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
              <Button type="submit" disabled={isPending}>
                {isPending ? "Creating..." : "Create"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function RejectDialog({
  item,
  open,
  onOpenChange,
}: {
  item: TaskRequest | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { mutate: review, isPending } = useReviewTaskRequest();
  const form = useForm<RejectValues>({
    resolver: zodResolver(RejectSchema),
    defaultValues: { admin_note: "" },
  });

  function onSubmit(values: RejectValues) {
    if (!item) return;
    review(
      {
        id: item.id,
        data: { status: "REJECTED", admin_note: values.admin_note },
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
          <DialogTitle>Reject Task Request</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="admin_note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      placeholder="Explain the rejection..."
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

function RequestTable({
  items,
  isLoading,
  showActions,
}: {
  items: TaskRequest[] | undefined;
  isLoading: boolean;
  showActions: boolean;
}) {
  const { mutate: review, isPending } = useReviewTaskRequest();
  const [rejectTarget, setRejectTarget] = useState<TaskRequest | null>(null);

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
        <p className="text-sm">No task requests found.</p>
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Task</TableHead>
            <TableHead>IG</TableHead>
            <TableHead>Karma</TableHead>
            <TableHead>Status</TableHead>
            {showActions && <TableHead>Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((req) => (
            <TableRow key={req.id}>
              <TableCell className="font-medium">
                {req.title}
                {req.hashtag && (
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {req.hashtag}
                  </p>
                )}
                {req.description && (
                  <p className="mt-0.5 max-w-[240px] truncate text-xs text-muted-foreground">
                    {req.description}
                  </p>
                )}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {req.ig_name ?? "—"}
              </TableCell>
              <TableCell>
                <Badge variant="outline">{req.karma} K</Badge>
              </TableCell>
              <TableCell>
                <Badge variant={STATUS_BADGE[req.status] ?? "secondary"}>
                  {req.status}
                </Badge>
                {req.admin_note && (
                  <p className="mt-0.5 max-w-[160px] truncate text-xs text-muted-foreground">
                    {req.admin_note}
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
                          disabled={isPending}
                          onClick={() =>
                            review({ id: req.id, data: { status: "APPROVED" } })
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
                          onClick={() => setRejectTarget(req)}
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

export function TaskRequestsPage() {
  const [createOpen, setCreateOpen] = useState(false);

  const { data: pending, isLoading: pendingLoading } = useTaskRequests({
    status: "PENDING",
  });
  const { data: all, isLoading: allLoading } = useTaskRequests({});

  return (
    <TooltipProvider delayDuration={200}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Task Requests</h1>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Request
          </Button>
        </div>

        <Tabs defaultValue="pending">
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
            <RequestTable
              items={pending?.data}
              isLoading={pendingLoading}
              showActions
            />
          </TabsContent>

          <TabsContent value="all" className="mt-4">
            <RequestTable
              items={all?.data}
              isLoading={allLoading}
              showActions={false}
            />
          </TabsContent>
        </Tabs>

        <CreateTaskRequestDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
        />
      </div>
    </TooltipProvider>
  );
}
