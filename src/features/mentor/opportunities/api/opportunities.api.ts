// ─── Opportunities API ────────────────────────────────────────────────────────
// NOTE: The opportunities endpoints (/mentor/opportunities/...) are NOT part of
// the 22 documented mentor APIs. These stubs return empty data so the feature
// continues to compile while the alternate API is being wired up.
// ─────────────────────────────────────────────────────────────────────────────

import type { Opportunity, OpportunityFormValues } from "../schemas";

// #stub – no documented endpoint exists for mentor opportunities yet
export async function fetchOpportunities(
  _params: { status?: string; page?: number; search?: string } = {},
): Promise<{ data: Opportunity[]; totalPages: number }> {
  return { data: [], totalPages: 1 };
}

// #stub – no documented endpoint exists for creating an opportunity yet
export async function createOpportunity(
  _data: OpportunityFormValues,
): Promise<Opportunity> {
  throw new Error("createOpportunity: endpoint not yet available");
}

// #stub – no documented endpoint exists for updating an opportunity yet
export async function updateOpportunity(
  _id: string,
  _data: Partial<OpportunityFormValues>,
): Promise<Opportunity> {
  throw new Error("updateOpportunity: endpoint not yet available");
}

// #stub – no documented endpoint exists for deleting an opportunity yet
export async function deleteOpportunity(_id: string): Promise<void> {
  throw new Error("deleteOpportunity: endpoint not yet available");
}
