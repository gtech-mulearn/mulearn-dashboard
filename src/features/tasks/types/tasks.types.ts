import type { Task } from "../schemas";

export interface TaskListParams {
  pageIndex: number;
  perPage: number;
  search?: string;
  sortBy?: string;
}

export interface PublicTaskListParams extends TaskListParams {
  ig_id?: string;
  event_id?: string;
  is_event_task?: boolean;
  event_tasks_only?: boolean;
  /** Filter by task creator type. From API: company | ig_mentor | campus_mentor | platform */
  task_source?: "company" | "ig_mentor" | "campus_mentor" | "platform";
}

export interface TaskListData {
  data: Task[];
  pagination: {
    count: number;
    totalPages: number;
    isNext: boolean;
    isPrev: boolean;
    nextPage?: number | null;
  };
}
