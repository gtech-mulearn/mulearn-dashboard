import { describe, expect, it, vi } from "vitest";

const { apiGet } = vi.hoisted(() => ({ apiGet: vi.fn() }));
vi.mock("@/api/client", () => ({
  apiClient: { get: apiGet, post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
  publicApiClient: { get: vi.fn() },
}));

import { campusManageApi } from "./campus-manage.api";

describe("campusManageApi.getIgChapters — co-lead (BE-8)", () => {
  it("maps the chapter's co-lead when the backend sends one", async () => {
    apiGet.mockResolvedValue([
      {
        id: "ch1",
        ig_id: "ig1",
        ig_name: "Web",
        lead_id: "u1",
        lead_name: "Lead Lee",
        co_lead_id: "u2",
        co_lead_name: "Co Cora",
      },
      { id: "ch2", ig_id: "ig2", ig_name: "AI", lead_name: "Solo" },
    ]);
    const [withCoLead, withoutCoLead] = await campusManageApi.getIgChapters();
    expect(withCoLead).toMatchObject({ coLeadId: "u2", coLead: "Co Cora" });
    expect(withoutCoLead.coLead).toBeNull();
  });
});
