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
