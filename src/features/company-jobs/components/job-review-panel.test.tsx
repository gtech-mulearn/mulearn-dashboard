import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  COMPANY_CAPABILITIES,
  type CompanyAccessRole,
} from "@/lib/auth/company-access";
import type { Job } from "../types";

const mocks = vi.hoisted(() => ({
  approveJob: vi.fn(),
  useCompanyAccess: vi.fn(),
}));
vi.mock("../api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../api")>()),
  approveJob: mocks.approveJob,
}));
vi.mock("../hooks/use-company-access", () => ({
  useCompanyAccess: mocks.useCompanyAccess,
}));
vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

import { isJobEditable, JobReviewPanel } from "./job-review-panel";

function wrapper({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider
      client={
        new QueryClient({ defaultOptions: { mutations: { retry: false } } })
      }
    >
      {children}
    </QueryClientProvider>
  );
}

const job = (over: Partial<Job>): Job =>
  ({
    id: "j1",
    title: "Frontend intern",
    status: "Active",
    created_at: "2026-11-01T10:00:00Z",
    updated_at: "2026-11-01T10:00:00Z",
    rules: [],
    ...over,
  }) as Job;

function show(j: Job, role: CompanyAccessRole = "owner") {
  mocks.useCompanyAccess.mockReturnValue({
    role,
    can: COMPANY_CAPABILITIES[role],
    isLoading: false,
  });
  render(<JobReviewPanel job={j} />, { wrapper });
}

describe("JobReviewPanel", () => {
  beforeEach(() => vi.clearAllMocks());

  it("shows the owner's revision note on a job sent back", () => {
    show(
      job({ status: "Needs Revision", rejection_reason: "Add a salary range" }),
      "company_mentor",
    );
    expect(screen.getByText("Owner's note")).toBeInTheDocument();
    expect(screen.getByText("Add a salary range")).toBeInTheDocument();
  });

  it("explains a rejection", () => {
    show(job({ status: "Rejected", rejection_reason: "Duplicate posting" }));
    expect(screen.getByText("Duplicate posting")).toBeInTheDocument();
  });

  it("lets an approver act on a pending job", async () => {
    mocks.approveJob.mockResolvedValue(undefined);
    show(job({ status: "Pending Approval" }), "co_admin");
    fireEvent.click(screen.getByRole("button", { name: /^approve$/i }));
    await waitFor(() => expect(mocks.approveJob).toHaveBeenCalledWith("j1"));
    expect(
      screen.getByRole("button", { name: /request changes/i }),
    ).toBeInTheDocument();
  });

  it("tells a company mentor their job is waiting for review", () => {
    show(job({ status: "Pending Approval" }), "company_mentor");
    expect(
      screen.queryByRole("button", { name: /^approve$/i }),
    ).not.toBeInTheDocument();
    expect(screen.getByText(/waiting for approval/i)).toBeInTheDocument();
  });

  it("shows who posted and approved the job", () => {
    show(
      job({
        created_by_name: "Mentor Mia",
        approved_by_name: "Owner Olu",
        approved_at: "2026-11-02T10:00:00Z",
      }),
    );
    expect(screen.getByText(/Posted by Mentor Mia/)).toBeInTheDocument();
    expect(screen.getByText(/Approved by Owner Olu/)).toBeInTheDocument();
  });
});

describe("isJobEditable", () => {
  it("blocks editing a rejected job (the backend returns 403)", () => {
    expect(isJobEditable("Rejected")).toBe(false);
    expect(isJobEditable("Needs Revision")).toBe(true);
    expect(isJobEditable("Active")).toBe(true);
  });
});
