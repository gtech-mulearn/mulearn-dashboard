import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import {
  MergeMutationResponseSchema,
  type MergePreviewData,
  MergePreviewResponseSchema,
  type TransferOrgFormValues,
  TransferResponseSchema,
} from "../schemas/transfer.schema";

export async function transferOrganization(
  data: TransferOrgFormValues,
): Promise<void> {
  await apiClient.post(
    endpoints.organization.transfer,
    data,
    TransferResponseSchema,
  );
}

export async function fetchMergePreview(
  orgId: string,
  source_org: string,
): Promise<MergePreviewData> {
  const response = await apiClient.get(
    endpoints.organization.merge(orgId),
    MergePreviewResponseSchema,
    // Pass source_org as query param — GET with body is unusual, so we use params
    { params: { source_org } } as any,
  );
  const payload = response.response ?? response.data;
  if (!payload) throw new Error("No preview data returned");
  return payload;
}

export async function executeMerge(
  orgId: string,
  source_org: string,
): Promise<void> {
  await apiClient.patch(
    endpoints.organization.merge(orgId),
    { source_org },
    MergeMutationResponseSchema,
  );
}
