import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiResponseError } from "@/hooks/use-get-error";
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
    onError: (error) => {
      toast.error(
        getApiResponseError(error, { fallback: "Failed to submit IG request" }),
      );
    },
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
    onError: (error) => {
      toast.error(
        getApiResponseError(error, { fallback: "Failed to cancel IG request" }),
      );
    },
  });
}
