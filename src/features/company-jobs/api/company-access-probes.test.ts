import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/api/errors";

const { apiGet } = vi.hoisted(() => ({ apiGet: vi.fn() }));
vi.mock("@/api/client", () => ({
  apiClient: { get: apiGet },
  publicApiClient: { get: vi.fn() },
}));

import { probeCompanyAdminAccess, probeCompanyMembership } from "./jobs.api";

describe("company membership probes", () => {
  beforeEach(() => vi.clearAllMocks());

  it("is a member when company/profile/ answers", async () => {
    apiGet.mockResolvedValue({ response: { id: "c1" } });
    await expect(probeCompanyMembership()).resolves.toBe(true);
  });

  it("is not a member on 404 or 403", async () => {
    apiGet.mockRejectedValueOnce(new ApiError(404, "Not Found", {}));
    await expect(probeCompanyMembership()).resolves.toBe(false);
    apiGet.mockRejectedValueOnce(new ApiError(403, "Forbidden", {}));
    await expect(probeCompanyMembership()).resolves.toBe(false);
  });

  it("does not trigger the 403 auth redirect while probing", async () => {
    apiGet.mockResolvedValue({ response: [] });
    await probeCompanyAdminAccess();
    expect(apiGet).toHaveBeenCalledWith(
      expect.stringContaining("/company/admin-link/list/"),
      undefined,
      expect.objectContaining({ skipAuthRedirectOn403: true }),
    );
  });

  it("can list admin links only as owner or accepted co-admin", async () => {
    apiGet.mockResolvedValueOnce({ response: [] });
    await expect(probeCompanyAdminAccess()).resolves.toBe(true);
    apiGet.mockRejectedValueOnce(new ApiError(403, "Forbidden", {}));
    await expect(probeCompanyAdminAccess()).resolves.toBe(false);
  });

  it("rethrows unexpected failures", async () => {
    apiGet.mockRejectedValue(new ApiError(500, "Server Error", {}));
    await expect(probeCompanyMembership()).rejects.toBeInstanceOf(ApiError);
  });
});
