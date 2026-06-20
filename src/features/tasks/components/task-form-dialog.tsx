"use client";

import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { useTaskDetail, useUpdateTask } from "../hooks";
import type { TaskFormValues } from "../schemas";
import TaskForm from "./task-form";

interface TaskFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: string | null;
  onSuccess?: () => void;
}

function formatDatetimeLocal(isoString?: string | null): string {
  if (!isoString) return "";
  try {
    const date = new Date(isoString);
    const tzoffset = date.getTimezoneOffset() * 60000;
    const localISOTime = new Date(date.getTime() - tzoffset)
      .toISOString()
      .slice(0, 16);
    return localISOTime;
  } catch {
    return "";
  }
}

export function TaskFormDialog({
  isOpen,
  onClose,
  taskId,
  onSuccess,
}: TaskFormDialogProps) {
  const { data: task, isLoading } = useTaskDetail(taskId || "", {
    enabled: !!taskId && isOpen,
  });
  const updateMutation = useUpdateTask();

  const handleSubmit = (values: TaskFormValues) => {
    if (!taskId) return;

    const requestData = {
      hashtag: values.hashtag,
      title: values.title,
      karma: Number(values.karma),
      usage_count: Number(values.usage_count),
      active: values.active,
      variable_karma: values.variable_karma,
      description: values.description ? values.description.trim() : null,
      channel: values.channel_id,
      type: values.type_id,
      level: values.level_id || null,
      ig: values.ig_id || null,
      org: values.organization_id || null,
      discord_link: values.discord_link || null,
      event: values.event || null,
      bonus_time: values.bonus_time
        ? new Date(values.bonus_time).toISOString()
        : null,
      bonus_karma: Number(values.bonus_karma || 0),
      skill_ids: values.skill_ids || [],
    };

    updateMutation.mutate(
      { id: taskId, data: requestData },
      {
        onSuccess: () => {
          toast.success("Task updated successfully");
          onClose();
          if (onSuccess) onSuccess();
        },
      },
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex flex-col gap-0 p-0 max-w-4xl">
        <DialogHeader className="shrink-0 px-6 pt-6 pb-4">
          <DialogTitle>Edit Task</DialogTitle>
          <DialogDescription>
            Modify task configuration details below.
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto px-6 pb-6">
          {isLoading ? (
            <div className="flex h-48 items-center justify-center">
              <Spinner className="size-8 text-primary" />
            </div>
          ) : task ? (
            <TaskForm
              initialValues={{
                hashtag: task.hashtag,
                title: task.title,
                karma: task.karma,
                usage_count: task.usage_count,
                active: task.active,
                variable_karma: task.variable_karma,
                description: task.description || "",
                channel_id: task.channel || "",
                type_id: task.type || "",
                level_id: task.level || null,
                ig_id: task.ig || null,
                organization_id: task.org || null,
                discord_link: task.discord_link || "",
                event: task.event || "",
                bonus_time: formatDatetimeLocal(task.bonus_time),
                bonus_karma: task.bonus_karma || 0,
                skill_ids: task.skill_ids || [],
              }}
              onSubmit={handleSubmit}
              isPending={updateMutation.isPending}
              submitLabel="Save Changes"
              onCancel={onClose}
            />
          ) : (
            <div className="text-center py-6">
              <p className="text-sm text-muted-foreground">
                Failed to load task details.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
