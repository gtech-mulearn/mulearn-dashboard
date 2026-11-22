/**
 * Tasks Query Keys
 *
 * 📍 src/features/tasks/hooks/query-keys.ts
 */

import type { TaskListParams } from "../types/tasks.types";

export const tasksKeys = {
  all: ["tasks"] as const,
  active: (params: TaskListParams) =>
    [...tasksKeys.all, "active", params] as const,
  inactive: (params: TaskListParams) =>
    [...tasksKeys.all, "inactive", params] as const,
};

// Task levels (useTaskLevels). The key keeps the value it had in mentor's task hooks, so the
// mentor task mutations that invalidate ["mentor-tasks"] still refresh it (moved for issue 0010).
export const taskLevelKeys = {
  list: () => ["mentor-tasks", "levels"] as const,
};
