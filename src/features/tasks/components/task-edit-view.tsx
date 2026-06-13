"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { useTaskDetail, useUpdateTask } from "../hooks";
import type { TaskFormValues } from "../schemas/tasks.schema";
import TaskForm from "./task-form";

interface TaskEditViewProps {
  id: string;
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

export default function TaskEditView({ id }: TaskEditViewProps) {
  const router = useRouter();
  const { data: task, isLoading } = useTaskDetail(id);
  const updateMutation = useUpdateTask();

  const handleSubmit = (values: TaskFormValues) => {
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
      { id, data: requestData },
      {
        onSuccess: () => {
          toast.success("Task updated successfully");
          router.push("/dashboard/management/tasks");
        },
      },
    );
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner className="size-8 text-primary" />
      </div>
    );
  }

  if (!task) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold text-foreground">
          Task not found
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          The requested task might have been deleted.
        </p>
      </div>
    );
  }

  // Pre-populate form values
  const initialValues: Partial<TaskFormValues> = {
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
  };

  return (
    <Card className="border-0 bg-transparent shadow-none rounded-none max-w-4xl mx-auto">
      <CardHeader className="px-0">
        <CardTitle className="text-2xl font-bold text-foreground">
          Edit Task
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Modify details of task configuration
        </p>
      </CardHeader>
      <CardContent className="px-0 pt-6">
        <TaskForm
          initialValues={initialValues}
          onSubmit={handleSubmit}
          isPending={updateMutation.isPending}
          submitLabel="Save Changes"
          onCancel={() => router.push("/dashboard/management/tasks")}
        />
      </CardContent>
    </Card>
  );
}
