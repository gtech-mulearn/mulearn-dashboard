import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Plug } from "lucide-react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { getFeatureFlag, setFeatureFlag } = vi.hoisted(() => ({
  getFeatureFlag: vi.fn(),
  setFeatureFlag: vi.fn(),
}));

vi.mock("../api", () => ({ getFeatureFlag, setFeatureFlag }));

import { FeatureFlagItem } from "./feature-flag-item";

function renderItem() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  render(
    <QueryClientProvider client={client}>
      <FeatureFlagItem
        slug="futuremug"
        title="Futuremug"
        description="Assessments and interviews for students, companies and colleges, through Futuremug."
        icon={Plug}
        accentClassName="bg-sky-500/15 text-sky-600"
      />
    </QueryClientProvider>,
  );
}

describe("FeatureFlagItem", () => {
  beforeEach(() => {
    getFeatureFlag.mockReset();
    setFeatureFlag.mockReset();
  });

  it("shows the flag state", async () => {
    getFeatureFlag.mockResolvedValue({ enabled: true, configured: true });
    renderItem();
    expect(await screen.findByText("Enabled")).toBeInTheDocument();
    expect(screen.getByRole("switch", { name: "Futuremug" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    expect(getFeatureFlag).toHaveBeenCalledWith("futuremug");
  });

  it("toggling saves the new state", async () => {
    getFeatureFlag.mockResolvedValue({ enabled: false, configured: true });
    setFeatureFlag.mockResolvedValue({ enabled: true });
    renderItem();
    await screen.findByText("Disabled");
    fireEvent.click(screen.getByRole("switch", { name: "Futuremug" }));
    await waitFor(() =>
      expect(setFeatureFlag).toHaveBeenCalledWith("futuremug", true),
    );
    expect(await screen.findByText("Enabled")).toBeInTheDocument();
  });

  it("an unconfigured flag says so and cannot be switched on", async () => {
    getFeatureFlag.mockResolvedValue({ enabled: false, configured: false });
    renderItem();
    expect(await screen.findByText("Not configured")).toBeInTheDocument();
    const toggle = screen.getByRole("switch", { name: "Futuremug" });
    expect(toggle).toBeDisabled();
    fireEvent.click(toggle);
    expect(setFeatureFlag).not.toHaveBeenCalled();
  });
});
