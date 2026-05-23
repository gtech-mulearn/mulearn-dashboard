import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Badges } from "./badges";

vi.mock("../api/badges.api", () => ({
  getBadges: vi.fn().mockResolvedValue({
    full_name: "Test",
    completed_tasks: ["First Quest", "Second Quest"],
  }),
}));

function wrap(ui: React.ReactNode) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={qc}>{ui}</QueryClientProvider>;
}

describe("<Badges />", () => {
  it("renders earned task titles", async () => {
    render(wrap(<Badges muid="MU1" isOwnProfile />));
    await waitFor(() =>
      expect(screen.getByText("First Quest")).toBeInTheDocument(),
    );
    expect(screen.getByText("Second Quest")).toBeInTheDocument();
  });

  it("shows empty state when no badges", async () => {
    const { getBadges } = await import("../api/badges.api");
    // biome-ignore lint/suspicious/noExplicitAny: vitest mock cast
    (getBadges as any).mockResolvedValueOnce({
      full_name: "Test",
      completed_tasks: [],
    });
    render(wrap(<Badges muid="MU2" isOwnProfile />));
    await waitFor(() =>
      expect(screen.getByText(/No badges yet/i)).toBeInTheDocument(),
    );
  });
});
