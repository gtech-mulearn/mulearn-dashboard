"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCreateTask } from "../hooks";
import type { TaskFormValues } from "../schemas/tasks.schema";
import TaskForm from "./task-form";

export default function TaskCreateView() {
  const router = useRouter();
  const createMutation = useCreateTask();

  const handleSubmit = (values: TaskFormValues) => {
    // Transform to TaskCreateRequest
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

    createMutation.mutate(requestData, {
      onSuccess: () => {
        toast.success("Task created successfully");
        router.push("/dashboard/management/tasks");
      },
      onError: (err: any) => {
        toast.error(err?.message || "Failed to create task");
      },
    });
  };

  return (
    <Card className="border-0 bg-transparent shadow-none rounded-none max-w-4xl mx-auto">
      <CardHeader className="px-0">
        <CardTitle className="text-2xl font-bold text-foreground">
          Create Task
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Configure a new task for users to complete
        </p>
      </CardHeader>
      <CardContent className="px-0 pt-6">
        <TaskForm
          onSubmit={handleSubmit}
          isPending={createMutation.isPending}
          submitLabel="Create Task"
          onCancel={() => router.push("/dashboard/management/tasks")}
        />
      </CardContent>
    </Card>
  );
}
