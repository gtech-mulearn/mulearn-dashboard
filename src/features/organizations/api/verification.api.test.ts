import { beforeEach, describe, expect, it, vi } from "vitest";

const { get, post } = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn() }));
vi.mock("@/api/client", () => ({ apiClient: { get, post } }));

import { fetchUnverifiedOrgs, verifyOrganization } from "./verification.api";

describe("org verification API", () => {
  beforeEach(() => {
    get.mockReset();
    post.mockReset();
    get.mockResolvedValue({
      response: {
        data: [],
        pagination: {
          count: 0,
          totalPages: 1,
          isNext: false,
          isPrev: false,
          nextPage: null,
        },
      },
    });
    post.mockResolvedValue({});
  });

  it("sends the org_type filter", async () => {
    await fetchUnverifiedOrgs({
      pageIndex: 1,
      perPage: 10,
      org_type: "Company",
      sortBy: "-created_at",
    });
    const url = new URL(get.mock.calls[0][0], "http://x");
    expect(url.searchParams.get("org_type")).toBe("Company");
    expect(url.searchParams.get("sortBy")).toBe("-created_at");
  });

  it("posts a rejection with no org_id", async () => {
    await verifyOrganization("u1", { verified: false });
    expect(post).toHaveBeenCalledWith(
      "/api/v1/dashboard/organisation/verify/u1/",
      { verified: false },
      expect.anything(),
    );
  });
});
