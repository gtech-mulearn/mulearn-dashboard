import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  executeMerge,
  fetchMergePreview,
  transferOrganization,
} from "../api/transfer.api";
import type { TransferOrgFormValues } from "../schemas/transfer.schema";
import { getOrgErrorMessage, useOrgQueryErrorToast } from "./org-error";

// ─── Simple Transfer ──────────────────────────────────────────────────────────

export const useTransferOrganization = () =>
  useMutation({
    mutationFn: (data: TransferOrgFormValues) => transferOrganization(data),
    onError: (error) => {
      toast.error(
        getOrgErrorMessage(error, "Failed to transfer organization."),
      );
    },
  });

// ─── Merge Preview ────────────────────────────────────────────────────────────

export const useMergePreview = (
  orgId: string,
  sourceOrg: string,
  options?: { enabled?: boolean },
) => {
  const query = useQuery({
    queryKey: ["org-merge-preview", orgId, sourceOrg],
    queryFn: () => fetchMergePreview(orgId, sourceOrg),
    enabled:
      options?.enabled === true &&
      Boolean(orgId.trim()) &&
      Boolean(sourceOrg.trim()),
    retry: false,
  });
  useOrgQueryErrorToast(query.error, "Failed to fetch merge preview.");
  return query;
};

// ─── Execute Merge ────────────────────────────────────────────────────────────

export const useExecuteMerge = () =>
  useMutation({
    mutationFn: ({
      orgId,
      source_org,
    }: {
      orgId: string;
      source_org: string;
    }) => executeMerge(orgId, source_org),
    onError: (error) => {
      toast.error(getOrgErrorMessage(error, "Failed to execute merge."));
    },
  });
