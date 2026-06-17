import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  fetchUnverifiedOrgs,
  verifyOrganization,
} from "../api/verification.api";
import type { VerifyOrgFormValues } from "../schemas/verification.schema";
import { getApiResponseError } from "@/hooks/use-get-error";
import { useOrgQueryErrorToast } from "./org-error";

const VERIFY_KEY = "org-unverified";

export const useUnverifiedOrgs = () => {
  const query = useQuery({
    queryKey: [VERIFY_KEY],
    queryFn: fetchUnverifiedOrgs,
    staleTime: 60 * 1000,
  });
  useOrgQueryErrorToast(
    query.error,
    "Failed to load unverified organizations.",
  );
  return query;
};

export const useVerifyOrganization = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      uorgId,
      data,
    }: {
      uorgId: string;
      data: VerifyOrgFormValues;
    }) => verifyOrganization(uorgId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [VERIFY_KEY], exact: false });
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to verify organization.",
        }),
      );
    },
  });
};
