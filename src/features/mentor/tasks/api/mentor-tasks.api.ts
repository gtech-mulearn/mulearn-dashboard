import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import type {
  ActivityItem,
  MentorTask,
  MentorTaskFormValues,
  TaskIg,
  TaskLevel,
  TaskType,
} from "../schemas";
import {
  ActivityListResponseSchema,
  MentorTaskCreateResponseSchema,
  MentorTaskDetailResponseSchema,
  MentorTaskGenericResponseSchema,
  MentorTaskListResponseSchema,
  TaskIgDropdownResponseSchema,
  TaskLevelListResponseSchema,
  TaskTypeListResponseSchema,
} from "../schemas";

const OPT = { skipAuthRedirectOn403: true } as const;

interface TaskListParams {
  approval_status?: "pending" | "approved" | "rejected";
  pageIndex?: number;
  perPage?: number;
  search?: string;
  sortBy?: string;
}

interface ActivityListParams {
  pageIndex?: number;
  perPage?: number;
  search?: string;
  sortBy?: string;
}

// ─── #1 GET /tasks/ig-dropdown/ ──────────────────────────────────────────────
// Returns IGs where the authenticated mentor has an active MENTOR assignment.
export async function fetchTaskIgDropdown(): Promise<TaskIg[]> {
  const res = await apiClient.get(
    endpoints.mentor.tasksIgDropdown,
    TaskIgDropdownResponseSchema,
    OPT,
  );
  return res.response;
}

// ─── GET /task/list-task-type/ — list all available task types ───────────────
export async function fetchTaskTypes(): Promise<TaskType[]> {
  const res = await apiClient.get(
    endpoints.adminTask.taskTypeList,
    TaskTypeListResponseSchema,
    OPT,
  );
  return res.response.data;
}

// ─── GET /task/level/ — list all available task levels ───────────────────────
// Response: { response: [{ id, name }] } — array directly in response field
export async function fetchTaskLevels(): Promise<TaskLevel[]> {
  const res = await apiClient.get(
    endpoints.adminTask.taskLevelList,
    TaskLevelListResponseSchema,
    OPT,
  );
  return res.response;
}

// ─── #2 GET /tasks/ — list mentor-submitted tasks ────────────────────────────
export async function fetchMentorTasks(
  params: TaskListParams = {},
): Promise<{ data: MentorTask[]; totalPages: number; totalItems: number }> {
  const q = new URLSearchParams();
  if (params.approval_status) q.set("approval_status", params.approval_status);
  if (params.pageIndex) q.set("pageIndex", String(params.pageIndex));
  if (params.perPage) q.set("perPage", String(params.perPage));
  if (params.search) q.set("search", params.search);
  if (params.sortBy) q.set("sortBy", params.sortBy);

  const url = `${endpoints.mentor.tasks}?${q}`;
  const res = await apiClient.get(url, MentorTaskListResponseSchema, OPT);
  return {
    data: res.response.data,
    totalPages: res.response.pagination.totalPages,
    totalItems: res.response.pagination.count ?? res.response.data.length,
  };
}

// ─── #2 POST /tasks/ — create task (submit for approval) ─────────────────────
// Backend saves with approval_status=pending, active=false.
export async function createMentorTask(
  data: MentorTaskFormValues,
): Promise<void> {
  await apiClient.post(
    endpoints.mentor.tasks,
    data,
    MentorTaskCreateResponseSchema,
    OPT,
  );
}

// ─── #3 GET /tasks/<task_id>/ — single task detail ───────────────────────────
export async function fetchMentorTask(taskId: string): Promise<MentorTask> {
  const res = await apiClient.get(
    endpoints.mentor.task(taskId),
    MentorTaskDetailResponseSchema,
    OPT,
  );
  return res.response;
}

// ─── #3 PUT /tasks/<task_id>/ — update task (re-submit for approval) ─────────
// Partial updates allowed; resets status to pending + clears review fields.
export async function updateMentorTask(
  taskId: string,
  data: Partial<MentorTaskFormValues>,
): Promise<void> {
  await apiClient.put(
    endpoints.mentor.task(taskId),
    data,
    MentorTaskGenericResponseSchema,
    OPT,
  );
}

// ─── #3 DELETE /tasks/<task_id>/ — delete task (only pending) ────────────────
export async function deleteMentorTask(taskId: string): Promise<void> {
  await apiClient.delete(
    endpoints.mentor.task(taskId),
    undefined,
    MentorTaskGenericResponseSchema,
    OPT,
  );
}

// ─── #4 GET /activity/ — merged activity feed ────────────────────────────────
// Returns SESSION_CREATED + TASK_APPRAISED items sorted by date.
export async function fetchMentorActivity(
  params: ActivityListParams = {},
): Promise<{ data: ActivityItem[]; totalPages: number }> {
  const q = new URLSearchParams();
  if (params.pageIndex) q.set("pageIndex", String(params.pageIndex));
  if (params.perPage) q.set("perPage", String(params.perPage));
  if (params.search) q.set("search", params.search);
  if (params.sortBy) q.set("sortBy", params.sortBy);

  const url = `${endpoints.mentor.activity}?${q}`;
  const res = await apiClient.get(url, ActivityListResponseSchema, OPT);
  return {
    data: res.response.data,
    totalPages: res.response.pagination.totalPages,
  };
}
