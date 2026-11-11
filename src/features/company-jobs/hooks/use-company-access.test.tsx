import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { probeCompanyMembership, probeCompanyAdminAccess, usePermissions } =
  vi.hoisted(() => ({
    probeCompanyMembership: vi.fn(),
    probeCompanyAdminAccess: vi.fn(),
    usePermissions: vi.fn(),
  }));

vi.mock("../api/jobs.api", () => ({
  probeCompanyMembership,
  probeCompanyAdminAccess,
}));
vi.mock("@/hooks/use-permissions", () => ({ usePermissions }));

import { useCompanyAccess } from "./use-company-access";

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

function asUser(roles: string[]) {
  usePermissions.mockReturnValue({
    roles,
    hasRole: (wanted: string[]) => wanted.some((r) => roles.includes(r)),
    isLoading: false,
  });
}

describe("useCompanyAccess", () => {
  beforeEach(() => vi.clearAllMocks());

  it("treats the Company role as owner without probing", async () => {
    asUser(["Company"]);
    const { result } = renderHook(() => useCompanyAccess(), { wrapper });
    expect(result.current.role).toBe("owner");
    expect(result.current.can.manageAdmins).toBe(true);
    expect(probeCompanyMembership).not.toHaveBeenCalled();
  });

  it("detects an accepted co-admin", async () => {
    asUser(["Student"]);
    probeCompanyMembership.mockResolvedValue(true);
    probeCompanyAdminAccess.mockResolvedValue(true);
    const { result } = renderHook(() => useCompanyAccess(), { wrapper });
    await waitFor(() => expect(result.current.role).toBe("co_admin"));
    expect(result.current.can.leaveAsAdmin).toBe(true);
  });

  it("detects a company mentor", async () => {
    asUser(["Mentor"]);
    probeCompanyMembership.mockResolvedValue(true);
    probeCompanyAdminAccess.mockResolvedValue(false);
    const { result } = renderHook(() => useCompanyAccess(), { wrapper });
    await waitFor(() => expect(result.current.role).toBe("company_mentor"));
  });

  it("finds no company and skips the admin probe", async () => {
    asUser(["Student"]);
    probeCompanyMembership.mockResolvedValue(false);
    const { result } = renderHook(() => useCompanyAccess(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.role).toBeNull();
    expect(result.current.can.createJobs).toBe(false);
    expect(probeCompanyAdminAccess).not.toHaveBeenCalled();
  });

  it("does nothing for signed-out visitors", () => {
    asUser([]);
    const { result } = renderHook(() => useCompanyAccess(), { wrapper });
    expect(result.current.role).toBeNull();
    expect(probeCompanyMembership).not.toHaveBeenCalled();
  });
});
