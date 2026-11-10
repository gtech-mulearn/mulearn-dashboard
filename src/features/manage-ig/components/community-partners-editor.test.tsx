import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const api = vi.hoisted(() => ({
  fetchCommunityPartners: vi.fn(),
  createCommunityPartner: vi.fn(),
}));
const toast = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }));

vi.mock("../api/community-partner.api", () => ({
  fetchCommunityPartners: api.fetchCommunityPartners,
  createCommunityPartner: api.createCommunityPartner,
  updateCommunityPartner: vi.fn(),
  deleteCommunityPartner: vi.fn(),
}));
vi.mock("sonner", () => ({ toast }));

import { CommunityPartnersEditor } from "./edit-interest-group-form";

function renderEditor() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <CommunityPartnersEditor igId="ig-1" />
    </QueryClientProvider>,
  );
}

describe("CommunityPartnersEditor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.fetchCommunityPartners.mockResolvedValue({ data: [] });
  });

  it("says the partners couldn't load instead of showing an empty list", async () => {
    api.fetchCommunityPartners.mockRejectedValue(new Error("boom"));
    renderEditor();
    expect(
      await screen.findByText(/couldn't load community partners/i),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/no community partners linked yet/i),
    ).not.toBeInTheDocument();
  });

  it("explains a failed create and keeps the form open", async () => {
    api.createCommunityPartner.mockRejectedValue(
      new Error("Partner name already exists"),
    );
    renderEditor();
    fireEvent.click(await screen.findByRole("button", { name: /add/i }));
    fireEvent.change(screen.getByPlaceholderText("Partner name *"), {
      target: { value: "Acme" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create Partner" }));

    await waitFor(() => expect(toast.error).toHaveBeenCalledTimes(1));
    expect(toast.error.mock.calls[0][0]).toMatch(/already exists/i);
    expect(screen.getByPlaceholderText("Partner name *")).toBeInTheDocument();
  });
});
