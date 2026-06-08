"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Edit2,
  Hash,
  Loader2,
  Plus,
  Trash2,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
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
import { useTaskIgDropdown } from "@/features/mentor/tasks/hooks/use-mentor-tasks";
import {
  useCreateMentorTask,
  useDeleteMentorTask,
  useMentorTasks,
  useUpdateMentorTask,
} from "@/features/mentor/tasks/hooks/use-mentor-tasks";
import type {
  MentorTask,
  MentorTaskFormValues,
} from "@/features/mentor/tasks/schemas";
import { MentorTaskFormSchema } from "@/features/mentor/tasks/schemas";

// ─── Status Config ─────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<
  string,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
    icon: React.ComponentType<{ className?: string }>;
    className: string;
  }
> = {
  pending: {
    label: "Pending",
    variant: "secondary",
    icon: Clock,
    className: "text-amber-600 bg-amber-50 border-amber-200",
  },
  approved: {
    label: "Approved",
    variant: "default",
    icon: CheckCircle2,
    className: "text-emerald-700 bg-emerald-50 border-emerald-200",
  },
  rejected: {
    label: "Rejected",
    variant: "destructive",
    icon: XCircle,
    className: "text-red-600 bg-red-50 border-red-200",
  },
};

// ─── Task Form Dialog (Create + Edit) ─────────────────────────────────────────
function TaskFormDialog({
  open,
  onOpenChange,
  task,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  task?: MentorTask | null;
}) {
  const isEdit = !!task;
  const { data: myIgs = [] } = useTaskIgDropdown();
  const { mutate: create, isPending: isCreating } = useCreateMentorTask();
  const { mutate: update, isPending: isUpdating } = useUpdateMentorTask(
    task?.id ?? "",
  );
  const isPending = isCreating || isUpdating;

  const form = useForm<MentorTaskFormValues>({
    resolver: zodResolver(MentorTaskFormSchema) as any,
    defaultValues: {
      hashtag: "",
      title: "",
      karma: 100,
      usage_count: 1,
      description: "",
      type: "",
      level: "",
      ig: "",
      skill_ids: [],
    } as any,
  });

  // Populate form when editing
  useEffect(() => {
    if (task && open) {
      form.reset({
        hashtag: task.hashtag ?? "",
        title: task.title ?? "",
        karma: task.karma ?? 100,
        usage_count: task.usage_count ?? 1,
        description: task.description ?? "",
        type: task.type ?? "",
        level: task.level ?? "",
        ig: task.ig ?? "",
        skill_ids: [],
      });
    } else if (!task && open) {
      form.reset({
        hashtag: "",
        title: "",
        karma: 100,
        usage_count: 1,
        description: "",
        type: "",
        level: "",
        ig: "",
        skill_ids: [],
      });
    }
  }, [task, open, form]);

  function onSubmit(values: MentorTaskFormValues) {
    const payload = {
      ...values,
      hashtag: values.hashtag.startsWith("#")
        ? values.hashtag
        : `#${values.hashtag}`,
    };

    if (isEdit) {
      update(payload, {
        onSuccess: () => {
          onOpenChange(false);
        },
      });
    } else {
      create(payload, {
        onSuccess: () => {
          form.reset();
          onOpenChange(false);
        },
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Task" : "Submit New Task"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the task details. It will be re-submitted for admin approval."
              : "Submit a new task for admin review and approval."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit as any)}
            className="space-y-4"
          >
            {/* Title */}
            <FormField
              control={form.control as any}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Task Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Design a PR Campaign" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Hashtag */}
            <FormField
              control={form.control as any}
              name="hashtag"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hashtag</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        className="pl-9"
                        placeholder="pr-campaign-design"
                        {...field}
                        onChange={(e) => {
                          let val = e.target.value;
                          if (val.startsWith("#")) val = val.slice(1);
                          field.onChange(val);
                        }}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* IG + Karma row */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control as any}
                name="ig"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Interest Group</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select IG" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
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

              <FormField
                control={form.control as any}
                name="karma"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Karma Points</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        {...field}
                        onChange={(e) =>
                          field.onChange(e.target.valueAsNumber || 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Type + Level row */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control as any}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Task Type ID</FormLabel>
                    <FormControl>
                      <Input placeholder="Type UUID" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control as any}
                name="level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Level ID (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Level UUID" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Usage Count */}
            <FormField
              control={form.control as any}
              name="usage_count"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Usage Count</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      {...field}
                      onChange={(e) =>
                        field.onChange(e.target.valueAsNumber || 1)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control as any}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      placeholder="Describe what the mentee should do..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isPending
                  ? isEdit
                    ? "Updating..."
                    : "Submitting..."
                  : isEdit
                    ? "Update & Re-submit"
                    : "Submit Task"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Delete Confirmation Dialog ───────────────────────────────────────────────
function DeleteConfirmDialog({
  task,
  open,
  onOpenChange,
}: {
  task: MentorTask | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { mutate: deleteTask, isPending } = useDeleteMentorTask();

  function onConfirm() {
    if (!task) return;
    deleteTask(task.id, {
      onSuccess: () => onOpenChange(false),
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            Delete Task
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to permanently delete{" "}
            <strong>&ldquo;{task?.title}&rdquo;</strong>? This action cannot be
            undone. Only pending tasks can be deleted.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isPending}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
function TaskStatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
  const Icon = config.icon;
  return (
    <Badge
      variant="outline"
      className={`gap-1 text-xs font-medium ${config.className}`}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}

// ─── Tasks Table ──────────────────────────────────────────────────────────────
function TasksTable({
  tasks,
  isLoading,
  onEdit,
  onDelete,
}: {
  tasks: MentorTask[] | undefined;
  isLoading: boolean;
  onEdit: (t: MentorTask) => void;
  onDelete: (t: MentorTask) => void;
}) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  if (!tasks || tasks.length === 0) {
    return (
      <div className="flex min-h-[220px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-muted-foreground">
        <CheckCircle2 className="h-8 w-8 opacity-40" />
        <p className="text-sm">No tasks found.</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Task</TableHead>
          <TableHead>IG</TableHead>
          <TableHead className="text-right">Karma</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Submitted</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tasks.map((task) => (
          <TableRow key={task.id}>
            {/* Title + hashtag */}
            <TableCell className="font-medium">
              <div className="flex flex-col gap-0.5">
                <span>{task.title}</span>
                {task.hashtag && (
                  <span className="text-xs text-muted-foreground">
                    {task.hashtag.startsWith("#")
                      ? task.hashtag
                      : `#${task.hashtag}`}
                  </span>
                )}
              </div>
            </TableCell>

            {/* IG */}
            <TableCell className="text-sm text-muted-foreground">
              {task.ig ?? "—"}
            </TableCell>

            {/* Karma */}
            <TableCell className="text-right">
              <Badge variant="outline" className="font-mono">
                {task.karma} pts
              </Badge>
            </TableCell>

            {/* Status + rejection reason */}
            <TableCell>
              <div className="flex flex-col gap-1">
                <TaskStatusBadge status={task.approval_status} />
                {task.approval_status === "rejected" &&
                  task.rejection_reason && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <p className="max-w-[140px] truncate text-xs text-destructive cursor-help">
                          {task.rejection_reason}
                        </p>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="text-xs">{task.rejection_reason}</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
              </div>
            </TableCell>

            {/* Submitted date */}
            <TableCell className="text-sm text-muted-foreground">
              {task.requested_at
                ? new Date(task.requested_at).toLocaleDateString()
                : task.created_at
                  ? new Date(task.created_at).toLocaleDateString()
                  : "—"}
            </TableCell>

            {/* Actions */}
            <TableCell>
              <div className="flex items-center gap-1">
                {/* Edit — available for pending and rejected tasks */}
                {(task.approval_status === "pending" ||
                  task.approval_status === "rejected") && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onEdit(task)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Edit & Re-submit</TooltipContent>
                  </Tooltip>
                )}

                {/* Delete — only for pending tasks */}
                {task.approval_status === "pending" && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                        onClick={() => onDelete(task)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Delete (pending only)</TooltipContent>
                  </Tooltip>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export function TaskRequestsPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [editTask, setEditTask] = useState<MentorTask | null>(null);
  const [deleteTask, setDeleteTask] = useState<MentorTask | null>(null);

  const { data: allResult, isLoading: allLoading } = useMentorTasks({});
  const { data: pendingResult, isLoading: pendingLoading } = useMentorTasks({
    approval_status: "pending",
  });
  const { data: approvedResult, isLoading: approvedLoading } = useMentorTasks({
    approval_status: "approved",
  });
  const { data: rejectedResult, isLoading: rejectedLoading } = useMentorTasks({
    approval_status: "rejected",
  });

  const pendingCount = pendingResult?.data?.length ?? 0;

  return (
    <TooltipProvider delayDuration={200}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">My Tasks</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Submit and track tasks you've requested for admin approval.
            </p>
          </div>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Submit Task
          </Button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All Tasks</TabsTrigger>
            <TabsTrigger value="pending">
              Pending
              {pendingCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {pendingCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4">
            <TasksTable
              tasks={allResult?.data}
              isLoading={allLoading}
              onEdit={setEditTask}
              onDelete={setDeleteTask}
            />
          </TabsContent>

          <TabsContent value="pending" className="mt-4">
            <TasksTable
              tasks={pendingResult?.data}
              isLoading={pendingLoading}
              onEdit={setEditTask}
              onDelete={setDeleteTask}
            />
          </TabsContent>

          <TabsContent value="approved" className="mt-4">
            <TasksTable
              tasks={approvedResult?.data}
              isLoading={approvedLoading}
              onEdit={setEditTask}
              onDelete={setDeleteTask}
            />
          </TabsContent>

          <TabsContent value="rejected" className="mt-4">
            <TasksTable
              tasks={rejectedResult?.data}
              isLoading={rejectedLoading}
              onEdit={setEditTask}
              onDelete={setDeleteTask}
            />
          </TabsContent>
        </Tabs>

        {/* Create Dialog */}
        <TaskFormDialog open={createOpen} onOpenChange={setCreateOpen} />

        {/* Edit Dialog */}
        <TaskFormDialog
          open={!!editTask}
          onOpenChange={(v) => !v && setEditTask(null)}
          task={editTask}
        />

        {/* Delete Confirm Dialog */}
        <DeleteConfirmDialog
          task={deleteTask}
          open={!!deleteTask}
          onOpenChange={(v) => !v && setDeleteTask(null)}
        />
      </div>
    </TooltipProvider>
  );
}
