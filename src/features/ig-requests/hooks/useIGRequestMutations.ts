import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createIGRequest, deleteIGRequest } from "../api";
import { igRequestKeys } from "./query-keys";
import type { CreateIGRequestForm } from "../schemas";
import type { ApiError } from "@/api/client";

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
