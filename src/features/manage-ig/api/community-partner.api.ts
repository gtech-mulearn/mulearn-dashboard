/**
 * Community Partner API Layer
 *
 * 📍 src/features/manage-ig/api/community-partner.api.ts
 *
 * Full CRUD for Community Partners (patch_3_8_2026.md § 5a).
 *
 * GET    /api/v1/dashboard/community-partner/           (list, optional ?ig_id=)
 * POST   /api/v1/dashboard/community-partner/           (create)
 * GET    /api/v1/dashboard/community-partner/<id>/      (detail)
 * PATCH  /api/v1/dashboard/community-partner/<id>/      (partial update)
 * DELETE /api/v1/dashboard/community-partner/<id>/      (delete)
 */

import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import type {
  CommunityPartner,
  CommunityPartnerListResponse,
  CommunityPartnerWrite,
} from "../schemas/community-partner.schema";
import {
  CommunityPartnerDetailResponseSchema,
  CommunityPartnerListResponseSchema,
  CommunityPartnerMutationResponseSchema,
} from "../schemas/community-partner.schema";

// ─── List ─────────────────────────────────────────────────────────────────────

export interface CommunityPartnerListParams {
  ig_id?: string;
  pageIndex?: number;
  perPage?: number;
}

export async function fetchCommunityPartners(
  params: CommunityPartnerListParams = {},
): Promise<CommunityPartnerListResponse["response"]> {
  const q = new URLSearchParams();
  if (params.ig_id) q.set("ig_id", params.ig_id);
  if (params.pageIndex) q.set("pageIndex", String(params.pageIndex));
  if (params.perPage) q.set("perPage", String(params.perPage));

  const url = q.toString()
    ? `${endpoints.communityPartner.list}?${q}`
    : endpoints.communityPartner.list;

  const res = await apiClient.get(url, CommunityPartnerListResponseSchema);
  return res.response;
}

// ─── Create ───────────────────────────────────────────────────────────────────

export async function createCommunityPartner(
  data: CommunityPartnerWrite,
): Promise<CommunityPartner> {
  const res = await apiClient.post(
    endpoints.communityPartner.list,
    data,
    CommunityPartnerDetailResponseSchema,
  );
  return res.response;
}

// ─── Detail ───────────────────────────────────────────────────────────────────

export async function getCommunityPartner(
  id: string,
): Promise<CommunityPartner> {
  const res = await apiClient.get(
    endpoints.communityPartner.detail(id),
    CommunityPartnerDetailResponseSchema,
  );
  return res.response;
}

// ─── Update (PATCH) ───────────────────────────────────────────────────────────

export async function updateCommunityPartner(
  id: string,
  data: Partial<CommunityPartnerWrite>,
): Promise<void> {
  await apiClient.patch(
    endpoints.communityPartner.detail(id),
    data,
    CommunityPartnerMutationResponseSchema,
  );
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function deleteCommunityPartner(id: string): Promise<void> {
  await apiClient.delete(
    endpoints.communityPartner.detail(id),
    undefined,
    CommunityPartnerMutationResponseSchema,
  );
}
