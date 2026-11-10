import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  fetchPendingIgSponsorships: vi.fn(),
  reviewIgSponsorship: vi.fn(),
}));
vi.mock("@/features/company-jobs/api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/features/company-jobs/api")>()),
  fetchPendingIgSponsorships: mocks.fetchPendingIgSponsorships,
  reviewIgSponsorship: mocks.reviewIgSponsorship,
}));
vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

import { PendingIgSponsorships } from "./pending-ig-sponsorships";

function renderSection() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return render(<PendingIgSponsorships />, { wrapper });
}

describe("PendingIgSponsorships (BE-3)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.reviewIgSponsorship.mockResolvedValue(undefined);
  });

  it("approves a request with { approve: true }", async () => {
    mocks.fetchPendingIgSponsorships.mockResolvedValue([
      {
        ig_id: "ig1",
        ig_name: "Web Development",
        company_id: "co1",
        company_name: "Acme",
        requested_at: "2026-11-01T10:00:00Z",
      },
    ]);
    renderSection();
    const row = (await screen.findByText("Web Development")).closest(
      "li",
    ) as HTMLElement;
    expect(within(row).getByText(/Acme/)).toBeInTheDocument();
    fireEvent.click(within(row).getByRole("button", { name: /approve/i }));
    await waitFor(() =>
      expect(mocks.reviewIgSponsorship).toHaveBeenCalledWith("ig1", {
        approve: true,
      }),
    );
  });

  it("rejects after confirming, with { approve: false }", async () => {
    mocks.fetchPendingIgSponsorships.mockResolvedValue([
      {
        ig_id: "ig2",
        ig_name: "AI",
        company_id: "co2",
        company_name: "Globex",
        requested_at: "2026-11-02T10:00:00Z",
      },
    ]);
    renderSection();
    const row = (await screen.findByText("AI")).closest("li") as HTMLElement;
    fireEvent.click(within(row).getByRole("button", { name: /reject/i }));
    const dialog = await screen.findByTestId("confirm-dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: /^reject$/i }));
    await waitFor(() =>
      expect(mocks.reviewIgSponsorship).toHaveBeenCalledWith("ig2", {
        approve: false,
      }),
    );
  });

  it("stays out of the way when nothing is pending", async () => {
    mocks.fetchPendingIgSponsorships.mockResolvedValue([]);
    const { container } = renderSection();
    await waitFor(() =>
      expect(mocks.fetchPendingIgSponsorships).toHaveBeenCalled(),
    );
    expect(container).toBeEmptyDOMElement();
  });
});
