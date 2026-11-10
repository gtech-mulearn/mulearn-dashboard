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
import { ApiError } from "@/api/errors";
import {
  COMPANY_CAPABILITIES,
  type CompanyAccessRole,
} from "@/lib/auth/company-access";

const mocks = vi.hoisted(() => ({
  inviteCompanyAdmin: vi.fn(),
  fetchCompanyAdminLinks: vi.fn(),
  useCompanyAccess: vi.fn(),
  useUserInfo: vi.fn(),
  toastError: vi.fn(),
  toastSuccess: vi.fn(),
}));

vi.mock("../../api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../api")>()),
  inviteCompanyAdmin: mocks.inviteCompanyAdmin,
  fetchCompanyAdminLinks: mocks.fetchCompanyAdminLinks,
}));
vi.mock("../../hooks/use-company-access", () => ({
  useCompanyAccess: mocks.useCompanyAccess,
}));
vi.mock("@/features/auth", () => ({ useUserInfo: mocks.useUserInfo }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
}));
vi.mock("sonner", () => ({
  toast: { error: mocks.toastError, success: mocks.toastSuccess },
}));

import { CompanyAdminsPageClient } from "./company-admins-client";

const CAP_MESSAGE =
  "You already have 5 accepted/pending delegates. Revoke one before inviting another.";

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

function viewAs(role: CompanyAccessRole, muid: string) {
  mocks.useCompanyAccess.mockReturnValue({
    role,
    can: COMPANY_CAPABILITIES[role],
    isLoading: false,
  });
  mocks.useUserInfo.mockReturnValue({ data: { muid } });
}

const row = (over: Record<string, unknown>) => ({
  id: "link-1",
  user_muid: "jane-doe@mulearn",
  user_name: "Jane Doe",
  status: "Accepted",
  invited_by_name: "Owner Person",
  invited_at: "2026-11-01T10:00:00Z",
  responded_at: "2026-11-02T09:30:00Z",
  revoked_by_name: null,
  revoked_at: null,
  ...over,
});

describe("CompanyAdminsPageClient", () => {
  beforeEach(() => vi.clearAllMocks());

  it("invites by muLearn ID and shows the backend's cap message verbatim", async () => {
    viewAs("owner", "owner@mulearn");
    mocks.fetchCompanyAdminLinks.mockResolvedValue([]);
    mocks.inviteCompanyAdmin.mockRejectedValue(
      new ApiError(429, CAP_MESSAGE, {
        hasError: true,
        statusCode: 429,
        message: { general: [CAP_MESSAGE] },
        response: {},
      }),
    );
    render(<CompanyAdminsPageClient />, { wrapper });

    fireEvent.click(
      screen.getAllByRole("button", { name: /invite co-admin/i })[0],
    );
    const field = await screen.findByLabelText("muLearn ID");
    expect(field).toHaveAttribute("placeholder", "name@mulearn");
    fireEvent.change(field, { target: { value: " jane-doe@mulearn " } });
    fireEvent.click(screen.getByRole("button", { name: /send invitation/i }));

    await waitFor(() =>
      expect(mocks.toastError).toHaveBeenCalledWith(CAP_MESSAGE),
    );
    expect(mocks.toastError).toHaveBeenCalledTimes(1);
    expect(mocks.inviteCompanyAdmin).toHaveBeenCalledWith("jane-doe@mulearn");
  });

  it("gives a co-admin only a Leave action on their own row", async () => {
    viewAs("co_admin", "jane-doe@mulearn");
    mocks.fetchCompanyAdminLinks.mockResolvedValue([
      row({}),
      row({
        id: "link-2",
        user_muid: "sam@mulearn",
        user_name: "Sam Roe",
      }),
      row({
        id: "link-3",
        user_muid: "pat@mulearn",
        user_name: "Pat Lee",
        status: "Pending",
        responded_at: null,
      }),
    ]);
    render(<CompanyAdminsPageClient />, { wrapper });

    const own = (await screen.findByText("Jane Doe")).closest("tr");
    expect(own).not.toBeNull();
    expect(
      within(own as HTMLElement).getByRole("button", { name: /leave/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /remove/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /invite co-admin/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /deactivate company/i }),
    ).not.toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /leave/i })).toHaveLength(1);
  });

  it("shows each backend status with its own badge", async () => {
    viewAs("owner", "owner@mulearn");
    mocks.fetchCompanyAdminLinks.mockResolvedValue([
      row({}),
      row({ id: "l2", user_name: "B", status: "Pending", responded_at: null }),
      row({ id: "l3", user_name: "C", status: "Declined" }),
      row({
        id: "l4",
        user_name: "D",
        status: "Revoked",
        revoked_by_name: "Owner Person",
        revoked_at: "2026-11-03T00:00:00Z",
      }),
    ]);
    render(<CompanyAdminsPageClient />, { wrapper });

    expect(await screen.findByText("Co-admin")).toBeInTheDocument();
    expect(screen.getByText("Invite pending")).toBeInTheDocument();
    expect(screen.getByText("Declined")).toBeInTheDocument();
    expect(screen.getByText("Revoked")).toBeInTheDocument();
    // Only the accepted row can be removed; the owner can cancel the pending one.
    expect(screen.getAllByRole("button", { name: /remove/i })).toHaveLength(1);
    expect(
      screen.getAllByRole("button", { name: /cancel invite/i }),
    ).toHaveLength(1);
  });
});
