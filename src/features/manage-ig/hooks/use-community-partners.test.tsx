import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const api = vi.hoisted(() => ({ fetchCommunityPartners: vi.fn() }));

vi.mock("../api/community-partner.api", () => ({
  fetchCommunityPartners: api.fetchCommunityPartners,
  createCommunityPartner: vi.fn(),
  updateCommunityPartner: vi.fn(),
  deleteCommunityPartner: vi.fn(),
}));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

import { useCommunityPartners } from "./use-community-partners";

function makeWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
}

describe("useCommunityPartners", () => {
  beforeEach(() => vi.clearAllMocks());

  it("reports a failed load instead of looking like an empty list", async () => {
    api.fetchCommunityPartners.mockImplementation(async () => {
      throw new Error("Network error");
    });
    const { result } = renderHook(() => useCommunityPartners("ig-1"), {
      wrapper: makeWrapper(),
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.partners).toEqual([]);
  });

  it("doesn't fetch every partner when there is no interest group yet", () => {
    renderHook(() => useCommunityPartners(""), { wrapper: makeWrapper() });
    expect(api.fetchCommunityPartners).not.toHaveBeenCalled();
  });
});
