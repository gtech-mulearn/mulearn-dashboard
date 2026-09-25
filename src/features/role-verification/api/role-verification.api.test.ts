import { beforeEach, describe, expect, it, vi } from "vitest";

const { get } = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock("@/api/client", () => ({ apiClient: { get } }));

import { fetchRoleVerifications } from "./role-verification.api";

const lastUrl = () => new URL(get.mock.calls.at(-1)?.[0], "http://x");

describe("fetchRoleVerifications", () => {
  beforeEach(() => {
    get.mockReset();
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
  });

  it("sends the role filter UserVerificationAPI reads", async () => {
    await fetchRoleVerifications({
      pageIndex: 2,
      perPage: 25,
      role: "Enabler",
      sortBy: "-created_at",
    });
    const url = lastUrl();
    expect(url.pathname).toBe("/api/v1/dashboard/user/verification/");
    expect(url.searchParams.get("role")).toBe("Enabler");
    expect(url.searchParams.get("pageIndex")).toBe("2");
    expect(url.searchParams.get("perPage")).toBe("25");
    expect(url.searchParams.get("sortBy")).toBe("-created_at");
  });

  it("omits role when none is given", async () => {
    await fetchRoleVerifications({ pageIndex: 1, perPage: 10 });
    expect(lastUrl().searchParams.has("role")).toBe(false);
  });
});
