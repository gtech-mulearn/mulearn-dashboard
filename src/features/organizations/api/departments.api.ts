import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import {
  type DepartmentFormValues,
  type DepartmentItem,
  DepartmentMutationResponseSchema,
  DepartmentsListResponseSchema,
} from "../schemas/departments.schema";

export interface DepartmentParams {
  page: number;
  perPage: number;
  search?: string;
  sortBy?: string;
  orderBy?: string;
}

export interface DepartmentListData {
  data: DepartmentItem[];
  pagination: {
    count: number;
    totalPages: number;
    isNext: boolean;
    isPrev: boolean;
  };
}

export async function fetchDepartments(
  params: DepartmentParams,
): Promise<DepartmentListData> {
  const query = new URLSearchParams({
    pageIndex: String(params.page),
    perPage: String(params.perPage),
  });
  if (params.search?.trim()) query.set("search", params.search.trim());
  if (params.sortBy?.trim()) query.set("sortBy", params.sortBy.trim());
  if (params.orderBy?.trim()) query.set("orderBy", params.orderBy.trim());

  const response = await apiClient.get(
    `${endpoints.organization.departments}?${query.toString()}`,
    DepartmentsListResponseSchema,
  );

  return (
    response.response ??
    response.data ?? {
      data: [],
      pagination: { count: 0, totalPages: 1, isNext: false, isPrev: false },
    }
  );
}

export async function createDepartment(
  data: DepartmentFormValues,
): Promise<void> {
  await apiClient.post(
    endpoints.organization.departmentsCreate,
    data,
    DepartmentMutationResponseSchema,
  );
}

export async function updateDepartment(
  id: string,
  data: DepartmentFormValues,
): Promise<void> {
  await apiClient.put(
    endpoints.organization.departmentsEdit(id),
    data,
    DepartmentMutationResponseSchema,
  );
}

export async function deleteDepartment(id: string): Promise<void> {
  await apiClient.delete(endpoints.organization.departmentsDelete(id));
}
