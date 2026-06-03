// ─── Task Requests API ────────────────────────────────────────────────────────
// NOTE: The task-requests endpoints (/mentor/task-requests/...) are NOT part of
// the 22 documented mentor APIs. These stubs return empty data so the feature
// continues to compile while the alternate API is being wired up.
// ─────────────────────────────────────────────────────────────────────────────

import type {
  ReviewTaskRequestValues,
  TaskRequest,
  TaskRequestFormValues,
} from "../schemas";

// #stub – no documented endpoint exists for mentor task-requests yet
export async function fetchTaskRequests(
  _params: { status?: string; page?: number; search?: string } = {},
): Promise<{ data: TaskRequest[]; totalPages: number }> {
  return { data: [], totalPages: 1 };
}

// #stub – no documented endpoint exists for creating a task request yet
export async function createTaskRequest(
  _data: TaskRequestFormValues,
): Promise<void> {
  throw new Error("createTaskRequest: endpoint not yet available");
}

// #stub – no documented endpoint exists for reviewing a task request yet
export async function reviewTaskRequest(
  _id: string,
  _data: ReviewTaskRequestValues,
): Promise<void> {
  throw new Error("reviewTaskRequest: endpoint not yet available");
}

// #stub – no documented endpoint exists for fetching a single task request yet
export async function fetchTaskRequest(_id: string): Promise<TaskRequest> {
  throw new Error("fetchTaskRequest: endpoint not yet available");
}

// #stub – no documented endpoint exists for withdrawing a task request yet
export async function withdrawTaskRequest(_id: string): Promise<void> {
  throw new Error("withdrawTaskRequest: endpoint not yet available");
}
