"use client";

import { TaskDetailDialog } from "@/components/task-detail-dialog";
import { useCompanyTaskDetail } from "../hooks/use-company-tasks";

interface TaskDetailModalProps {
  taskId: string | null;
  onClose: () => void;
}

export function TaskDetailModal({ taskId, onClose }: TaskDetailModalProps) {
  const { data: task, isLoading, error } = useCompanyTaskDetail(taskId || "");

  return (
    <TaskDetailDialog
      open={!!taskId}
      onClose={onClose}
      task={task}
      isLoading={isLoading}
      error={!!error}
      description="Full details for this company task."
    />
  );
}
