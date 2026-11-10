import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/api/errors";

const { fetchCompanyOnboardingStatus, getEditableUserProfile, apiGet } =
  vi.hoisted(() => ({
    fetchCompanyOnboardingStatus: vi.fn(),
    getEditableUserProfile: vi.fn(),
    apiGet: vi.fn(),
  }));

vi.mock("@/features/auth/api/auth.api", () => ({
  fetchCompanyOnboardingStatus,
}));
vi.mock("@/features/profile/api/profile.api", () => ({
  getEditableUserProfile,
}));
vi.mock("@/api/client", () => ({
  apiClient: { get: apiGet },
  publicApiClient: { get: vi.fn() },
}));

import { fetchCompanyProfile, NoCompanyAccessError } from "./jobs.api";

describe("fetchCompanyProfile", () => {
  beforeEach(() => vi.clearAllMocks());

  it("reports a deactivated company instead of failing", async () => {
    fetchCompanyOnboardingStatus.mockResolvedValue({
      status: "deactivated",
      name: "Acme",
    });
    const profile = await fetchCompanyProfile();
    expect(profile.status).toBe("deactivated");
    expect(apiGet).not.toHaveBeenCalled();
  });

  it("loads the company for a co-admin or company mentor (no owner status)", async () => {
    fetchCompanyOnboardingStatus.mockRejectedValue(
      new ApiError(404, "Not Found", {}),
    );
    apiGet.mockResolvedValue({ response: { id: "c1", name: "Acme" } });
    const profile = await fetchCompanyProfile();
    expect(profile).toMatchObject({ id: "c1", status: "verified" });
  });

  it("throws NoCompanyAccessError when the user has no company", async () => {
    fetchCompanyOnboardingStatus.mockRejectedValue(
      new ApiError(404, "Not Found", {}),
    );
    apiGet.mockRejectedValue(new ApiError(404, "Not Found", {}));
    await expect(fetchCompanyProfile()).rejects.toBeInstanceOf(
      NoCompanyAccessError,
    );
  });

  it("keeps the owner's verified path", async () => {
    fetchCompanyOnboardingStatus.mockResolvedValue({ status: "verified" });
    apiGet.mockResolvedValue({ response: { id: "c1", name: "Acme" } });
    expect((await fetchCompanyProfile()).status).toBe("verified");
  });
});
