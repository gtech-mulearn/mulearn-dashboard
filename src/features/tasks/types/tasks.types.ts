import type { Task } from "../schemas";

export interface TaskListParams {
  pageIndex: number;
  perPage: number;
  search?: string;
  sortBy?: string;
}

export interface PublicTaskListParams extends TaskListParams {
  ig_id?: string;
}

export interface TaskListData {
  data: Task[];
  pagination: {
    count: number;
    totalPages: number;
    isNext: boolean;
    isPrev: boolean;
  };
}
