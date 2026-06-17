import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ApiError } from "@/api/client";
import { createIGRequest, deleteIGRequest } from "../api";
import type { CreateIGRequestForm } from "../schemas";
import { igRequestKeys } from "./query-keys";

export function useCreateIGRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateIGRequestForm) => createIGRequest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: igRequestKeys.all });
      toast.success("IG request submitted successfully");
    },
    onError: (error: ApiError) =>
      toast.error(error.message || "Failed to submit IG request"),
  });
}

export function useDeleteIGRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (pk: string) => deleteIGRequest(pk),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: igRequestKeys.all });
      toast.success("Interest Group request cancelled successfully");
    },
    onError: (error: ApiError) =>
      toast.error(error.message || "Failed to cancel IG request"),
  });
}
