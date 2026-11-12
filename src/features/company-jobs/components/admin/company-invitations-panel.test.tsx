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
  fetchMyCompanyInvitations: vi.fn(),
  respondCompanyAdminInvitation: vi.fn(),
}));
vi.mock("../../api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../api")>()),
  fetchMyCompanyInvitations: mocks.fetchMyCompanyInvitations,
  respondCompanyAdminInvitation: mocks.respondCompanyAdminInvitation,
}));
vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

import { CompanyInvitationsPanel } from "./company-invitations-panel";

function renderPanel() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return render(<CompanyInvitationsPanel />, { wrapper });
}

const invite = (id: string, company_name: string) => ({
  id,
  company_id: `co-${id}`,
  company_name,
  company_logo: null,
  invited_by_name: "Owner Olu",
  invited_at: "2026-11-01T10:00:00Z",
});

describe("CompanyInvitationsPanel", () => {
  beforeEach(() => vi.clearAllMocks());

  it("shows one card per invitation and accepts or declines it", async () => {
    mocks.fetchMyCompanyInvitations.mockResolvedValue([
      invite("l1", "Acme"),
      invite("l2", "Globex"),
    ]);
    mocks.respondCompanyAdminInvitation.mockResolvedValue(undefined);
    renderPanel();

    const acme = (await screen.findByText("Acme")).closest("li") as HTMLElement;
    expect(screen.getByText("Globex")).toBeInTheDocument();
    fireEvent.click(within(acme).getByRole("button", { name: /accept/i }));
    await waitFor(() =>
      expect(mocks.respondCompanyAdminInvitation).toHaveBeenCalledWith(
        "l1",
        true,
      ),
    );

    const globex = screen.getByText("Globex").closest("li") as HTMLElement;
    fireEvent.click(within(globex).getByRole("button", { name: /decline/i }));
    await waitFor(() =>
      expect(mocks.respondCompanyAdminInvitation).toHaveBeenCalledWith(
        "l2",
        false,
      ),
    );
  });

  it("renders nothing without invitations or when the lookup fails", async () => {
    mocks.fetchMyCompanyInvitations.mockRejectedValue(new Error("405"));
    const { container } = renderPanel();
    await waitFor(() =>
      expect(mocks.fetchMyCompanyInvitations).toHaveBeenCalled(),
    );
    expect(container).toBeEmptyDOMElement();
  });
});
