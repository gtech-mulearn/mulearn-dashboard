import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiResponseError } from "@/hooks/use-get-error";
import {
  createDepartment,
  type DepartmentParams,
  deleteDepartment,
  fetchDepartments,
  updateDepartment,
} from "../api/departments.api";
import type { DepartmentFormValues } from "../schemas/departments.schema";
import { useOrgQueryErrorToast } from "./org-error";

const DEPT_KEY = "org-departments";

export const useDepartments = (
  params: DepartmentParams,
  options?: { enabled?: boolean },
) => {
  const query = useQuery({
    queryKey: [DEPT_KEY, params],
    queryFn: () => fetchDepartments(params),
    placeholderData: keepPreviousData,
    ...options,
  });
  useOrgQueryErrorToast(query.error, "Failed to load departments.");
  return query;
};

export const useCreateDepartment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: DepartmentFormValues) => createDepartment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [DEPT_KEY], exact: false });
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to create department.",
        }),
      );
    },
  });
};

export const useUpdateDepartment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: DepartmentFormValues }) =>
      updateDepartment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [DEPT_KEY], exact: false });
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to update department.",
        }),
      );
    },
  });
};

export const useDeleteDepartment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteDepartment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [DEPT_KEY], exact: false });
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to delete department.",
        }),
      );
    },
  });
};
