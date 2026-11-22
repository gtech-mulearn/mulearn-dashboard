// The levels a task can belong to, for dropdowns in mentor task requests and achievement forms.
// Moved here from mentor's task API for dashboard issue 0010, so achievements doesn't import mentor.

import { z } from "zod";
import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import { ApiResponseSchema } from "@/lib/schemas/api-response";

export const TaskLevelSchema = z.object({
  id: z.string(),
  name: z.string(),
});
export type TaskLevel = z.infer<typeof TaskLevelSchema>;

export const TaskLevelListResponseSchema = ApiResponseSchema(
  z.array(TaskLevelSchema),
);

export async function fetchTaskLevels(): Promise<TaskLevel[]> {
  const res = await apiClient.get(
    endpoints.adminTask.taskLevelList,
    TaskLevelListResponseSchema,
    { skipAuthRedirectOn403: true },
  );
  return res.response;
}
